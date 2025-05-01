const express = require('express');
const tracksController = require('./controller');
const { authenticateJWT, isAdmin } = require('../../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * /api/tracks:
 *   get:
 *     summary: Get all tracks with pagination
 *     tags: [Tracks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tracks per page
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: artist
 *         schema:
 *           type: string
 *         description: Filter by artist
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title
 *     responses:
 *       200:
 *         description: List of tracks
 */
router.get('/', tracksController.getAllTracks);

/**
 * @swagger
 * /api/tracks/{id}:
 *   get:
 *     summary: Get a track by ID
 *     tags: [Tracks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Track ID
 *     responses:
 *       200:
 *         description: Track details
 *       404:
 *         description: Track not found
 */
router.get('/:id', tracksController.getTrack);

/**
 * @swagger
 * /api/tracks/popular:
 *   get:
 *     summary: Get popular tracks
 *     tags: [Tracks]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tracks to return
 *     responses:
 *       200:
 *         description: List of popular tracks
 */
router.get('/popular', tracksController.getPopularTracks);

/**
 * @swagger
 * /api/tracks/recommendations:
 *   get:
 *     summary: Get personalized track recommendations
 *     tags: [Tracks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tracks to return
 *     responses:
 *       200:
 *         description: List of recommended tracks
 *       401:
 *         description: Unauthorized
 */
router.get('/recommendations', authenticateJWT, tracksController.getRecommendations);

/**
 * @swagger
 * /api/tracks/{id}/similar:
 *   get:
 *     summary: Get tracks similar to a specified track
 *     tags: [Tracks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Track ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tracks to return
 *     responses:
 *       200:
 *         description: List of similar tracks
 *       404:
 *         description: Track not found
 */
router.get('/:id/similar', tracksController.getSimilarTracks);

/**
 * @swagger
 * /api/tracks/{id}/like:
 *   post:
 *     summary: Like a track
 *     tags: [Tracks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Track ID
 *     responses:
 *       200:
 *         description: Track liked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Track not found
 */
router.post('/:id/like', authenticateJWT, tracksController.likeTrack);

/**
 * @swagger
 * /api/tracks/{id}/unlike:
 *   post:
 *     summary: Unlike a track
 *     tags: [Tracks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Track ID
 *     responses:
 *       200:
 *         description: Track unliked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Track not found
 */
router.post('/:id/unlike', authenticateJWT, tracksController.unlikeTrack);

/**
 * @swagger
 * /api/tracks:
 *   post:
 *     summary: Add a new track (admin only)
 *     tags: [Tracks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - artistId
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *               artistId:
 *                 type: string
 *               albumId:
 *                 type: string
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               file:
 *                 type: string
 *                 format: binary
 *               fileHQ:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               isExplicit:
 *                 type: boolean
 *               lyrics:
 *                 type: string
 *     responses:
 *       201:
 *         description: Track created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 */
router.post('/', authenticateJWT, isAdmin, tracksController.addTrack);

/**
 * @swagger
 * /api/tracks/{id}:
 *   put:
 *     summary: Update a track (admin only)
 *     tags: [Tracks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Track ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               artistId:
 *                 type: string
 *               albumId:
 *                 type: string
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               file:
 *                 type: string
 *                 format: binary
 *               fileHQ:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               isExplicit:
 *                 type: boolean
 *               lyrics:
 *                 type: string
 *     responses:
 *       200:
 *         description: Track updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Track not found
 */
router.put('/:id', authenticateJWT, isAdmin, tracksController.updateTrack);

/**
 * @swagger
 * /api/tracks/{id}:
 *   delete:
 *     summary: Delete a track (admin only)
 *     tags: [Tracks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Track ID
 *     responses:
 *       200:
 *         description: Track deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Track not found
 */
router.delete('/:id', authenticateJWT, isAdmin, tracksController.deleteTrack);

module.exports = router;