const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes are protected
router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;