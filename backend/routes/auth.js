const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Market = require('../models/Market');
const { protect } = require('../middleware/auth');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'krishimarket_super_secret_key_12345', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user (Step 1: Basic registration)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, preferredLanguage, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already registered with this phone number' });
    }

    // Guests don't need detailed profiles, can auto-onboard
    const isOnboarded = role === 'guest' || role === 'user';

    // Create user
    const user = await User.create({
      name,
      phone,
      email,
      password,
      preferredLanguage: preferredLanguage || 'en',
      role: role || 'user',
      isOnboarded
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        isOnboarded: user.isOnboarded
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// @desc    Complete Onboarding (Step 2: Dynamic profile setup)
// @route   POST /api/auth/onboard
// @access  Private
router.post('/onboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'farmer') {
      const { village, district, state, acreage, primaryCrops } = req.body;
      if (!village || !district || !state) {
        return res.status(400).json({ success: false, message: 'Please provide village, district, and state' });
      }
      user.farmerProfile = { village, district, state, acreage, primaryCrops };
      user.isOnboarded = true;
    } else if (user.role === 'market_owner') {
      const { licenseNumber, mandiName, location } = req.body;
      if (!licenseNumber || !mandiName) {
        return res.status(400).json({ success: false, message: 'Please provide license number and mandi name' });
      }
      user.marketOwnerProfile = {
        licenseNumber,
        mandiName,
        location: location || { address: `${district || ''}, ${state || ''}` },
        isVerified: false // Admin or system verifies later
      };
      
      // Auto-create market reference
      const marketExists = await Market.findOne({ name: mandiName });
      if (!marketExists) {
        await Market.create({
          name: mandiName,
          district: location?.district || 'Default District',
          state: location?.state || 'Default State',
          location: {
            address: location?.address || 'Market Address',
            latitude: location?.latitude || 26.0,
            longitude: location?.longitude || 80.0
          },
          owner: user._id,
          licenseNumber
        });
      }

      user.isOnboarded = true;
    } else {
      user.isOnboarded = true; // Guest or generic user
    }

    await user.save();

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        isOnboarded: user.isOnboarded,
        farmerProfile: user.farmerProfile,
        marketOwnerProfile: user.marketOwnerProfile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during onboarding' });
  }
});

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide phone number and password' });
    }

    // Get user with password select
    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        isOnboarded: user.isOnboarded,
        farmerProfile: user.farmerProfile,
        marketOwnerProfile: user.marketOwnerProfile,
        savedMarkets: user.savedMarkets,
        savedCrops: user.savedCrops,
        priceAlerts: user.priceAlerts
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
});

// @desc    Request forgot password OTP (Simulated)
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this phone number' });
    }

    // Simulating sending SMS OTP
    console.log(`[SIMULATION OTP] Sending OTP '123456' to user ${phone}`);

    res.json({
      success: true,
      message: 'OTP sent to registered phone number successfully (Simulated: Use 123456)'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error requesting OTP' });
  }
});

// @desc    Reset password using simulated OTP
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (otp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
});

// @desc    Update preferences (saved crops/markets, alerts)
// @route   PUT /api/auth/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { savedCrops, savedMarkets, priceAlerts } = req.body;
    const user = await User.findById(req.user._id);

    if (savedCrops) user.savedCrops = savedCrops;
    if (savedMarkets) user.savedMarkets = savedMarkets;
    if (priceAlerts) user.priceAlerts = priceAlerts;

    await user.save();
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating preferences' });
  }
});

module.exports = router;
