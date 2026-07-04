const express = require('express');
const router = express.Router();
const Fertilizer = require('../models/Fertilizer');
const { protect } = require('../middleware/auth');

// @desc    Get fertilizer recommendations based on crop and soil type
// @route   GET /api/fertilizers/recommendation
// @access  Private (Farmer or Authenticated user)
router.get('/recommendation', protect, async (req, res) => {
  try {
    const { cropType, soilType } = req.query;

    if (!cropType || !soilType) {
      return res.status(400).json({ success: false, message: 'Please provide cropType and soilType parameters' });
    }

    // Try finding specific match
    let match = await Fertilizer.findOne({
      cropType: { $regex: new RegExp(`^${cropType}$`, 'i') },
      soilType: { $regex: new RegExp(`^${soilType}$`, 'i') }
    });

    // Fallback search if no exact match (partial match)
    if (!match) {
      match = await Fertilizer.findOne({
        cropType: { $regex: cropType, $options: 'i' }
      });
    }

    if (!match) {
      // Return a simulated default advice if no record found in DB
      return res.json({
        success: true,
        cropType,
        soilType,
        recommendations: [
          {
            name: "Organic Compost / NPK (19:19:19)",
            dosage: "100-150 kg per acre",
            applicationTiming: "Sowing stage & early vegetative stage",
            subsidyPercent: 15,
            details: "Apply evenly across fields. Combine with rich organic manure for loamy/sandy soil."
          }
        ]
      });
    }

    res.json({
      success: true,
      cropType: match.cropType,
      soilType: match.soilType,
      recommendations: match.recommendations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving recommendations' });
  }
});

// @desc    Get all available recommendations
// @route   GET /api/fertilizers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const recs = await Fertilizer.find();
    res.json({ success: true, count: recs.length, data: recs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving all fertilizers' });
  }
});

module.exports = router;
