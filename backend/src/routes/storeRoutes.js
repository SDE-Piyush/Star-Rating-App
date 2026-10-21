const express = require('express');
const router = express.Router();
const { getStoresForUser, submitOrUpdateRating } = require('../controllers/storeController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Get stores catalog with search & personal rating
router.get('/', authenticateToken, requireRole('USER', 'ADMIN'), getStoresForUser);

// Submit or modify rating for a store (normal users)
router.post('/:storeId/rate', authenticateToken, requireRole('USER'), submitOrUpdateRating);

module.exports = router;
