const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,   
  deleteOrder,
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/admin.middleware'); // import adminOnly

// All routes are protected
router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

// Admin only routes – use adminOnly middleware
router.get('/admin/orders', adminOnly, getAllOrders);
router.delete('/admin/orders/:id', adminOnly, deleteOrder);

module.exports = router;