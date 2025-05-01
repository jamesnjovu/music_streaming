const { Track, Artist, Album, Genre, User } = require('../../models');
const { Op, literal } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { recommendationService } = require('../../services/recommendation.service');
const logger = require('../../utils/logger');
const { createError } = require('../../utils/errorHandler');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    
    if (file.fieldname === 'file' || file.fieldname === 'fileHQ') {
      uploadPath = path.join(__dirname, '../../../uploads/tracks');
    } else if (file.fieldname === 'coverImage') {
      uploadPath = path.join(__dirname, '../../../uploads/covers');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'file' || file.fieldname === 'fileHQ') {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(createError(400, 'Only audio files are allowed'), false);
    }
  } else if (file.fieldname === 'coverImage') {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(createError(400, 'Only image files are allowed'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

/**
 * Get all tracks with pagination and filtering
 */
exports.getAllTracks = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      genre,
      artist,
      album,
      search
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const where = {};
    const include = [
      {
        model: Artist,
        attributes: ['id', 'name'],
        where: artist ? { id: artist } : undefined
      },
      {
        model: Album,
        attributes: ['id', 'title'],
        where: album ? { id: album } : undefined
      }
    ];
    
    // Add genre filter if specified
    if (genre) {
      include.push({
        model: Genre,
        attributes: ['id', 'name'],
        where: { id: genre },
        through: { attributes: [] }
      });
    } else {
      include.push({
        model: Genre,
        attributes: ['id', 'name'],
        through: { attributes: [] }
      });
    }
    
    // Add search filter if specified
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    
    // Get tracks with total count
    const { count, rows: tracks } = await Track.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    res.status(200).json({
      tracks,
      pagination: {
        totalTracks: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        hasNext,
        hasPrev
      }
    });
  } catch (error) {
    logger.error('Get all tracks error:', error);
    next(error);
  }
};

/**
 * Get a track by ID
 */
exports.getTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get track with related data
    const track = await Track.findByPk(id, {
      include: [
        {
          model: Artist,
          attributes: ['id', 'name']
        },
        {
          model: Album,
          attributes: ['id', 'title', 'coverImage']
        },
        {
          model: Genre,
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!track) {
      return next(createError(404, 'Track not found'));
    }
    
    // Check if user is authenticated to show liked status
    let isLiked = false;
    
    if (req.user) {
      const likedTrack = await track.getLikedBy({
        where: { id: req.user.id },
        attributes: ['id'],
        through: { attributes: [] }
      });
      
      isLiked = likedTrack.length > 0;
    }
    
    res.status(200).json({
      track: {
        ...track.toJSON(),
        isLiked
      }
    });
  } catch (error) {
    logger.error('Get track error:', error);
    next(error);
  }
};

/**
 * Get popular tracks
 */
exports.getPopularTracks = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get popular tracks from recommendation service
    const popularTracks = await recommendationService.getPopularTracks(parseInt(limit));
    
    res.status(200).json({
      tracks: popularTracks
    });
  } catch (error) {
    logger.error('Get popular tracks error:', error);
    next(error);
  }
};

/**
 * Get personalized track recommendations
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const userId = req.user.id;
    
    // Get recommendations from recommendation service
    const recommendations = await recommendationService.getRecommendations(userId, parseInt(limit));
    
    res.status(200).json({
      tracks: recommendations
    });
  } catch (error) {
    logger.error('Get recommendations error:', error);
    next(error);
  }
};

/**
 * Get similar tracks to a specified track
 */
exports.getSimilarTracks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    // Check if track exists
    const track = await Track.findByPk(id);
    
    if (!track) {
      return next(createError(404, 'Track not found'));
    }
    
    // Get similar tracks from recommendation service
    const similarTracks = await recommendationService.getSimilarTracks(id, parseInt(limit));
    
    res.status(200).json({
      tracks: similarTracks
    });
  } catch (error) {
    logger.error('Get similar tracks error:', error);
    next(error);
  }
};

/**
 * Like a track
 */
exports.likeTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if track exists
    const track = await Track.findByPk(id);
    
    if (!track) {
      return next(createError(404, 'Track not found'));
    }
    
    // Add user to liked tracks
    await track.addLikedBy(userId);
    
    // Update user preferences for recommendations
    await recommendationService.updateUserPreferences(userId, id);
    
    res.status(200).json({
      message: 'Track liked successfully'
    });
  } catch (error) {
    logger.error('Like track error:', error);
    next(error);
  }
};

