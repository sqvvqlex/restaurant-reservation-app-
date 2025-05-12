const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const pool = require('../config/index').db;
const config = require('../config');
const { logger } = require('../utils/logger');
const crypto = require('crypto');

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Input validation
      if (!username || !email || !password) {
        return res.status(400).json({
          message: 'Username, email and password are required'
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Invalid email format'
        });
      }

      // Password length validation
      if (password.length < 6) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if email already exists
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          message: 'Email already registered'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username.trim(), email.toLowerCase(), hashedPassword]
      );

      // Generate token
      const token = jwt.sign(
        { id: result.insertId, email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: result.insertId,
            username,
            email
          }
        }
      });
    } catch (error) {
      logger.error('Error in registration:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during registration'
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          message: 'Email and password are required',
        });
      }

      // Find user
      const [users] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          message: 'Invalid credentials',
        });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          message: 'Invalid credentials',
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Remove password from response
      delete user.password;

      res.json({
        user,
        token,
      });
    } catch (error) {
      logger.error('Error logging in:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const [users] = await pool.query(
        'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      res.json(users[0]);
    } catch (error) {
      logger.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { username, email, currentPassword, newPassword } = req.body;

      // Get current user data
      const [users] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      const user = users[0];

      // If updating email, check if new email is already taken
      if (email && email !== user.email) {
        const [existingUsers] = await pool.query(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, userId]
        );

        if (existingUsers.length > 0) {
          return res.status(400).json({
            message: 'Email already taken',
          });
        }
      }

      // If updating password, verify current password
      let hashedPassword = user.password;
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            message: 'Current password is required to set new password',
          });
        }

        const isValidPassword = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (!isValidPassword) {
          return res.status(401).json({
            message: 'Current password is incorrect',
          });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(newPassword, salt);
      }

      // Update user
      await pool.query(
        `UPDATE users 
         SET 
           username = COALESCE(?, username),
           email = COALESCE(?, email),
           password = COALESCE(?, password)
         WHERE id = ?`,
        [username, email, hashedPassword, userId]
      );

      // Get updated user data
      const [updatedUser] = await pool.query(
        'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      res.json(updatedUser[0]);
    } catch (error) {
      logger.error('Error updating profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token to user
      await User.updateResetToken(user.id, resetToken, resetTokenExpiry);

      // In a real application, send email with reset link
      // For development, we'll just return the token
      res.json({
        success: true,
        message: 'Password reset instructions sent to email',
        // Remove this in production
        debug: {
          resetToken
        }
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request'
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Find user by reset token and check expiry
      const user = await User.findByResetToken(token);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update password and clear reset token
      await User.updatePassword(user.id, hashedPassword);

      res.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while resetting the password'
      });
    }
  },
};

module.exports = authController;