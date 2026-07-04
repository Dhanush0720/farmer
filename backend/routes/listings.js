const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// @desc    Get all verified crop listings
// @route   GET /api/listings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { cropType, district, state, grade } = req.query;
    let query = { status: 'verified' }; // Only show verified by default to buyers

    if (cropType) {
      query.cropType = { $regex: cropType, $options: 'i' };
    }
    if (grade) {
      query.qualityGrade = grade;
    }
    if (district) {
      query['location.district'] = { $regex: district, $options: 'i' };
    }
    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }

    const listings = await Listing.find(query)
      .populate('farmer', 'name phone preferredLanguage')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving listings' });
  }
});

// @desc    Get listings created by the logged-in farmer
// @route   GET /api/listings/my-listings
// @access  Private (Farmer only)
router.get('/my-listings', protect, checkRole('farmer'), async (req, res) => {
  try {
    const listings = await Listing.find({ farmer: req.user._id })
      .populate('inquiries.buyer', 'name phone')
      .populate('inquiries.messages.sender', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving farmer listings' });
  }
});

// @desc    Get all pending crop listings for validation
// @route   GET /api/listings/pending
// @access  Private (Market Owner only)
router.get('/pending', protect, checkRole('market_owner'), async (req, res) => {
  try {
    // Mandi owner can verify listings
    const listings = await Listing.find({ status: 'pending' })
      .populate('farmer', 'name phone farmerProfile')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving pending listings' });
  }
});

// @desc    Create a crop listing
// @route   POST /api/listings
// @access  Private (Farmer only)
router.post('/', protect, checkRole('farmer'), async (req, res) => {
  try {
    const { cropType, volume, unit, qualityGrade, expectedPrice, description } = req.body;

    const farmerProfile = req.user.farmerProfile || {};

    const listing = await Listing.create({
      farmer: req.user._id,
      cropType,
      volume,
      unit: unit || 'Quintal',
      qualityGrade,
      expectedPrice,
      location: {
        village: farmerProfile.village || '',
        district: farmerProfile.district || '',
        state: farmerProfile.state || ''
      },
      description,
      status: 'pending' // verified by mandi admins
    });

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating listing' });
  }
});

// @desc    Verify or reject a crop listing
// @route   PUT /api/listings/:id/verify
// @access  Private (Market Owner only)
router.put('/:id/verify', protect, checkRole('market_owner'), async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    listing.status = status;
    await listing.save();

    res.json({ success: true, message: `Listing is now ${status}`, data: listing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating verification status' });
  }
});

// @desc    Update listing status (e.g. mark as sold)
// @route   PUT /api/listings/:id/status
// @access  Private (Farmer only)
router.put('/:id/status', protect, checkRole('farmer'), async (req, res) => {
  try {
    const { status } = req.body; // 'sold' or 'verified' or 'pending'
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check ownership
    if (listing.farmer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Unauthorized action' });
    }

    listing.status = status;
    await listing.save();

    res.json({ success: true, message: `Listing marked as ${status}`, data: listing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// @desc    Send a message / inquiry regarding a listing
// @route   POST /api/listings/:id/message
// @access  Private (Authenticated users)
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { text, buyerId } = req.body; // if sender is farmer, buyerId must be specified to select chat context
    if (!text) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const listing = await Listing.findById(req.params.id).populate('farmer');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const isFarmer = listing.farmer._id.toString() === req.user._id.toString();
    let targetBuyerId = isFarmer ? buyerId : req.user._id;

    if (!targetBuyerId) {
      return res.status(400).json({ success: false, message: 'Buyer ID is required to reply' });
    }

    // Find or create conversation for this buyer
    let inquiry = listing.inquiries.find(inq => inq.buyer.toString() === targetBuyerId.toString());
    if (!inquiry) {
      if (isFarmer) {
        return res.status(400).json({ success: false, message: 'Inquiry thread does not exist yet' });
      }
      inquiry = {
        buyer: req.user._id,
        messages: []
      };
      listing.inquiries.push(inquiry);
      inquiry = listing.inquiries[listing.inquiries.length - 1];
    }

    // Push new message
    inquiry.messages.push({
      sender: req.user._id,
      text: text
    });

    await listing.save();

    res.status(201).json({ success: true, message: 'Message sent successfully', data: inquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error sending message' });
  }
});

// @desc    Get user's chat inbox (All listing conversations)
// @route   GET /api/listings/messages/inbox
// @access  Private (Authenticated users)
router.get('/messages/inbox', protect, async (req, res) => {
  try {
    // If user is a farmer, fetch all listings they own and return all active inquiries.
    // If user is a buyer, fetch all listings containing inquiries where they are the buyer.
    let inbox = [];

    if (req.user.role === 'farmer') {
      const listings = await Listing.find({ farmer: req.user._id })
        .populate('farmer', 'name')
        .populate('inquiries.buyer', 'name phone')
        .populate('inquiries.messages.sender', 'name role');

      listings.forEach(listing => {
        listing.inquiries.forEach(inquiry => {
          if (inquiry.messages.length > 0) {
            inbox.push({
              listingId: listing._id,
              cropType: listing.cropType,
              expectedPrice: listing.expectedPrice,
              unit: listing.unit,
              otherParty: inquiry.buyer,
              messages: inquiry.messages,
              lastUpdated: inquiry.updatedAt
            });
          }
        });
      });
    } else {
      // General user / buyer
      const listings = await Listing.find({ 'inquiries.buyer': req.user._id })
        .populate('farmer', 'name phone')
        .populate('inquiries.messages.sender', 'name role');

      listings.forEach(listing => {
        const inquiry = listing.inquiries.find(inq => inq.buyer.toString() === req.user._id.toString());
        if (inquiry && inquiry.messages.length > 0) {
          inbox.push({
            listingId: listing._id,
            cropType: listing.cropType,
            expectedPrice: listing.expectedPrice,
            unit: listing.unit,
            otherParty: listing.farmer,
            messages: inquiry.messages,
            lastUpdated: inquiry.updatedAt
          });
        }
      });
    }

    // Sort inbox by most recent message
    inbox.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

    res.json({ success: true, count: inbox.length, data: inbox });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving messages' });
  }
});

module.exports = router;
