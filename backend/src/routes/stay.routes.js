const express = require('express');
const router = express.Router();
const StayController = require('../controllers/stay.controller');
const { authMiddleware, authorizeRoles } = require('../middleware/auth.middleware');
const upload = require('../config/upload');

// Public route for search
router.get('/search', StayController.searchNearby);

// Public route — list all listed properties (no PostGIS required)
router.get('/', StayController.getAllStays);

// Protected routes — must come before /:id to avoid conflicts
router.get('/mine', authMiddleware, StayController.getMyStays);
router.get('/metrics', authMiddleware, StayController.getMetrics);

// Public route for single stay
router.get('/:id', StayController.getStayById);

// Protected routes for Owners and Brokers — multipart/form-data (up to 10 images)
router.post(
  '/', 
  authMiddleware, 
  authorizeRoles('owner', 'broker'),
  upload.array('images', 10),
  StayController.createStay
);

// Edit stay — owner/broker (images optional)
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('owner', 'broker'),
  upload.array('images', 10),
  StayController.updateStay
);

router.delete(
  '/:id', 
  authMiddleware, 
  authorizeRoles('owner', 'broker'), 
  StayController.deleteStay
);

module.exports = router;
