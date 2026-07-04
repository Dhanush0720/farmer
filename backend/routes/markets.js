const express = require('express');
const router = express.Router();
const Market = require('../models/Market');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// @desc    Get all verified mandis/markets
// @route   GET /api/markets
// @access  Public
router.get('/', async (req, res) => {
  try {
    const markets = await Market.find({ isVerified: true })
      .populate('owner', 'name phone');
    res.json({ success: true, count: markets.length, data: markets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving markets' });
  }
});

// @desc    Get details of a specific market (including price board)
// @route   GET /api/markets/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const market = await Market.findById(req.params.id).populate('owner', 'name phone');
    if (!market) {
      return res.status(404).json({ success: false, message: 'Market not found' });
    }
    res.json({ success: true, data: market });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving market details' });
  }
});

// @desc    Get the daily verified price board for all markets for comparison
// @route   GET /api/markets/compare/prices
// @access  Public
router.get('/compare/prices', async (req, res) => {
  try {
    const { cropName } = req.query;
    if (!cropName) {
      return res.status(400).json({ success: false, message: 'Please specify cropName parameter' });
    }

    const markets = await Market.find({ isVerified: true });
    let comparison = [];

    markets.forEach(m => {
      // Find latest record for cropName
      const records = m.priceBoard.filter(
        p => p.cropName.toLowerCase() === cropName.toLowerCase()
      );
      if (records.length > 0) {
        // Sort by date descending to get the latest
        records.sort((a, b) => b.date - a.date);
        comparison.push({
          marketId: m._id,
          marketName: m.name,
          district: m.district,
          state: m.state,
          cropName: records[0].cropName,
          priceMin: records[0].priceMin,
          priceMax: records[0].priceMax,
          unit: records[0].unit,
          date: records[0].date
        });
      }
    });

    res.json({ success: true, data: comparison });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error comparing prices' });
  }
});

// @desc    Get logged-in market owner's mandi/market details
// @route   GET /api/markets/my-mandi/dashboard
// @access  Private (Market Owner only)
router.get('/my-mandi/dashboard', protect, checkRole('market_owner'), async (req, res) => {
  try {
    const market = await Market.findOne({ owner: req.user._id });
    if (!market) {
      return res.status(404).json({ success: false, message: 'No registered mandi found for this owner' });
    }
    res.json({ success: true, data: market });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching owner mandi details' });
  }
});

// @desc    Publish/update crop price records on the mandi's price board
// @route   POST /api/markets/:id/prices
// @access  Private (Market Owner only)
router.post('/:id/prices', protect, checkRole('market_owner'), async (req, res) => {
  try {
    const { cropName, priceMin, priceMax, unit } = req.body;
    if (!cropName || priceMin === undefined || priceMax === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide cropName, priceMin, and priceMax' });
    }

    const market = await Market.findById(req.params.id);
    if (!market) {
      return res.status(404).json({ success: false, message: 'Market not found' });
    }

    // Verify ownership
    if (market.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to manage this market board' });
    }

    // Push new price record to board
    market.priceBoard.push({
      cropName,
      priceMin: Number(priceMin),
      priceMax: Number(priceMax),
      unit: unit || 'Quintal',
      date: new Date()
    });

    await market.save();

    // Check for matching user SMS price alerts
    try {
      const { sendSMS } = require('../utils/smsHelper');
      const usersToAlert = await User.find({
        'priceAlerts.cropName': { $regex: new RegExp(`^${cropName}$`, 'i') }
      });

      for (const u of usersToAlert) {
        // Find if any alert matches the crop and price threshold
        const match = u.priceAlerts.find(
          a => a.cropName.toLowerCase() === cropName.toLowerCase() && Number(priceMax) >= a.targetPrice
        );
        if (match) {
          const msg = `KrishiMarket Alert: ${cropName} max price in ${market.name} has reached ₹${priceMax}/Quintal, matching your target of ₹${match.targetPrice}.`;
          await sendSMS(u.phone, msg);
        }
      }
    } catch (smsErr) {
      console.error('Error checking SMS price alerts:', smsErr);
    }

    res.status(201).json({ success: true, message: 'Price board updated successfully', data: market });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating price board' });
  }
});

// @desc    Admin utility: Verify a market
// @route   PUT /api/markets/:id/verify-mandi
// @access  Private (Market Owner only)
router.put('/:id/verify-mandi', protect, checkRole('market_owner'), async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) {
      return res.status(404).json({ success: false, message: 'Market not found' });
    }

    market.isVerified = true;
    await market.save();

    // Also verify owner profile
    const owner = await User.findById(market.owner);
    if (owner && owner.marketOwnerProfile) {
      owner.marketOwnerProfile.isVerified = true;
      await owner.save();
    }

    res.json({ success: true, message: 'Mandi successfully verified', data: market });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error verifying market' });
  }
});

module.exports = router;
