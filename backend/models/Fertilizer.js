const mongoose = require('mongoose');

const RecommendedFertilizerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String, // e.g. "50 kg/acre"
    required: true
  },
  applicationTiming: {
    type: String, // e.g. "Sowing stage", "2-3 weeks after sowing"
    required: true
  },
  subsidyPercent: {
    type: Number, // e.g. 30 for 30% government subsidy
    default: 0
  },
  details: {
    type: String
  }
});

const FertilizerSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: true
  },
  soilType: {
    type: String,
    required: true
  },
  recommendations: [RecommendedFertilizerSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Fertilizer', FertilizerSchema);
