const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");
const { Product } = require("../models/Product.model"); // FIX: Use named import

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    select: "-__v",
    match: { isVisible: true }, // Only populate visible products
  });

  res.json({
    success: true,
    wishlist: user.wishlist,
    count: user.wishlist.length,
  });
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  // Validate product exists and is visible
  const product = await Product.findOne({
    _id: productId,
    isVisible: true,
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found or not available");
  }

  // Check if product is already in wishlist
  const user = await User.findById(userId);
  const isInWishlist = user.wishlist.some(
    (id) => id.toString() === productId
  );

  if (isInWishlist) {
    res.status(400);
    throw new Error("Product already in wishlist");
  }

  // Add product to wishlist
  await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { wishlist: productId }, // $addToSet prevents duplicates
    },
    { new: true }
  );

  // Return updated wishlist count
  const updatedUser = await User.findById(userId);
  
  res.status(200).json({
    success: true,
    message: "Product added to wishlist",
    count: updatedUser.wishlist.length,
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  // Remove product from wishlist
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: { wishlist: productId },
    },
    { new: true }
  );

  res.json({
    success: true,
    message: "Product removed from wishlist",
    count: user.wishlist.length,
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/users/wishlist/check/:productId
// @access  Private
const checkWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  const isInWishlist = user.wishlist.some(
    (id) => id.toString() === productId
  );

  res.json({
    success: true,
    isInWishlist,
  });
});

// @desc    Get wishlist count
// @route   GET /api/users/wishlist/count
// @access  Private
const getWishlistCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("wishlist");
  
  res.json({
    success: true,
    count: user.wishlist.length,
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  getWishlistCount,
};