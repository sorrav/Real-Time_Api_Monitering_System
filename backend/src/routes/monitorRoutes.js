const express = require('express');
const { body } = require('express-validator');
const monitorController = require('../controllers/monitorController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const monitorValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Monitor name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL with http:// or https://'),
  body('method')
    .optional()
    .isIn(['GET', 'POST', 'PUT', 'DELETE'])
    .withMessage('Method must be GET, POST, PUT, or DELETE'),
  body('interval')
    .optional()
    .isInt({ min: 30, max: 3600 })
    .withMessage('Interval must be between 30 and 3600 seconds'),
  body('timeout')
    .optional()
    .isInt({ min: 5, max: 120 })
    .withMessage('Timeout must be between 5 and 120 seconds')
];

// All routes are protected with auth middleware
router.use(auth);

// CRUD routes
router.get('/', monitorController.getMonitors);
router.get('/:id', monitorController.getMonitor);
router.post('/', monitorValidation, monitorController.createMonitor);
router.put('/:id', monitorController.updateMonitor);
router.delete('/:id', monitorController.deleteMonitor);

// Special action routes
router.patch('/:id/favorite', monitorController.toggleFavorite);
router.patch('/:id/toggle', monitorController.toggleActive);

module.exports = router;