/**
 * Unlike a track
 */
exports.unlikeTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if track exists
    const track = await Track.findByPk(id);
    
    if (!track) {
      return next(createError(404, 'Track not found'));
    }
    
    // Remove user from liked tracks
    await track.removeLikedBy(userId);
    
    res.status(200).json({
      message: 'Track unliked successfully'
    });
  } catch (error) {
    logger.error('Unlike track error:', error);
    next(error);
  }
};

/**
 * Add a new track (admin only)
 */
exports.addTrack = async (req, res, next) => {
  // Use multer middleware for file uploads
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'fileHQ', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    
    try {
      const {
        title,
        artistId,
        albumId,
        genreIds,
        releaseDate,
        isExplicit,
        lyrics
      } = req.body;
      
      // Validate required fields
      if (!title || !artistId || !req.files.file) {
        return next(createError(400, 'Title, artist, and audio file are required'));
      }
      
      // Check if artist exists
      const artist = await Artist.findByPk(artistId);
      
      if (!artist) {
        return next(createError(404, 'Artist not found'));
      }
      
      // Check if album exists if albumId is provided
      if (albumId) {
        const album = await Album.findByPk(albumId);
        
        if (!album) {
          return next(createError(404, 'Album not found'));
        }
      }
      
      // Parse genreIds from string to array if needed
      let parsedGenreIds = [];
      
      if (genreIds) {
        if (typeof genreIds === 'string') {
          try {
            parsedGenreIds = JSON.parse(genreIds);
          } catch (e) {
            parsedGenreIds = genreIds.split(',').map(id => id.trim());
          }
        } else if (Array.isArray(genreIds)) {
          parsedGenreIds = genreIds;
        }
      }
      
      // Get file paths
      const filePath = req.files.file ? path.join('/uploads/tracks', req.files.file[0].filename) : null;
      const filePathHQ = req.files.fileHQ ? path.join('/uploads/tracks', req.files.fileHQ[0].filename) : null;
      const coverImagePath = req.files.coverImage ? path.join('/uploads/covers', req.files.coverImage[0].filename) : null;
      
      // Calculate duration (in a real implementation, this would use a library to get audio duration)
      // For this example, we'll use a random value
      const duration = Math.floor(Math.random() * 300) + 120; // 2-5 minutes
      
      // Create track
      const track = await Track.create({
        title,
        artistId,
        albumId: albumId || null,
        duration,
        filePath,
        filePathHQ: filePathHQ || null,
        coverImage: coverImagePath || null,
        releaseDate: releaseDate || null,
        isExplicit: isExplicit === 'true',
        lyrics: lyrics || null
      });
      
      // Add genres if provided
      if (parsedGenreIds.length > 0) {
        await track.setGenres(parsedGenreIds);
      }
      
      // Get track with related data
      const createdTrack = await Track.findByPk(track.id, {
        include: [
          {
            model: Artist,
            attributes: ['id', 'name']
          },
          {
            model: Album,
            attributes: ['id', 'title']
          },
          {
            model: Genre,
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ]
      });
      
      res.status(201).json({
        message: 'Track created successfully',
        track: createdTrack
      });
    } catch (error) {
      logger.error('Add track error:', error);
      
      // Clean up uploaded files if there was an error
      if (req.files) {
        Object.values(req.files).forEach(fileArray => {
          fileArray.forEach(file => {
            fs.unlink(file.path, (err) => {
              if (err) logger.error('File cleanup error:', err);
            });
          });
        });
      }
      
      next(error);
    }
  });
};

/**
 * Update a track (admin only)
 */
