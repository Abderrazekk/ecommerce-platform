const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  createAdmin,
} = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/admin.middleware');

// All admin routes are protected and admin only
router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.put('/order/:id/status', updateOrderStatus);
router.post('/users', createAdmin);

module.exports = router;