const { User } = require('../models');
const { getRedisClient } = require('./streaming.service');
const logger = require('../utils/logger');

/**
 * Sessions service for managing shared listening sessions
 */
const sessionsService = {
    /**
     * Initialize a new session in Redis
     * @param {string} sessionId - Session ID
     * @param {string} hostId - Host user ID
     */
    initializeSession: async (sessionId, hostId) => {
        try {
            const redis = await getRedisClient();

            // Create session hash with initial values
            await redis.hSet(`session:${sessionId}`, {
                hostId,
                currentTrackId: '',
                currentPosition: 0,
                isPlaying: false,
                lastUpdate: Date.now()
            });

            // Initialize empty participants set
            await redis.sAdd(`session:${sessionId}:participants`, hostId);

            // Initialize empty message list
            await redis.lPush(`session:${sessionId}:messages`, JSON.stringify({
                id: Date.now().toString(),
                sessionId,
                type: 'system',
                content: 'Session started',
                timestamp: new Date().toISOString()
            }));

            // Set expiry for session data (24 hours)
            await redis.expire(`session:${sessionId}`, 60 * 60 * 24);
            await redis.expire(`session:${sessionId}:participants`, 60 * 60 * 24);
            await redis.expire(`session:${sessionId}:messages`, 60 * 60 * 24);

            logger.debug(`Session ${sessionId} initialized for host ${hostId}`);
        } catch (error) {
            logger.error('Initialize session error:', error);
            throw error;
        }
    },

    /**
     * Get session details from Redis
     * @param {string} sessionId - Session ID
     * @returns {Object} Session details
     */
    getSessionDetails: async (sessionId) => {
        try {
            const redis = await getRedisClient();

            // Get session data from Redis
            const sessionData = await redis.hGetAll(`session:${sessionId}`);

            if (!sessionData || Object.keys(sessionData).length === 0) {
                throw new Error('Session not found in Redis');
            }

            return {
                hostId: sessionData.hostId,
                currentTrackId: sessionData.currentTrackId,
                currentPosition: parseInt(sessionData.currentPosition, 10) || 0,
                isPlaying: sessionData.isPlaying === 'true',
                lastUpdate: parseInt(sessionData.lastUpdate, 10) || 0
            };
        } catch (error) {
            logger.error(`Get session details error for ${sessionId}:`, error);
            // Return empty object as fallback
            return {
                currentPosition: 0,
                isPlaying: false
            };
        }
    },

    /**
     * Add a participant to a session
     * @param {string} sessionId - Session ID
     * @param {string} userId - User ID
     */
    addParticipant: async (sessionId, userId) => {
        try {
            const redis = await getRedisClient();

            // Add user to participants set
            await redis.sAdd(`session:${sessionId}:participants`, userId);

            logger.debug(`User ${userId} added to session ${sessionId}`);
        } catch (error) {
            logger.error('Add participant error:', error);
            throw error;
        }
    },

    /**
     * Remove a participant from a session
     * @param {string} sessionId - Session ID
     * @param {string} userId - User ID
     */
    removeParticipant: async (sessionId, userId) => {
        try {
            const redis = await getRedisClient();

            // Remove user from participants set
            await redis.sRem(`session:${sessionId}:participants`, userId);

            logger.debug(`User ${userId} removed from session ${sessionId}`);
        } catch (error) {
            logger.error('Remove participant error:', error);
            throw error;
        }
    },

    /**
     * Check if a user is a participant in a session
     * @param {string} sessionId - Session ID
     * @param {string} userId - User ID
     * @returns {boolean} True if user is a participant
     */
    isParticipant: async (sessionId, userId) => {
        try {
            const redis = await getRedisClient();

            // Check if user is in participants set
            const isMember = await redis.sIsMember(`session:${sessionId}:participants`, userId);

            return isMember;
        } catch (error) {
            logger.error('Is participant error:', error);
            return false;
        }
    },

    /**
     * Get all participants in a session with user details
     * @param {string} sessionId - Session ID
     * @returns {Array} List of participants with details
     */
    getParticipants: async (sessionId) => {
        try {
            const redis = await getRedisClient();

            // Get participant IDs from Redis
            const participantIds = await redis.sMembers(`session:${sessionId}:participants`);

            if (!participantIds || participantIds.length === 0) {
                return [];
            }

            // Get session details to identify host
            const sessionDetails = await sessionsService.getSessionDetails(sessionId);

            // Get user details from database
            const participants = await User.findAll({
                where: { id: participantIds },
                attributes: ['id', 'username', 'profileImage']
            });

            // Add isHost flag to each participant
            return participants.map(participant => ({
                id: participant.id,
                username: participant.username,
                profileImage: participant.profileImage,
                isHost: participant.id === sessionDetails.hostId
            }));
        } catch (error) {
            logger.error('Get participants error:', error);
            return [];
        }
    },

    /**
     * Update the current track in a session
     * @param {string} sessionId - Session ID
     * @param {string} trackId - Track ID
     * @param {string} trackTitle - Track title (for notifications)
     * @param {string} artistName - Artist name (for notifications)
     */
    updateSessionTrack: async (sessionId, trackId, trackTitle, artistName) => {
        try {
            const redis = await getRedisClient();

            // Update session hash in Redis
            await redis.hSet(`session:${sessionId}`, {
                currentTrackId: trackId,
                currentPosition: 0,
                isPlaying: true,
                lastUpdate: Date.now()
            });

            // Add system message
            await redis.lPush(`session:${sessionId}:messages`, JSON.stringify({
                id: Date.now().toString(),
                sessionId,
                type: 'system',
                content: `Now playing: "${trackTitle}" by ${artistName}`,
                timestamp: new Date().toISOString()
            }));

            logger.debug(`Session ${sessionId} track updated to ${trackId}`);
        } catch (error) {
            logger.error('Update session track error:', error);
            throw error;
        }
    },

    /**
     * Update the current playback position in a session
     * @param {string} sessionId - Session ID
     * @param {number} position - Position in seconds
     */
    updateSessionPosition: async (sessionId, position) => {
        try {
            const redis = await getRedisClient();

            // Update session hash in Redis
            await redis.hSet(`session:${sessionId}`, {
                currentPosition: position,
                lastUpdate: Date.now()
            });

            logger.debug(`Session ${sessionId} position updated to ${position}s`);
        } catch (error) {
            logger.error('Update session position error:', error);
            throw error;
        }
    },

    /**
     * Update playback state (play/pause) in a session
     * @param {string} sessionId - Session ID
     * @param {boolean} isPlaying - Playback state
     */
    updateSessionPlayback: async (sessionId, isPlaying) => {
        try {
            const redis = await getRedisClient();

            // Update session hash in Redis
            await redis.hSet(`session:${sessionId}`, {
                isPlaying: isPlaying.toString(),
                lastUpdate: Date.now()
            });

            // Add system message
            await redis.lPush(`session:${sessionId}:messages`, JSON.stringify({
                id: Date.now().toString(),
                sessionId,
                type: 'system',
                content: isPlaying ? 'Playback resumed' : 'Playback paused',
                timestamp: new Date().toISOString()
            }));

            logger.debug(`Session ${sessionId} playback state updated to ${isPlaying}`);
        } catch (error) {
            logger.error('Update session playback error:', error);
            throw error;
        }
    },

    /**
     * Save a chat message in Redis
     * @param {string} sessionId - Session ID
     * @param {Object} message - Message object
     */
    saveMessage: async (sessionId, message) => {
        try {
            const redis = await getRedisClient();

            // Add message to list
            await redis.lPush(`session:${sessionId}:messages`, JSON.stringify(message));

            // Trim list to prevent excessive memory usage (keep last 100 messages)
            await redis.lTrim(`session:${sessionId}:messages`, 0, 99);

            logger.debug(`Message saved for session ${sessionId}`);
        } catch (error) {
            logger.error('Save message error:', error);
            throw error;
        }
    },

    /**
     * Get all chat messages for a session
     * @param {string} sessionId - Session ID
     * @returns {Array} List of messages
     */
    getMessages: async (sessionId) => {
        try {
            const redis = await getRedisClient();

            // Get all messages from list
            const messages = await redis.lRange(`session:${sessionId}:messages`, 0, -1);

            // Parse messages
            return messages.map(msg => JSON.parse(msg)).reverse();
        } catch (error) {
            logger.error('Get messages error:', error);
            return [];
        }
    },

    /**
     * Get recent chat messages for a session (last 20)
     * @param {string} sessionId - Session ID
     * @returns {Array} List of recent messages
     */
    getRecentMessages: async (sessionId) => {
        try {
            const redis = await getRedisClient();

            // Get recent messages from list
            const messages = await redis.lRange(`session:${sessionId}:messages`, 0, 19);

            // Parse messages
            return messages.map(msg => JSON.parse(msg)).reverse();
        } catch (error) {
            logger.error('Get recent messages error:', error);
            return [];
        }
    },

    /**
     * Broadcast a message to all participants in a session
     * This would be implemented with WebSockets in a real application
     * @param {string} sessionId - Session ID
     * @param {Object} message - Message to broadcast
     */
    broadcastMessage: async (sessionId, message) => {
        try {
            // In a real implementation, this would use WebSockets to broadcast to all connected clients
            // For this example, we'll just log the message
            logger.debug(`Broadcasting to session ${sessionId}: ${JSON.stringify(message)}`);

            // If it's a chat message, save it
            if (message.type === 'chat') {
                await sessionsService.saveMessage(sessionId, message.content);
            }

            // If it's a system message, save it as a message
            if (message.type === 'system') {
                await sessionsService.saveMessage(sessionId, {
                    id: Date.now().toString(),
                    sessionId,
                    type: 'system',
                    content: message.content,
                    timestamp: new Date().toISOString()
                });
            }

            // In a real app, we would send this to a WebSocket server:
            // socketServer.to(sessionId).emit('message', message);
        } catch (error) {
            logger.error('Broadcast message error:', error);
            // Don't throw error here to prevent cascading failures
        }
    },

    /**
     * Clean up session data in Redis when session ends
     * @param {string} sessionId - Session ID
     */
    cleanupSession: async (sessionId) => {
        try {
            const redis = await getRedisClient();

            // We don't delete the data immediately to allow for history viewing
            // Instead, set a shorter expiry time
            await redis.expire(`session:${sessionId}`, 60 * 60 * 2); // 2 hours
            await redis.expire(`session:${sessionId}:participants`, 60 * 60 * 2);
            await redis.expire(`session:${sessionId}:messages`, 60 * 60 * 2);

            logger.debug(`Session ${sessionId} cleanup scheduled`);
        } catch (error) {
            logger.error('Cleanup session error:', error);
            // Don't throw error here to prevent cascading failures
        }
    }
};

module.exports = {
    sessionsService
};