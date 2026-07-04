const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    sparse: true, // Allows null/empty values to not conflict with uniqueness
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Exclude from queries by default
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'farmer', 'market_owner'],
    default: 'user'
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'te', 'mr'],
    default: 'en'
  },
  isOnboarded: {
    type: Boolean,
    default: false
  },
  // Step 2: Farmer onboarding fields
  farmerProfile: {
    village: String,
    district: String,
    state: String,
    acreage: Number,
    primaryCrops: [String]
  },
  // Step 2: Market Owner onboarding fields
  marketOwnerProfile: {
    licenseNumber: String,
    mandiName: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    isVerified: {
      type: Boolean,
      default: false // Mandi must be verified
    }
  },
  // User/Buyer preferences
  savedMarkets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market'
  }],
  savedCrops: [String],
  priceAlerts: [{
    cropName: String,
    targetPrice: Number,
    alertType: {
      type: String,
      enum: ['sms', 'in_app'],
      default: 'in_app'
    }
  }]
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
