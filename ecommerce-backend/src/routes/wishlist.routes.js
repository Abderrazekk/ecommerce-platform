const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkInWishlist,
  clearWishlist,
} = require("../controllers/wishlist.controller");

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/wishlist - Get user's wishlist
router.get("/", getWishlist);

// POST /api/wishlist - Add product to wishlist
router.post("/", addToWishlist);

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete("/:productId", removeFromWishlist);

// GET /api/wishlist/check/:productId - Check if product is in wishlist
router.get("/check/:productId", checkInWishlist);

// DELETE /api/wishlist - Clear entire wishlist
router.delete("/", clearWishlist);

module.exports = router;