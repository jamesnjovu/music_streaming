const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/artists:
 *   get:
 *     summary: Get all artists with pagination
 *     tags: [Artists]
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
 *         description: Number of artists per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *     responses:
 *       200:
 *         description: List of artists
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'This endpoint will return a list of artists (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/artists/{id}:
 *   get:
 *     summary: Get an artist by ID
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Artist ID
 *     responses:
 *       200:
 *         description: Artist details
 *       404:
 *         description: Artist not found
 */
router.get('/:id', (req, res) => {
  res.status(200).json({
    message: `This endpoint will return the artist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/artists/{id}/albums:
 *   get:
 *     summary: Get albums by artist
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Artist ID
 *     responses:
 *       200:
 *         description: List of albums by artist
 *       404:
 *         description: Artist not found
 */
router.get('/:id/albums', (req, res) => {
  res.status(200).json({
    message: `This endpoint will return albums by artist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/artists/{id}/tracks:
 *   get:
 *     summary: Get tracks by artist
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Artist ID
 *     responses:
 *       200:
 *         description: List of tracks by artist
 *       404:
 *         description: Artist not found
 */
router.get('/:id/tracks', (req, res) => {
  res.status(200).json({
    message: `This endpoint will return tracks by artist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/artists/{id}/follow:
 *   post:
 *     summary: Follow an artist
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Artist ID
 *     responses:
 *       200:
 *         description: Artist followed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Artist not found
 */
router.post('/:id/follow', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: `This endpoint will follow the artist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/artists/{id}/unfollow:
 *   post:
 *     summary: Unfollow an artist
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Artist ID
 *     responses:
 *       200:
 *         description: Artist unfollowed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Artist not found
 */
router.post('/:id/unfollow', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: `This endpoint will unfollow the artist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/artists:
 *   post:
 *     summary: Add a new artist (admin only)
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Artist created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 */
router.post('/', authenticateJWT, isAdmin, (req, res) => {
  res.status(201).json({
    message: 'This endpoint will create a new artist (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/artists/{id}:
 *   put:
 *     summary: Update an artist (admin only)
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Artist ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Artist updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Artist not found
 */
router.put('/:id', authenticateJWT, isAdmin, (req, res) => {
  res.status(200).json({
    message: `This endpoint will update the artist with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/artists/{id}:
 *   delete:
 *     summary: Delete an artist (admin only)
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Artist ID
 *     responses:
 *       200:
 *         description: Artist deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Artist not found
 */
router.delete('/:id', authenticateJWT, isAdmin, (req, res) => {
  res.status(200).json({
    message: `This endpoint will delete the artist with ID ${req.params.id} (not implemented yet)`
  });
});

module.exports = router;