const { ListeningSession, User, Track, Artist } = require('../../models');
const { sessionsService } = require('../../services/sessions.service');
const { getRedisClient } = require('../../services/streaming.service');
const logger = require('../../utils/logger');
const { createError } = require('../../middlewares/errorHandler');

/**
 * Create a new listening session
 */
exports.createSession = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    // Create session in database
    const session = await ListeningSession.create({
      name,
      isActive: true,
      hostId: userId
    });

    // Initialize session in Redis
    await sessionsService.initializeSession(session.id, userId);

    // Add host as a participant
    await sessionsService.addParticipant(session.id, userId);

    res.status(201).json({
      message: 'Session created successfully',
      session: {
        id: session.id,
        name: session.name,
        isActive: session.isActive,
        hostId: userId,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    logger.error('Create session error:', error);
    next(error);
  }
};

/**
 * Get all active sessions
 */
exports.getAllSessions = async (req, res, next) => {
  try {
    // Get active sessions with participant count
    const sessions = await ListeningSession.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username', 'profileImage']
        },
        {
          model: Track,
          attributes: ['id', 'title', 'duration', 'coverImage'],
          include: {
            model: Artist,
            attributes: ['id', 'name']
          }
        }
      ]
    });

    // Get participant counts for each session
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => {
        const participants = await sessionsService.getParticipants(session.id);
        
        return {
          id: session.id,
          name: session.name,
          hostId: session.hostId,
          host: session.host ? {
            id: session.host.id,
            username: session.host.username,
            profileImage: session.host.profileImage
          } : null,
          currentTrack: session.Track ? {
            id: session.Track.id,
            title: session.Track.title,
            duration: session.Track.duration,
            coverImage: session.Track.coverImage,
            artist: session.Track.Artist ? {
              id: session.Track.Artist.id,
              name: session.Track.Artist.name
            } : null
          } : null,
          participantCount: participants.length,
          createdAt: session.createdAt
        };
      })
    );

    res.status(200).json({
      sessions: sessionsWithCounts
    });
  } catch (error) {
    logger.error('Get all sessions error:', error);
    next(error);
  }
};

/**
 * Get a specific session by ID
 */
exports.getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get session from database
    const session = await ListeningSession.findByPk(id, {
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username', 'profileImage']
        },
        {
          model: Track,
          attributes: ['id', 'title', 'duration', 'coverImage'],
          include: {
            model: Artist,
            attributes: ['id', 'name']
          }
        }
      ]
    });

    if (!session) {
      return next(createError(404, 'Session not found'));
    }

    // Get session details from Redis
    const sessionDetails = await sessionsService.getSessionDetails(id);
    
    // Get participants
    const participants = await sessionsService.getParticipants(id);
    
    // Check if user is in session
    const isInSession = participants.some(p => p.id === userId);
    
    // Get recent chat messages
    const messages = await sessionsService.getRecentMessages(id);

    res.status(200).json({
      session: {
        id: session.id,
        name: session.name,
        hostId: session.hostId,
        host: session.host ? {
          id: session.host.id,
          username: session.host.username,
          profileImage: session.host.profileImage
        } : null,
        currentTrack: session.Track ? {
          id: session.Track.id,
          title: session.Track.title,
          duration: session.Track.duration,
          coverImage: session.Track.coverImage,
          artist: session.Track.Artist ? {
            id: session.Track.Artist.id,
            name: session.Track.Artist.name
          } : null
        } : null,
        currentPosition: sessionDetails.currentPosition || 0,
        isPlaying: sessionDetails.isPlaying || false,
        participants,
        isUserInSession: isInSession,
        isUserHost: session.hostId === userId,
        messages,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    logger.error('Get session error:', error);
    next(error);
  }
};

/**
 * Join a listening session
 */
exports.joinSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if session exists
    const session = await ListeningSession.findByPk(id);

    if (!session) {
      return next(createError(404, 'Session not found'));
    }

    if (!session.isActive) {
      return next(createError(400, 'Session is no longer active'));
    }

    // Add participant to session
    await sessionsService.addParticipant(id, userId);

    // Notify other participants
    await sessionsService.broadcastMessage(id, {
      type: 'system',
      content: `${req.user.username} joined the session`
    });

    res.status(200).json({
      message: 'Joined session successfully'
    });
  } catch (error) {
    logger.error('Join session error:', error);
    next(error);
  }
};

/**
 * Leave a listening session
 */
exports.leaveSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if session exists
    const session = await ListeningSession.findByPk(id);

    if (!session) {
      return next(createError(404, 'Session not found'));
    }

    // Remove participant from session
    await sessionsService.removeParticipant(id, userId);

    // If user is host and session is active, end the session
    if (session.hostId === userId && session.isActive) {
      await endSession(req, res, next);
      return;
    }

    // Notify other participants
    await sessionsService.broadcastMessage(id, {
      type: 'system',
      content: `${req.user.username} left the session`
    });

    res.status(200).json({
      message: 'Left session successfully'
    });
  } catch (error) {
    logger.error('Leave session error:', error);
    next(error);
  }
};

/**
 * Update the current track in a session
 */
