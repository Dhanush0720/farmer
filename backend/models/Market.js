const mongoose = require('mongoose');

const PriceRecordSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true
  },
  priceMin: {
    type: Number,
    required: true
  },
  priceMax: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'Quintal' // Standard Indian unit: 100 kg
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const MarketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add market name'],
    unique: true
  },
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  priceBoard: [PriceRecordSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Market', MarketSchema);
