const fs = require('fs');
const path = require('path');
const { Track, User } = require('../../models');
const logger = require('../../utils/logger');
const { createError } = require('../../middlewares/errorHandler');
const { streamingService } = require('../../services/streaming.service');
const { recommendationService } = require('../../services/recommendation.service');

/**
 * Stream a track with authentication
 */
exports.streamTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quality = 'standard' } = req.query;
    const user = req.user;

    // Check if high quality is requested by a non-premium user
    if (quality === 'high' && user.subscriptionStatus !== 'premium') {
      return next(createError(403, 'Premium subscription required for high quality streaming'));
    }

    // Get track from database
    const track = await Track.findByPk(id);

    if (!track) {
      return next(createError(404, 'Track not found'));
    }

    // Get the file path based on quality
    const filePath = quality === 'high' && track.filePathHQ
      ? track.filePathHQ
      : track.filePath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`Track file not found at path: ${filePath}`);
      return next(createError(404, 'Track file not found'));
    }

    // Update play count
    await track.increment('playCount');

    // Log play for recommendation engine
    await streamingService.logPlay(user.id, track.id);

    // Stream the file
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    logger.error('Stream track error:', error);
    next(error);
  }
};

/**
 * Stream a track without authentication (preview or free tier)
 */
exports.streamPublicTrack = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get track from database
    const track = await Track.findByPk(id);

    if (!track) {
      return next(createError(404, 'Track not found'));
    }

    // Always use standard quality for public streams
    const filePath = track.filePath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`Track file not found at path: ${filePath}`);
      return next(createError(404, 'Track file not found'));
    }

    // Update play count
    await track.increment('playCount');

    // Stream the file
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    logger.error('Stream public track error:', error);
    next(error);
  }
};

/**
 * Download a track (premium users only)
 */
exports.downloadTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Get track from database
    const track = await Track.findByPk(id);

    if (!track) {
      return next(createError(404, 'Track not found'));
    }

    // Use high quality for premium downloads if available
    const filePath = track.filePathHQ || track.filePath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`Track file not found at path: ${filePath}`);
      return next(createError(404, 'Track file not found'));
    }

    // Log download for analytics
    await streamingService.logDownload(user.id, track.id);

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${track.title}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    // Stream the file
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    logger.error('Download track error:', error);
    next(error);
  }
};

/**
 * Track playback progress for recommendations
 */
exports.trackProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { position, completed } = req.body;
    const user = req.user;

    // Validate input
    if (position === undefined || completed === undefined) {
      return next(createError(400, 'Position and completed flag are required'));
    }

    // Get track from database
    const track = await Track.findByPk(id);

    if (!track) {
      return next(createError(404, 'Track not found'));
    }

    // Log progress for recommendation engine
    await streamingService.logProgress(user.id, track.id, position, completed);

    // If track was completed, update recommendation model
    if (completed) {
      await recommendationService.updateUserPreferences(user.id, track.id);
    }

    res.status(200).json({ message: 'Progress updated successfully' });
  } catch (error) {
    logger.error('Track progress error:', error);
    next(error);
  }
};