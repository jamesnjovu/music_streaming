const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/albums:
 *   get:
 *     summary: Get all albums with pagination
 *     tags: [Albums]
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
 *         description: Number of albums per page
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
 *         description: List of albums
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'This endpoint will return a list of albums (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/albums/{id}:
 *   get:
 *     summary: Get an album by ID
 *     tags: [Albums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Album ID
 *     responses:
 *       200:
 *         description: Album details
 *       404:
 *         description: Album not found
 */
router.get('/:id', (req, res) => {
  res.status(200).json({
    message: `This endpoint will return the album with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/albums:
 *   post:
 *     summary: Add a new album (admin only)
 *     tags: [Albums]
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
 *             properties:
 *               title:
 *                 type: string
 *               artistId:
 *                 type: string
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Album created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 */
router.post('/', authenticateJWT, isAdmin, (req, res) => {
  res.status(201).json({
    message: 'This endpoint will create a new album (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/albums/{id}:
 *   put:
 *     summary: Update an album (admin only)
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Album ID
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
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Album updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Album not found
 */
router.put('/:id', authenticateJWT, isAdmin, (req, res) => {
  res.status(200).json({
    message: `This endpoint will update the album with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/albums/{id}:
 *   delete:
 *     summary: Delete an album (admin only)
 *     tags: [Albums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Album ID
 *     responses:
 *       200:
 *         description: Album deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Album not found
 */
router.delete('/:id', authenticateJWT, isAdmin, (req, res) => {
  res.status(200).json({
    message: `This endpoint will delete the album with ID ${req.params.id} (not implemented yet)`
  });
});

module.exports = router;