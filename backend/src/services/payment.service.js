const { User, SubscriptionPlan, UserSubscription } = require('../models');
const logger = require('../utils/logger');

/**
 * Payment service for handling subscription payments
 */
const paymentService = {
    /**
     * Process a new subscription
     * @param {string} userId - User ID
     * @param {string} planId - Subscription plan ID
     * @param {Object} paymentDetails - Payment details
     * @returns {Object} Subscription details
     */
    createSubscription: async (userId, planId, paymentDetails) => {
        try {
            // Check if user exists
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('User not found');
            }

            // Check if plan exists
            const plan = await SubscriptionPlan.findByPk(planId);

            if (!plan) {
                throw new Error('Subscription plan not found');
            }

            // In a real application, this would integrate with a payment gateway
            // For this example, we'll simulate a successful payment
            const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

            // Calculate subscription dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + plan.durationMonths);

            // Create subscription in database
            const subscription = await UserSubscription.create({
                userId,
                subscriptionPlanId: planId,
                startDate,
                endDate,
                isActive: true,
                autoRenew: true,
                paymentMethod: paymentDetails.paymentMethod || 'credit_card',
                paymentId
            });

            // Update user subscription status
            await user.update({
                subscriptionStatus: 'premium',
                subscriptionExpiryDate: endDate
            });

            return {
                id: subscription.id,
                planName: plan.name,
                startDate,
                endDate,
                price: plan.price,
                paymentId,
                isActive: true
            };
        } catch (error) {
            logger.error('Create subscription error:', error);
            throw error;
        }
    },

    /**
     * Cancel a subscription
     * @param {string} userId - User ID
     * @param {boolean} immediate - Whether to cancel immediately or at the end of the period
     * @returns {Object} Cancellation details
     */
    cancelSubscription: async (userId, immediate = false) => {
        try {
            // Get user and active subscription
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('User not found');
            }

            const subscription = await UserSubscription.findOne({
                where: {
                    userId,
                    isActive: true
                },
                include: {
                    model: SubscriptionPlan
                }
            });

            if (!subscription) {
                throw new Error('No active subscription found');
            }

            // Update subscription
            await subscription.update({
                isActive: !immediate,
                autoRenew: false
            });

            // If cancelling immediately, update user subscription status
            if (immediate) {
                await user.update({
                    subscriptionStatus: 'free',
                    subscriptionExpiryDate: null
                });
            }

            return {
                id: subscription.id,
                cancelledAt: new Date(),
                effectiveEndDate: immediate ? new Date() : subscription.endDate,
                isImmediateCancel: immediate
            };
        } catch (error) {
            logger.error('Cancel subscription error:', error);
            throw error;
        }
    },

    /**
     * Renew a subscription
     * @param {string} subscriptionId - Subscription ID
     * @param {Object} paymentDetails - Payment details
     * @returns {Object} Renewed subscription details
     */
    renewSubscription: async (subscriptionId, paymentDetails) => {
        try {
            // Get subscription
            const subscription = await UserSubscription.findByPk(subscriptionId, {
                include: [
                    { model: User },
                    { model: SubscriptionPlan }
                ]
            });

            if (!subscription) {
                throw new Error('Subscription not found');
            }

            // In a real application, this would integrate with a payment gateway
            // For this example, we'll simulate a successful payment
            const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

            // Calculate new subscription dates
            const startDate = new Date(subscription.endDate);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + subscription.SubscriptionPlan.durationMonths);

            // Update subscription
            await subscription.update({
                startDate,
                endDate,
                isActive: true,
                autoRenew: true,
                paymentMethod: paymentDetails.paymentMethod || subscription.paymentMethod,
                paymentId
            });

            // Update user subscription status
            await subscription.User.update({
                subscriptionStatus: 'premium',
                subscriptionExpiryDate: endDate
            });

            return {
                id: subscription.id,
                planName: subscription.SubscriptionPlan.name,
                startDate,
                endDate,
                price: subscription.SubscriptionPlan.price,
                paymentId,
                isActive: true
            };
        } catch (error) {
            logger.error('Renew subscription error:', error);
            throw error;
        }
    },

    /**
     * Change subscription plan
     * @param {string} userId - User ID
     * @param {string} newPlanId - New subscription plan ID
     * @param {Object} paymentDetails - Payment details
     * @returns {Object} Updated subscription details
     */
    changePlan: async (userId, newPlanId, paymentDetails) => {
        try {
            // Get user and active subscription
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('User not found');
            }

            // Check if new plan exists
            const newPlan = await SubscriptionPlan.findByPk(newPlanId);

            if (!newPlan) {
                throw new Error('Subscription plan not found');
            }

            // Get current subscription
            const currentSubscription = await UserSubscription.findOne({
                where: {
                    userId,
                    isActive: true
                }
            });

            // In a real application, this would integrate with a payment gateway
            // For this example, we'll simulate a successful payment
            const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

            // Calculate new subscription dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + newPlan.durationMonths);

            // If user has an active subscription, update it
            if (currentSubscription) {
                await currentSubscription.update({
                    subscriptionPlanId: newPlanId,
                    startDate,
                    endDate,
                    paymentMethod: paymentDetails.paymentMethod || currentSubscription.paymentMethod,
                    paymentId
                });

                // Update user subscription status
                await user.update({
                    subscriptionStatus: 'premium',
                    subscriptionExpiryDate: endDate
                });

                return {
                    id: currentSubscription.id,
                    planName: newPlan.name,
                    startDate,
                    endDate,
                    price: newPlan.price,
                    paymentId,
                    isActive: true
                };
            } else {
                // If no active subscription, create a new one
                return await paymentService.createSubscription(userId, newPlanId, paymentDetails);
            }
        } catch (error) {
            logger.error('Change plan error:', error);
            throw error;
        }
    },

    /**
     * Check subscription status
     * @param {string} userId - User ID
     * @returns {Object} Subscription status
     */
    checkSubscriptionStatus: async (userId) => {
        try {
            // Get user
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('User not found');
            }

            // Get active subscription
            const subscription = await UserSubscription.findOne({
                where: {
                    userId,
                    isActive: true
                },
                include: {
                    model: SubscriptionPlan
                }
            });

            if (!subscription) {
                return {
                    status: 'free',
                    isPremium: false,
                    expiryDate: null,
                    daysRemaining: 0,
                    autoRenew: false
                };
            }

            // Calculate days remaining
            const now = new Date();
            const expiryDate = new Date(subscription.endDate);
            const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

            return {
                status: user.subscriptionStatus,
                isPremium: user.subscriptionStatus === 'premium',
                expiryDate: subscription.endDate,
                daysRemaining: Math.max(0, daysRemaining),
                autoRenew: subscription.autoRenew,
                plan: {
                    id: subscription.SubscriptionPlan.id,
                    name: subscription.SubscriptionPlan.name,
                    price: subscription.SubscriptionPlan.price
                }
            };
        } catch (error) {
            logger.error('Check subscription status error:', error);
            throw error;
        }
    },

    /**
     * Get all subscription plans
     * @returns {Array} Subscription plans
     */
    getSubscriptionPlans: async () => {
        try {
            const plans = await SubscriptionPlan.findAll({
                order: [['price', 'ASC']]
            });

            return plans;
        } catch (error) {
            logger.error('Get subscription plans error:', error);
            throw error;
        }
    },

    /**
     * Create a new subscription plan (admin only)
     * @param {Object} planData - Plan data
     * @returns {Object} Created plan
     */
    createSubscriptionPlan: async (planData) => {
        try {
            const { name, price, description, features, durationMonths } = planData;

            const plan = await SubscriptionPlan.create({
                name,
                price,
                description,
                features: Array.isArray(features) ? features : [],
                durationMonths: durationMonths || 1
            });

            return plan;
        } catch (error) {
            logger.error('Create subscription plan error:', error);
            throw error;
        }
    },

    /**
     * Process automatic renewals (should be run as a scheduled job)
     */
    processAutoRenewals: async () => {
        try {
            const now = new Date();

            // Find subscriptions due for renewal (ending in the next 24 hours)
            const renewalDate = new Date(now);
            renewalDate.setHours(renewalDate.getHours() + 24);

            const subscriptionsDueForRenewal = await UserSubscription.findAll({
                where: {
                    isActive: true,
                    autoRenew: true,
                    endDate: {
                        [Op.lte]: renewalDate
                    }
                },
                include: [
                    { model: User },
                    { model: SubscriptionPlan }
                ]
            });

            const results = [];

            // Process each subscription
            for (const subscription of subscriptionsDueForRenewal) {
                try {
                    // In a real application, this would integrate with a payment gateway
                    // For this example, we'll simulate a successful payment
                    const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

                    // Calculate new subscription dates
                    const startDate = new Date(subscription.endDate);
                    const endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + subscription.SubscriptionPlan.durationMonths);

                    // Update subscription
                    await subscription.update({
                        startDate,
                        endDate,
                        paymentId
                    });

                    // Update user subscription status
                    await subscription.User.update({
                        subscriptionStatus: 'premium',
                        subscriptionExpiryDate: endDate
                    });

                    results.push({
                        id: subscription.id,
                        userId: subscription.userId,
                        planName: subscription.SubscriptionPlan.name,
                        endDate,
                        status: 'renewed'
                    });
                } catch (error) {
                    logger.error(`Failed to renew subscription ${subscription.id}:`, error);

                    results.push({
                        id: subscription.id,
                        userId: subscription.userId,
                        status: 'failed',
                        error: error.message
                    });
                }
            }

            return {
                processed: subscriptionsDueForRenewal.length,
                results
            };
        } catch (error) {
            logger.error('Process auto renewals error:', error);
            throw error;
        }
    }
};

module.exports = {
    paymentService
};