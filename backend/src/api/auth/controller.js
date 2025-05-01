const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const logger = require('../../utils/logger');
const { createError } = require('../../utils/errorHandler');

/**
 * Register a new user
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [sequelize.Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return next(createError(409, 'Email already in use'));
      }
      return next(createError(409, 'Username already taken'));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'user',
      subscriptionStatus: 'free',
      isActive: true,
      lastLogin: new Date()
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user info and tokens
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login a user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return next(createError(401, 'Invalid email or password'));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(createError(403, 'Account is inactive'));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(createError(401, 'Invalid email or password'));
    }

    // Update last login time
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user info and tokens
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createError(400, 'Refresh token is required'));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(createError(401, 'Invalid refresh token'));
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Refresh token expired'));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, 'Invalid refresh token'));
    }
    
    next(error);
  }
};

/**
 * Logout a user
 */
exports.logout = async (req, res, next) => {
  // In a real production app, you might want to invalidate the refresh token
  // by adding it to a blacklist in Redis
  res.status(200).json({ message: 'Logout successful' });
};

/**
 * Request password reset
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // For security reasons, don't reveal if email exists
      return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '1h' }
    );

    // In a real app, send an email with the reset link
    // sendResetEmail(user.email, resetToken);

    res.status(200).json({ 
      message: 'If your email is registered, you will receive a password reset link',
      // The following would be removed in production, only for development/testing
      resetToken: resetToken
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

    // Find user
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(createError(401, 'Invalid or expired token'));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Reset password error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Reset token expired'));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, 'Invalid reset token'));
    }
    
    next(error);
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    // req.user is set by the authenticateJWT middleware
    const user = req.user;

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

/**
 * Change user password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return next(createError(401, 'Current password is incorrect'));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

/**
 * Generate access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};