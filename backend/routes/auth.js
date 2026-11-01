// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { query } = require('../services/dbService');
const otpController = require('../controllers/otpController');

const router = express.Router();

// Load keys
const privateKey = fs.readFileSync(
  path.join(__dirname, '../keys/private_key.pem'),
  'utf8'
);
const publicKey = fs.readFileSync(
  path.join(__dirname, '../keys/public_key.pem'),
  'utf8'
);

// ================= OTP ROUTES =================
router.post('/send-otp', otpController.sendOtp);
router.post('/verify-otp', otpController.verifyOtp);

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const tenantId = req.tenantId;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }

  if (!tenantId) {
    return res.status(400).json({
      error: 'Tenant missing'
    });
  }

  try {
    // Find user by email
    const users = await query(
      tenantId,
      'SELECT * FROM admin WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check account status
    if (Number(user.is_active) !== 1) {
      return res.status(403).json({
        error: 'Your account is inactive. Contact administrator.'
      });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role || 'admin',
        tenantId
      },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user.id
      },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
      }
    );

    // Store refresh token
    await query(
      tenantId,
      'UPDATE admin SET refresh_token = ? WHERE id = ?',
      [refreshToken, user.id]
    );

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send response
    return res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'admin'
      }
    });

  } catch (err) {
    console.error('Login Error:', err.message);

    return res.status(500).json({
      error: 'Login failed'
    });
  }
});

// ================= REFRESH =================
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const tenantId = req.tenantId;

  if (!refreshToken) {
    return res.status(401).json({
      error: 'No refresh token'
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      publicKey,
      { algorithms: ['RS256'] }
    );

    if (!decoded.userId || !tenantId) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    const users = await query(
      tenantId,
      'SELECT * FROM admin WHERE id = ? AND refresh_token = ?',
      [decoded.userId, refreshToken]
    );

    if (users.length === 0) {
      return res.status(403).json({
        error: 'Invalid refresh token'
      });
    }

    const user = users[0];

    // Check whether account is active
    if (Number(user.is_active) !== 1) {
      await query(
        tenantId,
        'UPDATE admin SET refresh_token = NULL WHERE id = ?',
        [user.id]
      );

      res.clearCookie('refreshToken');

      return res.status(403).json({
        error: 'Your account is inactive'
      });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role || 'admin',
        tenantId
      },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
      }
    );

    return res.json({
      accessToken: newAccessToken
    });

  } catch (err) {
    console.error('Refresh Error:', err.message);

    res.clearCookie('refreshToken');

    return res.status(403).json({
      error: 'Invalid or expired refresh token'
    });
  }
});

// ================= LOGOUT =================
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const tenantId = req.tenantId;

  try {
    if (refreshToken && tenantId) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          publicKey,
          { algorithms: ['RS256'] }
        );

        await query(
          tenantId,
          `UPDATE admin
           SET refresh_token = NULL
           WHERE id = ? AND refresh_token = ?`,
          [decoded.userId, refreshToken]
        );

      } catch (tokenError) {
        // An expired or invalid token cannot be reused.
        console.log('Refresh token already invalid or expired.');
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.json({
      message: 'Logged out successfully'
    });

  } catch (err) {
    console.error('Logout Error:', err.message);

    return res.status(500).json({
      error: 'Logout failed'
    });
  }
});
module.exports = router;