const Wishlist = require("../models/Wishlist.model");
const { Product } = require("../models/Product.model");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [],
      });
    }

    // Populate product details
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: "items.product",
        select:
          "name price discountPrice images brand category stock isVisible createdAt",
      })
      .lean();

    // Filter out null products or hidden products
    const validItems = populatedWishlist.items.filter(
      (item) => item.product && item.product.isVisible !== false,
    );

    res.status(200).json({
      success: true,
      wishlist: {
        _id: populatedWishlist._id,
        user: populatedWishlist.user,
        items: validItems,
        itemCount: validItems.length,
        createdAt: populatedWishlist.createdAt,
        updatedAt: populatedWishlist.updatedAt,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch wishlist");
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      res.status(400);
      throw new Error("Product ID is required");
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error("Invalid product ID");
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Check if product is visible
    if (!product.isVisible) {
      res.status(400);
      throw new Error("Product is not available");
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [{ product: productId }],
      });
    } else {
      // Check if already in wishlist
      const existingItem = wishlist.items.find(
        (item) => item.product.toString() === productId,
      );

      if (existingItem) {
        res.status(400);
        throw new Error("Product already in wishlist");
      }

      // Add product to wishlist
      wishlist.items.push({ product: productId });
      await wishlist.save();
    }

    // Get updated wishlist with populated products
    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: "items.product",
        select: "name price discountPrice images brand category stock",
      })
      .lean();

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: {
        _id: updatedWishlist._id,
        user: updatedWishlist.user,
        items: updatedWishlist.items,
        itemCount: updatedWishlist.items.length,
      },
      addedProductId: productId,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Failed to add to wishlist");
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!productId) {
      res.status(400);
      throw new Error("Product ID is required");
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error("Invalid product ID");
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      res.status(404);
      throw new Error("Wishlist not found");
    }

    // Check initial count
    const initialCount = wishlist.items.length;

    // Remove the product
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId,
    );

    // Check if anything was removed
    if (wishlist.items.length === initialCount) {
      res.status(404);
      throw new Error("Product not found in wishlist");
    }

    // Save the changes
    await wishlist.save();

    // Verify the save (no console.log needed)
    const savedWishlist = await Wishlist.findById(wishlist._id);

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      removedProductId: productId,
      itemCount: savedWishlist.items.length,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Failed to remove from wishlist");
  }
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkInWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!productId) {
      res.status(400);
      throw new Error("Product ID is required");
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error("Invalid product ID");
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.json({
        success: true,
        inWishlist: false,
        productId,
      });
    }

    const inWishlist = wishlist.items.some(
      (item) => item.product.toString() === productId,
    );

    res.json({
      success: true,
      inWishlist,
      productId,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to check wishlist status");
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      res.status(404);
      throw new Error("Wishlist not found");
    }

    // Clear all items
    wishlist.items = [];
    await wishlist.save();

    res.json({
      success: true,
      message: "Wishlist cleared successfully",
      itemCount: 0,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to clear wishlist");
  }
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkInWishlist,
  clearWishlist,
};