exports.updateTrack = async (req, res, next) => {
  // Use multer middleware for file uploads
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'fileHQ', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    
    try {
      const { id } = req.params;
      const {
        title,
        artistId,
        albumId,
        genreIds,
        releaseDate,
        isExplicit,
        lyrics
      } = req.body;
      
      // Check if track exists
      const track = await Track.findByPk(id);
      
      if (!track) {
        return next(createError(404, 'Track not found'));
      }
      
      // Check if artist exists if artistId is provided
      if (artistId) {
        const artist = await Artist.findByPk(artistId);
        
        if (!artist) {
          return next(createError(404, 'Artist not found'));
        }
      }
      
      // Check if album exists if albumId is provided
      if (albumId) {
        const album = await Album.findByPk(albumId);
        
        if (!album) {
          return next(createError(404, 'Album not found'));
        }
      }
      
      // Parse genreIds from string to array if needed
      let parsedGenreIds = [];
      
      if (genreIds) {
        if (typeof genreIds === 'string') {
          try {
            parsedGenreIds = JSON.parse(genreIds);
          } catch (e) {
            parsedGenreIds = genreIds.split(',').map(id => id.trim());
          }
        } else if (Array.isArray(genreIds)) {
          parsedGenreIds = genreIds;
        }
      }
      
      // Store old file paths for cleanup
      const oldFilePath = track.filePath;
      const oldFilePathHQ = track.filePathHQ;
      const oldCoverImagePath = track.coverImage;
      
      // Get new file paths
      const filePath = req.files.file ? path.join('/uploads/tracks', req.files.file[0].filename) : oldFilePath;
      const filePathHQ = req.files.fileHQ ? path.join('/uploads/tracks', req.files.fileHQ[0].filename) : oldFilePathHQ;
      const coverImagePath = req.files.coverImage ? path.join('/uploads/covers', req.files.coverImage[0].filename) : oldCoverImagePath;
      
      // Update track
      await track.update({
        title: title || track.title,
        artistId: artistId || track.artistId,
        albumId: albumId !== undefined ? albumId : track.albumId,
        filePath,
        filePathHQ,
        coverImage: coverImagePath,
        releaseDate: releaseDate || track.releaseDate,
        isExplicit: isExplicit !== undefined ? isExplicit === 'true' : track.isExplicit,
        lyrics: lyrics !== undefined ? lyrics : track.lyrics
      });
      
      // Update genres if provided
      if (parsedGenreIds.length > 0) {
        await track.setGenres(parsedGenreIds);
      }
      
      // Clean up old files if replaced
      if (req.files.file && oldFilePath) {
        const absolutePath = path.join(__dirname, '../../../', oldFilePath);
        fs.unlink(absolutePath, (err) => {
          if (err) logger.error('File cleanup error:', err);
        });
      }
      
      if (req.files.fileHQ && oldFilePathHQ) {
        const absolutePath = path.join(__dirname, '../../../', oldFilePathHQ);
        fs.unlink(absolutePath, (err) => {
          if (err) logger.error('File cleanup error:', err);
        });
      }
      
      if (req.files.coverImage && oldCoverImagePath) {
        const absolutePath = path.join(__dirname, '../../../', oldCoverImagePath);
        fs.unlink(absolutePath, (err) => {
          if (err) logger.error('File cleanup error:', err);
        });
      }
      
      // Get updated track with related data
      const updatedTrack = await Track.findByPk(id, {
        include: [
          {
            model: Artist,
            attributes: ['id', 'name']
          },
          {
            model: Album,
            attributes: ['id', 'title']
          },
          {
            model: Genre,
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ]
      });
      
      res.status(200).json({
        message: 'Track updated successfully',
        track: updatedTrack
      });
    } catch (error) {
      logger.error('Update track error:', error);
      
      // Clean up uploaded files if there was an error
      if (req.files) {
        Object.values(req.files).forEach(fileArray => {
          fileArray.forEach(file => {
            fs.unlink(file.path, (err) => {
              if (err) logger.error('File cleanup error:', err);
            });
          });
        });
      }
      
      next(error);
    }
  });
};

/**
 * Delete a track (admin only)
 */
exports.deleteTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if track exists
    const track = await Track.findByPk(id);
    
    if (!track) {
      return next(createError(404, 'Track not found'));
    }
    
    // Store file paths for cleanup
    const filePath = track.filePath;
    const filePathHQ = track.filePathHQ;
    const coverImagePath = track.coverImage;
    
    // Delete track from database
    await track.destroy();
    
    // Clean up files
    if (filePath) {
      const absolutePath = path.join(__dirname, '../../../', filePath);
      fs.unlink(absolutePath, (err) => {
        if (err) logger.error('File cleanup error:', err);
      });
    }
    
    if (filePathHQ) {
      const absolutePath = path.join(__dirname, '../../../', filePathHQ);
      fs.unlink(absolutePath, (err) => {
        if (err) logger.error('File cleanup error:', err);
      });
    }
    
    if (coverImagePath) {
      const absolutePath = path.join(__dirname, '../../../', coverImagePath);
      fs.unlink(absolutePath, (err) => {
        if (err) logger.error('File cleanup error:', err);
      });
    }
    
    res.status(200).json({
      message: 'Track deleted successfully'
    });
  } catch (error) {
    logger.error('Delete track error:', error);
    next(error);
  }
};