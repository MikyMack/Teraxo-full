const mongoose = require('mongoose');

const QASchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  images: [
    { type: String, required: true, trim: true }
  ],
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  subDescription: {
    type: String,
    required: false,
    trim: true
  },
  chemicalBase: {
    type: String,
    required: false,
    trim: true
  },
  appearance: {
    type: String,
    required: false,
    trim: true
  },
  shelfLife: {
    type: String,
    required: false,
    trim: true
  },
  availablePacks: [
    { type: String, required: true, trim: true }
  ],
  cureTime: {
    type: String,
    required: false,
    trim: true
  },
  keyFeatures: [
    { type: String, trim: true }
  ],
  applicationTips: {
    type: String,
    required: false,
    trim: true
  },
  questionsAndAnswers: [QASchema],
  seoTitle: {
    type: String,
    required: false,
    trim: true
  },
  seoKeywords: [
    { type: String, trim: true }
  ],
  seoDescription: {
    type: String,
    required: false,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);

