const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const InquirySchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [ChatMessageSchema]
}, {
  timestamps: true
});

const ListingSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropType: {
    type: String,
    required: [true, 'Please add a crop type']
  },
  volume: {
    type: Number,
    required: [true, 'Please add volume']
  },
  unit: {
    type: String,
    default: 'Quintal' // or 'kg'
  },
  qualityGrade: {
    type: String,
    enum: ['Grade A', 'Grade B', 'Grade C'],
    default: 'Grade B'
  },
  expectedPrice: {
    type: Number,
    required: [true, 'Please add expected price per unit']
  },
  location: {
    village: String,
    district: String,
    state: String
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'sold', 'rejected'],
    default: 'pending'
  },
  inquiries: [InquirySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Listing', ListingSchema);
