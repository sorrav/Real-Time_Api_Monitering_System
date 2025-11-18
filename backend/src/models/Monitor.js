const mongoose = require('mongoose');

const monitorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    default: 'GET'
  },
  interval: {
    type: Number,
    default: 60, // seconds
    min: 30
  },
  timeout: {
    type: Number,
    default: 30, // seconds
    min: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  currentStatus: {
    type: String,
    enum: ['up', 'down', 'unknown'],
    default: 'unknown'
  },
  currentLatency: {
    type: Number,
    default: 0
  },
  lastChecked: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
monitorSchema.index({ userId: 1, isActive: 1 });
monitorSchema.index({ userId: 1, isFavorite: 1 });
monitorSchema.index({ userId: 1, currentStatus: 1 });

// Update the updatedAt timestamp before saving
monitorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Monitor', monitorSchema);