const HealthRecord = require('../models/HealthRecord');
const Monitor = require('../models/Monitor');

// @desc    Get health records for a monitor
// @route   GET /api/health/:monitorId
// @access  Private
exports.getHealthRecords = async (req, res, next) => {
  try {
    const { monitorId } = req.params;
    const { timeRange = '24h', limit = 100 } = req.query;

    // Verify monitor belongs to user
    const monitor = await Monitor.findOne({
      _id: monitorId,
      userId: req.userId
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    // Calculate time range
    const now = new Date();
    let startTime;

    switch (timeRange) {
      case '1h':
        startTime = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now - 24 * 60 * 60 * 1000);
    }

    // Fetch health records
    const records = await HealthRecord.find({
      monitorId,
      checkedAt: { $gte: startTime }
    })
      .sort({ checkedAt: -1 })
      .limit(parseInt(limit));

    // Calculate statistics
    const stats = await calculateStats(monitorId, startTime);

    res.status(200).json({
      success: true,
      count: records.length,
      timeRange,
      stats,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Receive health check from worker
// @route   POST /api/health/report
// @access  Internal (Worker service)
exports.reportHealth = async (req, res, next) => {
  try {
    const { monitorId, status, statusCode, responseTime, errorMessage } = req.body;

    // Verify monitor exists
    const monitor = await Monitor.findById(monitorId);
    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    // Create health record
    const healthRecord = await HealthRecord.create({
      monitorId,
      status,
      statusCode,
      responseTime,
      errorMessage: errorMessage || null,
      checkedAt: new Date()
    });

    // Update monitor's current status
    monitor.currentStatus = status;
    monitor.currentLatency = responseTime;
    monitor.lastChecked = new Date();
    await monitor.save();

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io && io.emitHealthUpdate) {
      io.emitHealthUpdate(monitorId, monitor.userId.toString(), {
        monitorId,
        status,
        statusCode,
        responseTime,
        timestamp: healthRecord.checkedAt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Health check reported successfully',
      data: healthRecord
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate statistics
async function calculateStats(monitorId, startTime) {
  const records = await HealthRecord.find({
    monitorId,
    checkedAt: { $gte: startTime }
  });

  if (records.length === 0) {
    return {
      uptime: 0,
      averageLatency: 0,
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0
    };
  }

  const successfulChecks = records.filter(r => r.status === 'up').length;
  const failedChecks = records.filter(r => r.status === 'down').length;
  const totalLatency = records.reduce((sum, r) => sum + r.responseTime, 0);

  return {
    uptime: ((successfulChecks / records.length) * 100).toFixed(2),
    averageLatency: Math.round(totalLatency / records.length),
    totalChecks: records.length,
    successfulChecks,
    failedChecks
  };
}