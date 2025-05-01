const express = require('express');
const sessionsController = require('./controller');
const { authenticateJWT } = require('../../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new listening session
 *     tags: [Sessions]
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
 *     responses:
 *       201:
 *         description: Session created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateJWT, sessionsController.createSession);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all active sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, sessionsController.getAllSessions);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get a specific session by ID
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.get('/:id', authenticateJWT, sessionsController.getSession);

/**
 * @swagger
 * /api/sessions/{id}/join:
 *   post:
 *     summary: Join a listening session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Joined session successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.post('/:id/join', authenticateJWT, sessionsController.joinSession);

/**
 * @swagger
 * /api/sessions/{id}/leave:
 *   post:
 *     summary: Leave a listening session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Left session successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.post('/:id/leave', authenticateJWT, sessionsController.leaveSession);

/**
 * @swagger
 * /api/sessions/{id}/track:
 *   put:
 *     summary: Update the current track in a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
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
 *         description: Track updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only host can update track
 *       404:
 *         description: Session not found
 */
router.put('/:id/track', authenticateJWT, sessionsController.updateTrack);

/**
 * @swagger
 * /api/sessions/{id}/position:
 *   put:
 *     summary: Update the current playback position in a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - position
 *             properties:
 *               position:
 *                 type: number
 *                 description: Current position in seconds
 *     responses:
 *       200:
 *         description: Position updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only host can update position
 *       404:
 *         description: Session not found
 */
router.put('/:id/position', authenticateJWT, sessionsController.updatePosition);

/**
 * @swagger
 * /api/sessions/{id}/playback:
 *   put:
 *     summary: Update playback state (play/pause)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPlaying
 *             properties:
 *               isPlaying:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Playback state updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only host can update playback state
 *       404:
 *         description: Session not found
 */
router.put('/:id/playback', authenticateJWT, sessionsController.updatePlayback);

/**
 * @swagger
 * /api/sessions/{id}/chat:
 *   post:
 *     summary: Send a chat message in a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.post('/:id/chat', authenticateJWT, sessionsController.sendMessage);

/**
 * @swagger
 * /api/sessions/{id}/chat:
 *   get:
 *     summary: Get chat messages for a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: List of chat messages
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.get('/:id/chat', authenticateJWT, sessionsController.getMessages);

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: End a listening session (host only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session ended successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only host can end session
 *       404:
 *         description: Session not found
 */
router.delete('/:id', authenticateJWT, sessionsController.endSession);

module.exports = router;