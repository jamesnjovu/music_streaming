const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/playlists:
 *   get:
 *     summary: Get current user's playlists
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's playlists
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: 'This endpoint will return user playlists (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/playlists/featured:
 *   get:
 *     summary: Get featured playlists
 *     tags: [Playlists]
 *     responses:
 *       200:
 *         description: List of featured playlists
 */
router.get('/featured', (req, res) => {
  res.status(200).json({
    message: 'This endpoint will return featured playlists (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   get:
 *     summary: Get a playlist by ID
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: Playlist details
 *       404:
 *         description: Playlist not found
 */
router.get('/:id', (req, res) => {
  res.status(200).json({
    message: `This endpoint will return the playlist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/playlists:
 *   post:
 *     summary: Create a new playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Playlist created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateJWT, (req, res) => {
  res.status(201).json({
    message: 'This endpoint will create a new playlist (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   put:
 *     summary: Update a playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Playlist updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - playlist does not belong to user
 *       404:
 *         description: Playlist not found
 */
router.put('/:id', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: `This endpoint will update the playlist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   delete:
 *     summary: Delete a playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: Playlist deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - playlist does not belong to user
 *       404:
 *         description: Playlist not found
 */
router.delete('/:id', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: `This endpoint will delete the playlist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/playlists/{id}/tracks:
 *   get:
 *     summary: Get tracks in a playlist
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: List of tracks in playlist
 *       404:
 *         description: Playlist not found
 */
router.get('/:id/tracks', (req, res) => {
  res.status(200).json({
    message: `This endpoint will return tracks in playlist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/playlists/{id}/tracks:
 *   post:
 *     summary: Add a track to a playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trackId
 *             properties:
 *               trackId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Track added to playlist successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - playlist does not belong to user
 *       404:
 *         description: Playlist or track not found
 */
router.post('/:id/tracks', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: `This endpoint will add a track to playlist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/playlists/{id}/tracks/{trackId}:
 *   delete:
 *     summary: Remove a track from a playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *       - in: path
 *         name: trackId
 *         schema:
 *           type: string
 *         required: true
 *         description: Track ID
 *     responses:
 *       200:
 *         description: Track removed from playlist successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - playlist does not belong to user
 *       404:
 *         description: Playlist or track not found
 */
router.delete('/:id/tracks/:trackId', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: `This endpoint will remove track ${req.params.trackId} from playlist with ID ${req.params.id} (not implemented yet)`
  });
});

module.exports = router;