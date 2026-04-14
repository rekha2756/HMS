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
  console.log("=".repeat(50));
  console.log("🔐 LOGIN ATTEMPT");
  console.log("BODY:", req.body);
  console.log("TENANT:", req.tenantId);

  const { email, password } = req.body;
  const tenantId = req.tenantId;

  if (!tenantId) {
    console.log("❌ Tenant missing");
    return res.status(400).json({ error: 'Tenant missing' });
  }

  try {
    const users = await query(tenantId, 'SELECT * FROM admin WHERE email = ?', [email]);
    console.log("📊 Users found in database:", users.length);

    if (users.length === 0) {
      console.log("❌ No user found with email:", email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    console.log("👤 User found:", { id: user.id, email: user.email, role: user.role });

    const valid = await bcrypt.compare(password, user.password);
    console.log("🔐 Password valid?", valid);

    if (!valid) {
      console.log("❌ Password mismatch for user:", email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log("✅ Password matched!");

    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role || 'admin',
        tenantId,
      },
      privateKey,
      { algorithm: 'RS256', expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );
    console.log("🎫 Access token generated");

    const refreshToken = jwt.sign(
      { userId: user.id },
      privateKey,
      { algorithm: 'RS256', expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );

    await query(tenantId, 'UPDATE admin SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);
    console.log("💾 Refresh token stored");

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("✅ Login successful! Sending response...");
    console.log("=".repeat(50));

    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'admin',
      },
    });

  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ================= REFRESH =================
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, publicKey, { algorithms: ['RS256'] });
    const tenantId = req.tenantId;

    const users = await query(
      tenantId,
      'SELECT * FROM admin WHERE id = ? AND refresh_token = ?',
      [decoded.userId, refreshToken]
    );

    if (users.length === 0) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const user = users[0];

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role || 'admin',
        tenantId,
      },
      privateKey,
      { algorithm: 'RS256', expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh Error:', err);
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// ================= LOGOUT =================
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  try {
    if (refreshToken && req.user) {
      await query(req.tenantId, 'UPDATE admin SET refresh_token = NULL WHERE id = ?', [req.user.userId]);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout Error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;