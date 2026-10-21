const express = require('express');
const router = express.Router();
const { getOwnerDashboard } = require('../controllers/ownerController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticateToken, requireRole('STORE_OWNER'), getOwnerDashboard);

module.exports = router;
