const mongoose = require('mongoose');
const User = require('../models/User');
const Market = require('../models/Market');
const Listing = require('../models/Listing');
const Fertilizer = require('../models/Fertilizer');
require('dotenv').config();

const defaultFertilizers = [
  {
    cropType: "Wheat",
    soilType: "Alluvial Soil",
    recommendations: [
      {
        name: "Urea (Subsidized)",
        dosage: "45 kg per acre",
        applicationTiming: "Top dressing at first irrigation (21-25 days after sowing)",
        subsidyPercent: 50,
        details: "Provided by National Fertilizers Ltd. Apply with caution under optimal soil moisture."
      },
      {
        name: "DAP (Di-Ammonium Phosphate)",
        dosage: "50 kg per acre",
        applicationTiming: "Basal dose at the time of sowing",
        subsidyPercent: 35,
        details: "Rich source of Nitrogen and Phosphorus for strong alluvial root establishment."
      }
    ]
  },
  {
    cropType: "Rice",
    soilType: "Alluvial Soil",
    recommendations: [
      {
        name: "Urea",
        dosage: "40 kg per acre",
        applicationTiming: "Split application: 50% during tillering, 50% at panicle initiation",
        subsidyPercent: 50,
        details: "Ensure water level is maintained at 2-3 cm for optimal absorption in alluvial delta plains."
      },
      {
        name: "Single Super Phosphate (SSP)",
        dosage: "75 kg per acre",
        applicationTiming: "Basal application during final land preparation",
        subsidyPercent: 30,
        details: "Supplies Phosphorus, Sulphur, and Calcium to enhance grain density."
      }
    ]
  },
  {
    cropType: "Corn",
    soilType: "Black Soil",
    recommendations: [
      {
        name: "NPK (12:32:16)",
        dosage: "80 kg per acre",
        applicationTiming: "Basal dose during sowing",
        subsidyPercent: 30,
        details: "Rich in potassium, critical for black regur soil corn health."
      },
      {
        name: "Urea",
        dosage: "35 kg per acre",
        applicationTiming: "Top dressing at knee-high growth stage",
        subsidyPercent: 50,
        details: "Apply when soil is moist to prevent nitrogen evaporation."
      }
    ]
  },
  {
    cropType: "Coconut",
    soilType: "Laterite Soil",
    recommendations: [
      {
        name: "Muriate of Potash (MOP)",
        dosage: "1.5 kg per tree per year",
        applicationTiming: "Split in two doses: Pre-monsoon (May-June) & Post-monsoon (Sept-Oct)",
        subsidyPercent: 40,
        details: "Potassium is essential for coconut yield. Apply in circular basins 1.5m away from trunk."
      },
      {
        name: "Super Phosphate",
        dosage: "1 kg per tree per year",
        applicationTiming: "Basal application during pre-monsoon basin digging",
        subsidyPercent: 35,
        details: "Increases root strength and helps in acidic laterite soil neutralization."
      }
    ]
  },
  {
    cropType: "Coconut",
    soilType: "Sandy/Desert Soil",
    recommendations: [
      {
        name: "Organic Neem Cake & Potash",
        dosage: "2 kg per tree per year",
        applicationTiming: "Basal dressing in basins after irrigation",
        subsidyPercent: 40,
        details: "Improves water retention in sandy coastal soils while supplying essential nitrogen and potassium."
      }
    ]
  },
  {
    cropType: "Potato",
    soilType: "Alluvial Soil",
    recommendations: [
      {
        name: "NPK (12:32:16)",
        dosage: "100 kg per acre",
        applicationTiming: "Basal application during ridge creation",
        subsidyPercent: 30,
        details: "Balanced mix essential for tuber growth and starch production in loose alluvial soils."
      }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishimarket');
    console.log("Connected to MongoDB for seeding...");

    // 1. Clear existing data
    await User.deleteMany({});
    await Market.deleteMany({});
    await Listing.deleteMany({});
    await Fertilizer.deleteMany({});
    console.log("Cleared existing collection data.");

    // 2. Create Default Users (Password: password123)
    const farmer = new User({
      name: "Ramesh Kumar",
      phone: "9876543210",
      password: "password123",
      role: "farmer",
      preferredLanguage: "hi",
      isOnboarded: true,
      farmerProfile: {
        village: "Rampur",
        district: "Patna",
        state: "Bihar",
        acreage: 5,
        primaryCrops: ["Wheat", "Rice", "Coconut", "Corn"]
      }
    });

    const marketOwner = new User({
      name: "Sanjay Singh",
      phone: "8765432109",
      password: "password123",
      role: "market_owner",
      preferredLanguage: "en",
      isOnboarded: true,
      marketOwnerProfile: {
        licenseNumber: "LIC-2026-99",
        mandiName: "Azadpur Market",
        location: {
          latitude: 28.7161,
          longitude: 77.1706,
          address: "Azadpur, New Delhi, Delhi"
        },
        isVerified: true
      }
    });

    const buyer = new User({
      name: "Amit Gupta (Gupta Traders)",
      phone: "7654321098",
      password: "password123",
      role: "user",
      preferredLanguage: "en",
      isOnboarded: true,
      savedCrops: ["Wheat", "Potato", "Coconut", "Corn"],
      priceAlerts: [
        { cropName: "Wheat", targetPrice: 2300, alertType: "in_app" }
      ]
    });

    await farmer.save();
    await marketOwner.save();
    await buyer.save();
    console.log("Seeded basic Users (Farmer, Market Owner, and Buyer).");

    // 3. Create Default Markets
    const azadpurMandi = await Market.create({
      name: "Azadpur Market",
      district: "North Delhi",
      state: "Delhi",
      location: {
        address: "Azadpur, New Delhi, Delhi",
        latitude: 28.7161,
        longitude: 77.1706
      },
      owner: marketOwner._id,
      licenseNumber: "LIC-2026-99",
      isVerified: true,
      priceBoard: [
        { cropName: "Wheat", priceMin: 2200, priceMax: 2450, unit: "Quintal", date: new Date() },
        { cropName: "Rice", priceMin: 2600, priceMax: 2900, unit: "Quintal", date: new Date() },
        { cropName: "Potato", priceMin: 1100, priceMax: 1400, unit: "Quintal", date: new Date() },
        { cropName: "Onion", priceMin: 1900, priceMax: 2300, unit: "Quintal", date: new Date() },
        { cropName: "Coconut", priceMin: 1500, priceMax: 1800, unit: "Quintal", date: new Date() },
        { cropName: "Corn", priceMin: 1850, priceMax: 2100, unit: "Quintal", date: new Date() }
      ]
    });

    const vashiMandi = await Market.create({
      name: "Vashi APMC Market",
      district: "Navi Mumbai",
      state: "Maharashtra",
      location: {
        address: "Sector 19, Vashi, Navi Mumbai, Maharashtra",
        latitude: 19.0732,
        longitude: 73.0076
      },
      owner: marketOwner._id,
      licenseNumber: "LIC-2026-44",
      isVerified: true,
      priceBoard: [
        { cropName: "Wheat", priceMin: 2300, priceMax: 2600, unit: "Quintal", date: new Date() },
        { cropName: "Rice", priceMin: 2700, priceMax: 3100, unit: "Quintal", date: new Date() },
        { cropName: "Onion", priceMin: 2000, priceMax: 2500, unit: "Quintal", date: new Date() },
        { cropName: "Tomato", priceMin: 1500, priceMax: 2200, unit: "Quintal", date: new Date() },
        { cropName: "Coconut", priceMin: 1600, priceMax: 1900, unit: "Quintal", date: new Date() },
        { cropName: "Corn", priceMin: 1900, priceMax: 2150, unit: "Quintal", date: new Date() }
      ]
    });

    console.log("Seeded Markets & verified daily Price Boards.");

    // Update buyer with saved markets
    buyer.savedMarkets.push(azadpurMandi._id);
    await buyer.save();

    // 4. Create sample listings
    const wheatListing = await Listing.create({
      farmer: farmer._id,
      cropType: "Wheat",
      volume: 45,
      unit: "Quintal",
      qualityGrade: "Grade A",
      expectedPrice: 2350,
      location: {
        village: "Rampur",
        district: "Patna",
        state: "Bihar"
      },
      description: "Organic Sharbati wheat, harvested last week. Excellent grain size, stored in moisture-free silo.",
      status: "verified"
    });

    const riceListing = await Listing.create({
      farmer: farmer._id,
      cropType: "Rice",
      volume: 120,
      unit: "Quintal",
      qualityGrade: "Grade B",
      expectedPrice: 2750,
      location: {
        village: "Rampur",
        district: "Patna",
        state: "Bihar"
      },
      description: "Basmati crop, milled. Clean quality, no broken grains.",
      status: "verified"
    });

    const coconutListing = await Listing.create({
      farmer: farmer._id,
      cropType: "Coconut",
      volume: 50,
      unit: "Quintal",
      qualityGrade: "Grade A",
      expectedPrice: 1700,
      location: {
        village: "Rampur",
        district: "Patna",
        state: "Bihar"
      },
      description: "Fully matured water coconuts, harvested fresh. Clean and sorted.",
      status: "verified"
    });

    const cornListing = await Listing.create({
      farmer: farmer._id,
      cropType: "Corn",
      volume: 75,
      unit: "Quintal",
      qualityGrade: "Grade B",
      expectedPrice: 1950,
      location: {
        village: "Rampur",
        district: "Patna",
        state: "Bihar"
      },
      description: "Yellow dent corn, sun-dried. Moisture level below 12%. Suitable for animal feed or milling.",
      status: "verified"
    });

    const pendingListing = await Listing.create({
      farmer: farmer._id,
      cropType: "Potato",
      volume: 80,
      unit: "Quintal",
      qualityGrade: "Grade B",
      expectedPrice: 1250,
      location: {
        village: "Rampur",
        district: "Patna",
        state: "Bihar"
      },
      description: "Kufri Jyoti variety potato, medium-large sizes.",
      status: "pending"
    });

    // Add a simulated chat dialogue to wheatListing
    wheatListing.inquiries.push({
      buyer: buyer._id,
      messages: [
        { sender: buyer._id, text: "Namaste Ramesh Ji, is this wheat available? Can you offer any discount for 40 Quintals bulk buy?" },
        { sender: farmer._id, text: "Namaste Amit Ji, yes it is available. I can do 2300 per Quintal if you take the entire load of 45 Quintals." },
        { sender: buyer._id, text: "Let me check my transport vehicle availability. I will get back to you by evening." }
      ]
    });
    await wheatListing.save();

    console.log("Seeded sample crop Listings with verified status and buyer chat logs.");

    // 5. Seed Fertilizers
    await Fertilizer.insertMany(defaultFertilizers);
    console.log("Seeded Fertilizer recommendation rules.");

    console.log("Database seeded successfully!");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed: ", error);
    process.exit(1);
  }
};

seedDB();
