const { validationResult } = require('express-validator');
const Monitor = require('../models/Monitor');
const HealthRecord = require('../models/HealthRecord');

// @desc    Get all monitors for user
// @route   GET /api/monitors
// @access  Private
exports.getMonitors = async (req, res, next) => {
  try {
    const { status, favorite, sort } = req.query;

    // Build query
    let query = { userId: req.userId };

    // Filter by status
    if (status && status !== 'all') {
      query.currentStatus = status;
    }

    // Filter by favorite
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'latency-asc':
        sortOption = { currentLatency: 1 };
        break;
      case 'latency-desc':
        sortOption = { currentLatency: -1 };
        break;
      case 'name-asc':
        sortOption = { name: 1 };
        break;
      case 'name-desc':
        sortOption = { name: -1 };
        break;
      case 'status':
        sortOption = { currentStatus: 1 };
        break;
      case 'recent':
      default:
        sortOption = { lastChecked: -1 };
    }

    const monitors = await Monitor.find(query).sort(sortOption);

    // Get summary statistics
    const allMonitors = await Monitor.find({ userId: req.userId });
    const summary = {
      total: allMonitors.length,
      up: allMonitors.filter(m => m.currentStatus === 'up').length,
      down: allMonitors.filter(m => m.currentStatus === 'down').length,
      unknown: allMonitors.filter(m => m.currentStatus === 'unknown').length,
      favorites: allMonitors.filter(m => m.isFavorite).length
    };

    res.status(200).json({
      success: true,
      count: monitors.length,
      summary,
      data: monitors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single monitor
// @route   GET /api/monitors/:id
// @access  Private
exports.getMonitor = async (req, res, next) => {
  try {
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new monitor
// @route   POST /api/monitors
// @access  Private
exports.createMonitor = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, url, method, interval, timeout, isFavorite } = req.body;

    const monitor = await Monitor.create({
      userId: req.userId,
      name,
      url,
      method: method || 'GET',
      interval: interval || 60,
      timeout: timeout || 30,
      isFavorite: isFavorite || false,
      isActive: true,
      currentStatus: 'unknown'
    });

    res.status(201).json({
      success: true,
      message: 'Monitor created successfully',
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update monitor
// @route   PUT /api/monitors/:id
// @access  Private
exports.updateMonitor = async (req, res, next) => {
  try {
    const { name, url, method, interval, timeout, isActive, isFavorite } = req.body;

    let monitor = await Monitor.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    // Update fields
    if (name !== undefined) monitor.name = name;
    if (url !== undefined) monitor.url = url;
    if (method !== undefined) monitor.method = method;
    if (interval !== undefined) monitor.interval = interval;
    if (timeout !== undefined) monitor.timeout = timeout;
    if (isActive !== undefined) monitor.isActive = isActive;
    if (isFavorite !== undefined) monitor.isFavorite = isFavorite;

    await monitor.save();

    res.status(200).json({
      success: true,
      message: 'Monitor updated successfully',
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete monitor
// @route   DELETE /api/monitors/:id
// @access  Private
exports.deleteMonitor = async (req, res, next) => {
  try {
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    // Delete associated health records
    await HealthRecord.deleteMany({ monitorId: monitor._id });

    // Delete monitor
    await monitor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Monitor and associated health records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle monitor favorite
// @route   PATCH /api/monitors/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    monitor.isFavorite = !monitor.isFavorite;
    await monitor.save();

    res.status(200).json({
      success: true,
      message: `Monitor ${monitor.isFavorite ? 'added to' : 'removed from'} favorites`,
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle monitor active status
// @route   PATCH /api/monitors/:id/toggle
// @access  Private
exports.toggleActive = async (req, res, next) => {
  try {
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: 'Monitor not found'
      });
    }

    monitor.isActive = !monitor.isActive;
    await monitor.save();

    res.status(200).json({
      success: true,
      message: `Monitor ${monitor.isActive ? 'activated' : 'paused'}`,
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};