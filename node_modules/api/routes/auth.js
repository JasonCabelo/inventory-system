const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { protect, generateToken } = require('../middlewares/auth');

const router = express.Router();

// Register new user (ADMIN only)
router.post('/register', protect, async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || 'VIEWER'
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If MFA is enabled, return temporary token for MFA verification
    if (user.mfaEnabled) {
      const tempToken = generateToken(user._id);
      return res.json({
        success: true,
        mfaRequired: true,
        tempToken,
        message: 'Please verify MFA code'
      });
    }

    // Generate token and set cookie
    const token = generateToken(user._id);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify MFA code
router.post('/verify-mfa', async (req, res, next) => {
  try {
    const { tempToken, mfaCode } = req.body;

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+mfaSecret');

    if (!user || !user.mfaEnabled) {
      return res.status(400).json({ message: 'MFA not enabled for this user' });
    }

    // Verify MFA code
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: mfaCode,
      window: 1
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid MFA code' });
    }

    // Generate final token and set cookie
    const token = generateToken(user._id);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    next(error);
  }
});

// Setup MFA
router.post('/setup-mfa', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+mfaSecret');

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Enterprise Inventory:${user.email}`
    });

    // Save secret temporarily
    user.mfaSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        qrCode: qrCodeUrl,
        secret: secret.base32
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify and enable MFA
router.post('/verify-setup-mfa', protect, async (req, res, next) => {
  try {
    const { mfaCode } = req.body;
    const user = await User.findById(req.user.id).select('+mfaSecret');

    // Verify MFA code
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: mfaCode,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid MFA code' });
    }

    // Enable MFA
    user.mfaEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: 'MFA enabled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

module.exports = router;
