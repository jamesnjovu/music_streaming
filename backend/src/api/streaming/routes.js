const express = require('express');
const streamingController = require('./controller');
const { authenticateJWT, isPremiumUser } = require('../../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * /api/streaming/track/{id}:
 *   get:
 *     summary: Stream a track
 *     tags: [Streaming]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Track ID
 *       - in: query
 *         name: quality
 *         schema:
 *           type: string
 *           enum: [standard, high]
 *         description: Stream quality (premium users only for high quality)
 *     responses:
 *       200:
 *         description: Audio stream
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Premium required for high quality
 *       404:
 *         description: Track not found
 */
router.get('/track/:id', authenticateJWT, streamingController.streamTrack);

/**
 * @swagger
 * /api/streaming/track/{id}/public:
 *   get:
 *     summary: Stream a track without authentication (for preview or free tier)
 *     tags: [Streaming]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Track ID
 *     responses:
 *       200:
 *         description: Audio stream (Standard quality, may include ads)
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Track not found
 */
router.get('/track/:id/public', streamingController.streamPublicTrack);

/**
 * @swagger
 * /api/streaming/track/{id}/download:
 *   get:
 *     summary: Download a track (premium users only)
 *     tags: [Streaming]
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
 *         description: Track file
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Premium subscription required
 *       404:
 *         description: Track not found
 */
router.get('/track/:id/download', authenticateJWT, isPremiumUser, streamingController.downloadTrack);

/**
 * @swagger
 * /api/streaming/track/{id}/progress:
 *   post:
 *     summary: Update track play progress for recommendations
 *     tags: [Streaming]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - position
 *               - completed
 *             properties:
 *               position:
 *                 type: number
 *                 description: Current position in seconds
 *               completed:
 *                 type: boolean
 *                 description: Whether the track was played to completion
 *     responses:
 *       200:
 *         description: Progress updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Track not found
 */
router.post('/track/:id/progress', authenticateJWT, streamingController.trackProgress);

module.exports = router;