const express = require('express');
const { body } = require('express-validator');
const healthController = require('../controllers/healthController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get health records for a monitor (Protected)
router.get('/:monitorId', auth, healthController.getHealthRecords);

// Report health check from worker (Internal - should be protected with API key in production)
router.post('/report', [
  body('monitorId').notEmpty().withMessage('Monitor ID is required'),
  body('status').isIn(['up', 'down']).withMessage('Status must be up or down'),
  body('statusCode').isInt().withMessage('Status code must be an integer'),
  body('responseTime').isInt({ min: 0 }).withMessage('Response time must be a positive integer')
], healthController.reportHealth);

module.exports = router;