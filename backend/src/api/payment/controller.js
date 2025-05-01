const { SubscriptionPlan, UserSubscription } = require('../../models');
const { paymentService } = require('../../services/payment.service');
const logger = require('../../utils/logger');
const { createError } = require('../../utils/errorHandler');

/**
 * Get all subscription plans
 */
exports.getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = await paymentService.getSubscriptionPlans();

    res.status(200).json({
      plans
    });
  } catch (error) {
    logger.error('Get subscription plans error:', error);
    next(error);
  }
};

/**
 * Get subscription plan details
 */
exports.getSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      return next(createError(404, 'Subscription plan not found'));
    }

    res.status(200).json({
      plan
    });
  } catch (error) {
    logger.error('Get subscription plan error:', error);
    next(error);
  }
};

/**
 * Create a new subscription plan (admin only)
 */
exports.createSubscriptionPlan = async (req, res, next) => {
  try {
    const { name, price, description, features, durationMonths } = req.body;

    // Validate required fields
    if (!name || !price) {
      return next(createError(400, 'Name and price are required'));
    }

    // Validate price
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return next(createError(400, 'Price must be a positive number'));
    }

    const plan = await paymentService.createSubscriptionPlan({
      name,
      price: parseFloat(price),
      description,
      features: features || [],
      durationMonths: durationMonths || 1
    });

    res.status(201).json({
      message: 'Subscription plan created successfully',
      plan
    });
  } catch (error) {
    logger.error('Create subscription plan error:', error);
    next(error);
  }
};

/**
 * Update a subscription plan (admin only)
 */
exports.updateSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description, features, durationMonths } = req.body;

    // Find the plan
    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      return next(createError(404, 'Subscription plan not found'));
    }

    // Validate price if provided
    if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
      return next(createError(400, 'Price must be a positive number'));
    }

    // Update plan
    await plan.update({
      name: name || plan.name,
      price: price !== undefined ? parseFloat(price) : plan.price,
      description: description !== undefined ? description : plan.description,
      features: features || plan.features,
      durationMonths: durationMonths || plan.durationMonths
    });

    res.status(200).json({
      message: 'Subscription plan updated successfully',
      plan
    });
  } catch (error) {
    logger.error('Update subscription plan error:', error);
    next(error);
  }
};

/**
 * Delete a subscription plan (admin only)
 */
exports.deleteSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the plan
    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      return next(createError(404, 'Subscription plan not found'));
    }

    // Check if plan is in use by active subscriptions
    const activeSubscriptions = await UserSubscription.count({
      where: { subscriptionPlanId: id, isActive: true }
    });

    if (activeSubscriptions > 0) {
      return next(createError(400, 'Cannot delete plan with active subscriptions'));
    }

    // Delete plan
    await plan.destroy();

    res.status(200).json({
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    logger.error('Delete subscription plan error:', error);
    next(error);
  }
};

/**
 * Subscribe to a plan
 */
exports.subscribe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { planId, paymentMethod, paymentDetails } = req.body;

    // Validate required fields
    if (!planId) {
      return next(createError(400, 'Plan ID is required'));
    }

    // Check if user already has an active subscription
    const subscriptionStatus = await paymentService.checkSubscriptionStatus(userId);

    if (subscriptionStatus.isPremium) {
      return next(createError(400, 'User already has an active subscription'));
    }

    // Process subscription
    const subscription = await paymentService.createSubscription(userId, planId, {
      paymentMethod: paymentMethod || 'credit_card',
      ...paymentDetails
    });

    res.status(200).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    logger.error('Subscribe error:', error);

    if (error.message === 'User not found' || error.message === 'Subscription plan not found') {
      return next(createError(404, error.message));
    }

    next(error);
  }
};

/**
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { immediate = false } = req.body;

    // Process cancellation
    const cancellation = await paymentService.cancelSubscription(userId, immediate);

    res.status(200).json({
      message: `Subscription cancelled ${immediate ? 'immediately' : 'at the end of the current period'}`,
      cancellation
    });
  } catch (error) {
    logger.error('Cancel subscription error:', error);

    if (error.message === 'User not found' || error.message === 'No active subscription found') {
      return next(createError(404, error.message));
    }

    next(error);
  }
};

/**
 * Change subscription plan
 */
exports.changePlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { planId, paymentMethod } = req.body;

    // Validate required fields
    if (!planId) {
      return next(createError(400, 'Plan ID is required'));
    }

    // Process plan change
    const subscription = await paymentService.changePlan(userId, planId, {
      paymentMethod: paymentMethod || 'credit_card'
    });

    res.status(200).json({
      message: 'Subscription plan changed successfully',
      subscription
    });
  } catch (error) {
    logger.error('Change plan error:', error);

    if (error.message === 'User not found' || error.message === 'Subscription plan not found') {
      return next(createError(404, error.message));
    }

    next(error);
  }
};

/**
 * Get current user's subscription status
 */
exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const status = await paymentService.checkSubscriptionStatus(userId);

    res.status(200).json({
      status
    });
  } catch (error) {
    logger.error('Get subscription status error:', error);

    if (error.message === 'User not found') {
      return next(createError(404, 'User not found'));
    }

    next(error);
  }
};

/**
 * Get user's payment history
 */
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get payment history from database
    const subscriptions = await UserSubscription.findAll({
      where: { userId },
      include: {
        model: SubscriptionPlan,
        attributes: ['id', 'name', 'price']
      },
      order: [['startDate', 'DESC']]
    });

    // Format the data
    const paymentHistory = subscriptions.map(subscription => ({
      id: subscription.id,
      planName: subscription.SubscriptionPlan?.name || 'Unknown Plan',
      price: subscription.SubscriptionPlan?.price || 0,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      isActive: subscription.isActive,
      paymentMethod: subscription.paymentMethod,
      paymentId: subscription.paymentId,
      autoRenew: subscription.autoRenew
    }));

    res.status(200).json({
      paymentHistory
    });
  } catch (error) {
    logger.error('Get payment history error:', error);
    next(error);
  }
};