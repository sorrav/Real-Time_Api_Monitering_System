const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  monitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monitor',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['up', 'down'],
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number, // in milliseconds
    required: true
  },
  errorMessage: {
    type: String,
    default: null
  },
  checkedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient time-series queries
healthRecordSchema.index({ monitorId: 1, checkedAt: -1 });

// TTL index to automatically delete records older than 30 days
healthRecordSchema.index({ checkedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('HealthRecord', healthRecordSchema);