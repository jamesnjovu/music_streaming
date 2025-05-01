const { sequelize, Track, Artist, Genre } = require('../models');
const { getRedisClient } = require('./streaming.service');
const logger = require('../utils/logger');

/**
 * Recommendation service for music recommendations
 */
const recommendationService = {
    /**
     * Update user preferences based on completed track plays
     * @param {string} userId - User ID
     * @param {string} trackId - Track ID
     */
    updateUserPreferences: async (userId, trackId) => {
        try {
            // Get track details including genre and artist
            const track = await Track.findByPk(trackId, {
                include: [
                    { model: Artist },
                    { model: Genre }
                ]
            });

            if (!track) {
                return;
            }

            const redis = await getRedisClient();

            // Update genre preferences
            for (const genre of track.Genres) {
                // Increment genre score in sorted set
                await redis.zIncrBy(`user:${userId}:genre_preferences`, 1, genre.id);
            }

            // Update artist preferences
            if (track.Artist) {
                await redis.zIncrBy(`user:${userId}:artist_preferences`, 1, track.Artist.id);
            }

            // Set expiry for preference keys to prevent excessive memory usage
            await redis.expire(`user:${userId}:genre_preferences`, 60 * 60 * 24 * 90); // 90 days
            await redis.expire(`user:${userId}:artist_preferences`, 60 * 60 * 24 * 90); // 90 days

            logger.debug(`User preferences updated for user ${userId}, track ${trackId}`);
        } catch (error) {
            logger.error('Error updating user preferences:', error);
        }
    },

    /**
     * Get personalized recommendations for a user
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of recommendations
     * @returns {Array} Recommended tracks
     */
    getRecommendations: async (userId, limit = 20) => {
        try {
            const redis = await getRedisClient();

            // Get user's top genres (with weights)
            const topGenres = await redis.zRevRangeWithScores(`user:${userId}:genre_preferences`, 0, 4);

            // Get user's top artists (with weights)
            const topArtists = await redis.zRevRangeWithScores(`user:${userId}:artist_preferences`, 0, 4);

            // Get user's recently played tracks to exclude them
            const recentTracks = await redis.zRevRange(`user:${userId}:recent_plays`, 0, 49);

            // Build recommendation query based on user preferences
            let query = `
        SELECT 
          t.id, 
          t.title, 
          t."coverImage", 
          t.duration,
          a.id as "artistId", 
          a.name as "artistName",
          `;

            // Calculate relevance score based on genre and artist preferences
            let relevanceScore = '0';

            // Add genre relevance
            if (topGenres.length > 0) {
                let genreScore = 'CASE ';
                for (const [i, genre] of topGenres.entries()) {
                    // Add weight based on genre preference score
                    genreScore += `WHEN g.id = '${genre.value}' THEN ${genre.score * (5 - i)} `;
                }
                genreScore += 'ELSE 0 END';

                relevanceScore += ` + ${genreScore}`;
            }

            // Add artist relevance
            if (topArtists.length > 0) {
                let artistScore = 'CASE ';
                for (const [i, artist] of topArtists.entries()) {
                    // Add weight based on artist preference score
                    artistScore += `WHEN a.id = '${artist.value}' THEN ${artist.score * (5 - i)} `;
                }
                artistScore += 'ELSE 0 END';

                relevanceScore += ` + ${artistScore}`;
            }

            // Add popularity factor (play count with less weight)
            relevanceScore += ` + (t."playCount" * 0.01)`;

            // Finalize query
            query += `${relevanceScore} as relevance
        FROM "Tracks" t
        JOIN "Artists" a ON t."artistId" = a.id
        JOIN "TrackGenres" tg ON t.id = tg."TrackId"
        JOIN "Genres" g ON tg."GenreId" = g.id
        WHERE 1=1
      `;

            // Exclude recently played tracks
            if (recentTracks.length > 0) {
                query += ' AND t.id NOT IN (:recentTracks)';
            }

            // Group by track ID, limit, and order by relevance
            query += `
        GROUP BY t.id, a.id, a.name
        ORDER BY relevance DESC, t."playCount" DESC
        LIMIT :limit
      `;

            // Execute query
            const recommendations = await sequelize.query(query, {
                replacements: {
                    recentTracks: recentTracks.length > 0 ? recentTracks : [''],
                    limit
                },
                type: sequelize.QueryTypes.SELECT
            });

            return recommendations;
        } catch (error) {
            logger.error('Error getting recommendations:', error);

            // Fallback to popular tracks if recommendation fails
            return recommendationService.getPopularTracks(limit);
        }
    },

    /**
     * Get similar tracks based on a reference track
     * @param {string} trackId - Reference track ID
     * @param {number} limit - Maximum number of similar tracks
     * @returns {Array} Similar tracks
     */
    getSimilarTracks: async (trackId, limit = 10) => {
        try {
            // Get reference track details
            const track = await Track.findByPk(trackId, {
                include: [
                    { model: Artist },
                    { model: Genre }
                ]
            });

            if (!track) {
                throw new Error('Track not found');
            }

            // Get genre IDs from the reference track
            const genreIds = track.Genres.map(g => g.id);

            // Find tracks with similar genres and same artist
            const similarTracks = await sequelize.query(
                `SELECT 
          t.id, 
          t.title, 
          t."coverImage", 
          t.duration,
          a.id as "artistId", 
          a.name as "artistName",
          COUNT(DISTINCT g.id) as genre_match_count
        FROM "Tracks" t
        JOIN "Artists" a ON t."artistId" = a.id
        JOIN "TrackGenres" tg ON t.id = tg."TrackId"
        JOIN "Genres" g ON tg."GenreId" = g.id
        WHERE t.id != :trackId
        AND (a.id = :artistId OR g.id IN (:genreIds))
        GROUP BY t.id, a.id, a.name
        ORDER BY 
          CASE WHEN a.id = :artistId THEN 1 ELSE 0 END DESC,
          genre_match_count DESC,
          t."playCount" DESC
        LIMIT :limit`,
                {
                    replacements: {
                        trackId,
                        artistId: track.Artist ? track.Artist.id : '',
                        genreIds: genreIds.length > 0 ? genreIds : [''],
                        limit
                    },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return similarTracks;
        } catch (error) {
            logger.error('Error getting similar tracks:', error);

            // Fallback to popular tracks if similar tracks query fails
            return recommendationService.getPopularTracks(limit);
        }
    },

    /**
     * Get most popular tracks
     * @param {number} limit - Maximum number of tracks
     * @returns {Array} Popular tracks
     */
    getPopularTracks: async (limit = 20) => {
        try {
            const popularTracks = await sequelize.query(
                `SELECT 
          t.id, 
          t.title, 
          t."coverImage", 
          t.duration,
          a.id as "artistId", 
          a.name as "artistName",
          t."playCount"
        FROM "Tracks" t
        JOIN "Artists" a ON t."artistId" = a.id
        ORDER BY t."playCount" DESC
        LIMIT :limit`,
                {
                    replacements: { limit },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return popularTracks;
        } catch (error) {
            logger.error('Error getting popular tracks:', error);
            throw error;
        }
    },

    /**
     * Generate Daily Mix playlists based on user preferences
     * @param {string} userId - User ID
     * @param {number} mixCount - Number of mixes to generate
     * @returns {Array} Generated Daily Mix playlists
     */
    generateDailyMixes: async (userId, mixCount = 3) => {
        try {
            const redis = await getRedisClient();

            // Get user's top genres with scores
            const allGenres = await redis.zRevRangeWithScores(`user:${userId}:genre_preferences`, 0, -1);

            // If no genre preferences, fallback to popular tracks
            if (allGenres.length === 0) {
                const popularTracks = await recommendationService.getPopularTracks(30);
                return [{
                    name: 'Daily Mix 1',
                    description: 'Popular tracks you might enjoy',
                    tracks: popularTracks
                }];
            }

            // Group genres into clusters for different mixes
            const genreClusters = [];
            const maxMixes = Math.min(mixCount, Math.ceil(allGenres.length / 2));

            for (let i = 0; i < maxMixes; i++) {
                genreClusters.push(allGenres.slice(i * 2, (i + 1) * 2).map(g => g.value));
            }

            // Generate a mix for each genre cluster
            const mixes = await Promise.all(genreClusters.map(async (genreIds, index) => {
                // Get tracks matching these genres
                const tracks = await sequelize.query(
                    `SELECT 
            t.id, 
            t.title, 
            t."coverImage", 
            t.duration,
            a.id as "artistId", 
            a.name as "artistName"
          FROM "Tracks" t
          JOIN "Artists" a ON t."artistId" = a.id
          JOIN "TrackGenres" tg ON t.id = tg."TrackId"
          WHERE tg."GenreId" IN (:genreIds)
          GROUP BY t.id, a.id, a.name
          ORDER BY t."playCount" DESC
          LIMIT 15`,
                    {
                        replacements: { genreIds },
                        type: sequelize.QueryTypes.SELECT
                    }
                );

                // Get genre names for description
                const genreNames = await sequelize.query(
                    `SELECT name FROM "Genres" WHERE id IN (:genreIds)`,
                    {
                        replacements: { genreIds },
                        type: sequelize.QueryTypes.SELECT
                    }
                );

                const description = genreNames.length > 0
                    ? `A mix of ${genreNames.map(g => g.name).join(', ')} music for you`
                    : 'A personalized mix based on your listening';

                return {
                    name: `Daily Mix ${index + 1}`,
                    description,
                    tracks
                };
            }));

            return mixes;
        } catch (error) {
            logger.error('Error generating daily mixes:', error);

            // Fallback to a single mix of popular tracks
            const popularTracks = await recommendationService.getPopularTracks(15);
            return [{
                name: 'Daily Mix 1',
                description: 'Popular tracks you might enjoy',
                tracks: popularTracks
            }];
        }
    }
};

module.exports = {
    recommendationService
};