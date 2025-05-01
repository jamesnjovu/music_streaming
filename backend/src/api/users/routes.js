const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: 'This endpoint will return the current user profile (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: 'This endpoint will update the current user profile (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/users/liked-tracks:
 *   get:
 *     summary: Get current user's liked tracks
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of liked tracks
 *       401:
 *         description: Unauthorized
 */
router.get('/liked-tracks', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: 'This endpoint will return the current user liked tracks (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/users/followed-artists:
 *   get:
 *     summary: Get current user's followed artists
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of followed artists
 *       401:
 *         description: Unauthorized
 */
router.get('/followed-artists', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: 'This endpoint will return the current user followed artists (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/users/recently-played:
 *   get:
 *     summary: Get current user's recently played tracks
 *     tags: [Users]
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
 *         description: List of recently played tracks
 *       401:
 *         description: Unauthorized
 */
router.get('/recently-played', authenticateJWT, (req, res) => {
  res.status(200).json({
    message: 'This endpoint will return the current user recently played tracks (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user's public profile by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateJWT, isAdmin, (req, res) => {
  res.status(200).json({
    message: `This endpoint will return the user with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username or email
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 */
router.get('/', authenticateJWT, isAdmin, (req, res) => {
  res.status(200).json({
    message: 'This endpoint will return a list of users (not implemented yet)'
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               subscriptionStatus:
 *                 type: string
 *                 enum: [free, premium]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.put('/:id', authenticateJWT, isAdmin, (req, res) => {
  res.status(200).json({
    message: `This endpoint will update the user with ID ${req.params.id} (not implemented yet)`
  });
});

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/:id/status', authenticateJWT, isAdmin, (req, res) => {
  res.status(200).json({
    message: `This endpoint will update the status of user with ID ${req.params.id} (not implemented yet)`
  });
});

module.exports = router;