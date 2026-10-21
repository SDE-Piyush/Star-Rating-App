const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  createUser,
  getStores,
  createStore,
  getAvailableOwners
} = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// All admin routes require ADMIN role
router.use(authenticateToken, requireRole('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/stores', getStores);
router.post('/stores', createStore);
router.get('/owners', getAvailableOwners);

module.exports = router;