exports.updateTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trackId } = req.body;
    const userId = req.user.id;

    // Check if session exists
    const session = await ListeningSession.findByPk(id);

    if (!session) {
      return next(createError(404, 'Session not found'));
    }

    // Check if user is the host
    if (session.hostId !== userId) {
      return next(createError(403, 'Only the host can update the current track'));
    }

    // Check if track exists
    const track = await Track.findByPk(trackId, {
      include: {
        model: Artist,
        attributes: ['id', 'name']
      }
    });

    if (!track) {
      return next(createError(404, 'Track not found'));
    }

    // Update session in database
    await session.update({
      currentTrackId: trackId,
      currentPosition: 0,
      isPlaying: true
    });

    // Update session in Redis
    await sessionsService.updateSessionTrack(id, trackId, track.title, track.Artist.name);

    // Notify participants
    await sessionsService.broadcastMessage(id, {
      type: 'track_change',
      content: {
        trackId: track.id,
        title: track.title,
        artist: track.Artist.name,
        duration: track.duration,
        coverImage: track.coverImage
      }
    });

    res.status(200).json({
      message: 'Track updated successfully',
      track: {
        id: track.id,
        title: track.title,
        duration: track.duration,
        coverImage: track.coverImage,
        artist: track.Artist ? {
          id: track.Artist.id,
          name: track.Artist.name
        } : null
      }
    });
  } catch (error) {
    logger.error('Update track error:', error);
    next(error);
  }
};

/**
 * Update the current playback position in a session
 */
exports.updatePosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { position } = req.body;
    const userId = req.user.id;

    // Check if session exists
    const session = await ListeningSession.findByPk(id);

    if (!session) {
      return next(createError(404, 'Session not found'));
    }

    // Check if user is the host
    if (session.hostId !== userId) {
      return next(createError(403, 'Only the host can update the playback position'));
    }

    // Update session in database
    await session.update({ currentPosition: position });

    // Update session in Redis
    await sessionsService.updateSessionPosition(id, position);

    // Notify participants
    await sessionsService.broadcastMessage(id, {
      type: 'position_change',
      content: { position }
    });

    res.status(200).json({
      message: 'Position updated successfully',
      position
    });
  } catch (error) {
    logger.error('Update position error:', error);
    next(error);
  }
};

/**
 * Update playback state (play/pause)
 */
exports.updatePlayback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPlaying } = req.body;
    const userId = req.user.id;

    // Check if session exists
    const session = await ListeningSession.findByPk(id);

    if (!session) {
      return next(createError(404, 'Session not found'));
    }

    // Check if user is the host
    if (session.hostId !== userId) {
      return next(createError(403, 'Only the host can update the playback state'));
    }

    // Update session in database
    await session.update({ isPlaying });

    // Update session in Redis
    await sessionsService.updateSessionPlayback(id, isPlaying);

    // Notify participants
    await sessionsService.broadcastMessage(id, {
      type: 'playback_change',
      content: { isPlaying }
    });

    res.status(200).json({
      message: `Playback ${isPlaying ? 'resumed' : 'paused'} successfully`,
      isPlaying
    });
  } catch (error) {
    logger.error('Update playback error:', error);
    next(error);
  }
};

/**
 * Send a chat message in a session
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // Check if session exists
    const session = await ListeningSession.findByPk(id);

    if (!session) {
      return next(createError(404, 'Session not found'));
    }

    // Check if user is a participant
    const isParticipant = await sessionsService.isParticipant(id, userId);

    if (!isParticipant) {
      return next(createError(403, 'You must be a participant to send messages'));
    }

    // Create and store the message
    const chatMessage = {
      id: Date.now().toString(),
      sessionId: id,
      userId,
      username: req.user.username,
      content: message,
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    await sessionsService.saveMessage(id, chatMessage);

    // Broadcast message to all participants
    await sessionsService.broadcastMessage(id, {
      type: 'chat',
      content: chatMessage
    });

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};

/**
 * Get chat messages for a session
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if session exists
    const session = await ListeningSession.findByPk(id);

    if (!session) {
      return next(createError(404, 'Session not found'));
    }

    // Check if user is a participant
    const isParticipant = await sessionsService.isParticipant(id, userId);

    if (!isParticipant) {
      return next(createError(403, 'You must be a participant to view messages'));
    }

    // Get messages from Redis
    const messages = await sessionsService.getMessages(id);

    res.status(200).json({
      messages
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    next(error);
  }
};

/**
 * End a listening session (host only)
 */
exports.endSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if session exists
    const session = await ListeningSession.findByPk(id);

    if (!session) {
      return next(createError(404, 'Session not found'));
    }

    // Check if user is the host
    if (session.hostId !== userId) {
      return next(createError(403, 'Only the host can end the session'));
    }

    // Update session in database
    await session.update({ isActive: false });

    // Notify participants
    await sessionsService.broadcastMessage(id, {
      type: 'system',
      content: 'The session has ended'
    });

    // Clean up session data in Redis
    await sessionsService.cleanupSession(id);

    res.status(200).json({
      message: 'Session ended successfully'
    });
  } catch (error) {
    logger.error('End session error:', error);
    next(error);
  }
};