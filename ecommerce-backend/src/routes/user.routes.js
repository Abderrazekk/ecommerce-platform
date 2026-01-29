const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  getWishlistCount,
} = require('../controllers/wishlist.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);
router.get('/wishlist/check/:productId', checkWishlist);
router.get('/wishlist/count', getWishlistCount);

module.exports = router;