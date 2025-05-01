const express = require('express');
const paymentController = require('./controller');
const { authenticateJWT, isAdmin } = require('../../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * /api/payment/plans:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: List of subscription plans
 */
router.get('/plans', paymentController.getSubscriptionPlans);

/**
 * @swagger
 * /api/payment/plans/{id}:
 *   get:
 *     summary: Get subscription plan details
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Subscription plan details
 *       404:
 *         description: Plan not found
 */
router.get('/plans/:id', paymentController.getSubscriptionPlan);

/**
 * @swagger
 * /api/payment/plans:
 *   post:
 *     summary: Create a new subscription plan (admin only)
 *     tags: [Payment]
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
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               durationMonths:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Plan created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 */
router.post('/plans', authenticateJWT, isAdmin, paymentController.createSubscriptionPlan);

/**
 * @swagger
 * /api/payment/plans/{id}:
 *   put:
 *     summary: Update a subscription plan (admin only)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               durationMonths:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Plan not found
 */
router.put('/plans/:id', authenticateJWT, isAdmin, paymentController.updateSubscriptionPlan);

/**
 * @swagger
 * /api/payment/plans/{id}:
 *   delete:
 *     summary: Delete a subscription plan (admin only)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Plan not found
 */
router.delete('/plans/:id', authenticateJWT, isAdmin, paymentController.deleteSubscriptionPlan);

/**
 * @swagger
 * /api/payment/subscribe:
 *   post:
 *     summary: Subscribe to a plan
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - paymentMethod
 *             properties:
 *               planId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, paypal, crypto]
 *               paymentDetails:
 *                 type: object
 *     responses:
 *       200:
 *         description: Subscription created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/subscribe', authenticateJWT, paymentController.subscribe);

/**
 * @swagger
 * /api/payment/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               immediate:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active subscription found
 */
router.post('/cancel', authenticateJWT, paymentController.cancelSubscription);

/**
 * @swagger
 * /api/payment/change-plan:
 *   post:
 *     summary: Change subscription plan
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, paypal, crypto]
 *     responses:
 *       200:
 *         description: Plan changed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Plan not found
 */
router.post('/change-plan', authenticateJWT, paymentController.changePlan);

/**
 * @swagger
 * /api/payment/subscription-status:
 *   get:
 *     summary: Get current user's subscription status
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status
 *       401:
 *         description: Unauthorized
 */
router.get('/subscription-status', authenticateJWT, paymentController.getSubscriptionStatus);

/**
 * @swagger
 * /api/payment/payment-history:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history
 *       401:
 *         description: Unauthorized
 */
router.get('/payment-history', authenticateJWT, paymentController.getPaymentHistory);

module.exports = router;