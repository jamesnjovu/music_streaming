const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { createClient } = require('redis');
const logger = require('../utils/logger');
const { redisConfig } = require('../config/database');

// Redis client for caching and analytics
let redisClient;

/**
 * Initialize Redis client
 */
const initRedisClient = async () => {
  try {
    redisClient = createClient(redisConfig);
    
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
    });
    
    await redisClient.connect();
    logger.info('Redis client connected');
    
    return redisClient;
  } catch (error) {
    logger.error('Redis client initialization failed:', error);
    throw error;
  }
};

/**
 * Get Redis client (initializes if not already connected)
 */
const getRedisClient = async () => {
  if (!redisClient || !redisClient.isReady) {
    await initRedisClient();
  }
  return redisClient;
};

// Export the module
module.exports = {
  // Streaming service methods
  streamingService: {
    /**
     * Log a track play event
     * @param {string} userId - User ID
     * @param {string} trackId - Track ID
     */
    logPlay: async (userId, trackId) => {
      try {
        // Log play in database for analytics
        await sequelize.query(
          `INSERT INTO "PlayHistory" ("userId", "trackId", "playedAt") 
           VALUES (:userId, :trackId, NOW())`,
          {
            replacements: { userId, trackId },
            type: sequelize.QueryTypes.INSERT
          }
        );
        
        // Store recent plays in Redis for quick access
        const redis = await getRedisClient();
        
        // Add to user's recent plays list
        await redis.zAdd(`user:${userId}:recent_plays`, {
          score: Date.now(),
          value: trackId
        });
        
        // Trim the list to keep only the most recent 100 plays
        await redis.zRemRangeByRank(`user:${userId}:recent_plays`, 0, -101);
        
        // Increment track play count in Redis
        await redis.incr(`track:${trackId}:play_count`);
        
        // Set expiry for Redis keys to prevent excessive memory usage
        await redis.expire(`track:${trackId}:play_count`, 60 * 60 * 24 * 7); // 7 days
        
        logger.debug(`Play logged for user ${userId}, track ${trackId}`);
      } catch (error) {
        logger.error('Error logging play:', error);
        // Continue execution even if logging fails
      }
    },
    
    /**
     * Log a track download event
     * @param {string} userId - User ID
     * @param {string} trackId - Track ID
     */
    logDownload: async (userId, trackId) => {
      try {
        // Log download in database for analytics
        await sequelize.query(
          `INSERT INTO "DownloadHistory" ("userId", "trackId", "downloadedAt") 
           VALUES (:userId, :trackId, NOW())`,
          {
            replacements: { userId, trackId },
            type: sequelize.QueryTypes.INSERT
          }
        );
        
        // Increment download count in Redis
        const redis = await getRedisClient();
        await redis.incr(`track:${trackId}:download_count`);
        
        logger.debug(`Download logged for user ${userId}, track ${trackId}`);
      } catch (error) {
        logger.error('Error logging download:', error);
        // Continue execution even if logging fails
      }
    },
    
    /**
     * Log track progress for analytics and recommendations
     * @param {string} userId - User ID
     * @param {string} trackId - Track ID
     * @param {number} position - Current position in seconds
     * @param {boolean} completed - Whether the track was played to completion
     */
    logProgress: async (userId, trackId, position, completed) => {
      try {
        // Store progress in Redis for resuming playback
        const redis = await getRedisClient();
        
        // Store the current position
        await redis.set(`user:${userId}:track:${trackId}:position`, position);
        
        // Set expiry for the position key
        await redis.expire(`user:${userId}:track:${trackId}:position`, 60 * 60 * 24 * 30); // 30 days
        
        // If the track was completed, log it
        if (completed) {
          await sequelize.query(
            `INSERT INTO "CompletedPlays" ("userId", "trackId", "completedAt") 
             VALUES (:userId, :trackId, NOW())`,
            {
              replacements: { userId, trackId },
              type: sequelize.QueryTypes.INSERT
            }
          );
        }
        
        logger.debug(`Progress logged for user ${userId}, track ${trackId}, position ${position}, completed ${completed}`);
      } catch (error) {
        logger.error('Error logging progress:', error);
      }
    },
    
    /**
     * Get a user's listening history
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of items to return
     * @param {number} offset - Offset for pagination
     * @returns {Array} Listening history
     */
    getListeningHistory: async (userId, limit = 20, offset = 0) => {
      try {
        // Get listening history from database
        const history = await sequelize.query(
          `SELECT ph."trackId", t.title, t."coverImage", a.name as "artistName", ph."playedAt"
           FROM "PlayHistory" ph
           JOIN "Tracks" t ON ph."trackId" = t.id
           JOIN "Artists" a ON t."artistId" = a.id
           WHERE ph."userId" = :userId
           ORDER BY ph."playedAt" DESC
           LIMIT :limit OFFSET :offset`,
          {
            replacements: { userId, limit, offset },
            type: sequelize.QueryTypes.SELECT
          }
        );
        
        return history;
      } catch (error) {
        logger.error('Error getting listening history:', error);
        throw error;
      }
    },
    
    /**
     * Get a user's recent tracks for resuming playback
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of items to return
     * @returns {Array} Recent tracks with position information
     */
    getRecentTracks: async (userId, limit = 10) => {
      try {
        const redis = await getRedisClient();
        
        // Get recent plays from Redis
        const recentTrackIds = await redis.zRevRange(`user:${userId}:recent_plays`, 0, limit - 1);
        
        if (!recentTrackIds.length) {
          return [];
        }
        
        // Get track details from database
        const tracks = await sequelize.query(
          `SELECT t.id, t.title, t."coverImage", a.name as "artistName", a.id as "artistId", t.duration
           FROM "Tracks" t
           JOIN "Artists" a ON t."artistId" = a.id
           WHERE t.id IN (:trackIds)`,
          {
            replacements: { trackIds: recentTrackIds },
            type: sequelize.QueryTypes.SELECT
          }
        );
        
        // Get playback positions from Redis
        const tracksWithPosition = await Promise.all(
          tracks.map(async (track) => {
            const position = await redis.get(`user:${userId}:track:${track.id}:position`);
            return {
              ...track,
              position: position ? parseInt(position, 10) : 0
            };
          })
        );
        
        // Sort tracks in the same order as recentTrackIds
        return tracksWithPosition.sort((a, b) => {
          return recentTrackIds.indexOf(a.id) - recentTrackIds.indexOf(b.id);
        });
      } catch (error) {
        logger.error('Error getting recent tracks:', error);
        throw error;
      }
    }
  },
  
  // Export the Redis client methods
  getRedisClient,
  initRedisClient
};