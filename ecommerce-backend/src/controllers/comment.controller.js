// ecommerce-backend/src/controllers/comment.controller.js
const { Product } = require("../models/Product.model");
const Comment = require("../models/Comment.model");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

// @desc    Create a review (comment with rating)
// @route   POST /api/products/:productId/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { text, rating } = req.body;
  const userId = req.user._id;

  // Validate product exists
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Validate text and rating
  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error("Review text is required");
  }

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5 stars");
  }

  // Check if user has already reviewed this product
  const existingReview = await Comment.findOne({
    user: userId,
    product: productId,
  });

  if (existingReview) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  // Check if product is visible (for non-admin users)
  if (!req.user.isAdmin && !product.isVisible) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Create review
  const comment = await Comment.create({
    user: userId,
    product: productId,
    text: text.trim(),
    rating: parseInt(rating),
  });

  // Update product rating statistics IMMEDIATELY
  await updateProductRating(productId);

  // Populate user details
  const populatedComment = await Comment.findById(comment._id)
    .populate("user", "_id name email role")
    .lean();

  res.status(201).json({
    success: true,
    comment: populatedComment,
  });
});

// @desc    Update a review
// @route   PUT /api/comments/:commentId
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text, rating } = req.body;
  const userId = req.user._id;
  const isAdmin = req.user.role === "admin";

  // Validate text and rating
  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error("Review text is required");
  }

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5 stars");
  }

  // Find comment and populate user
  const comment = await Comment.findById(commentId).populate("user", "role");
  if (!comment) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Authorization check
  const isOwner = comment.user._id.toString() === userId.toString();
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to edit this review");
  }

  // Update comment
  comment.text = text.trim();
  comment.rating = parseInt(rating);
  comment.isEdited = true;
  comment.updatedAt = Date.now();

  await comment.save();

  // Update product rating statistics
  await updateProductRating(comment.product);

  // Populate user details again
  const populatedComment = await Comment.findById(comment._id)
    .populate("user", "_id name email role")
    .lean();

  res.json({
    success: true,
    comment: populatedComment,
  });
});

// @desc    Delete a review
// @route   DELETE /api/comments/:commentId
// @access  Private/Admin
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Review not found");
  }

  const productId = comment.product;

  await comment.deleteOne();

  // Update product rating statistics
  await updateProductRating(productId);

  res.json({
    success: true,
    message: "Review deleted successfully",
  });
});

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/comments
// @access  Public
const getProductComments = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || "newest"; // newest, highest, lowest

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // For non-admin users, check product visibility
  if (!req.user?.isAdmin && !product.isVisible) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Build sort object
  let sortObject = { createdAt: -1 }; // Default: newest first
  if (sortBy === "highest") {
    sortObject = { rating: -1, createdAt: -1 };
  } else if (sortBy === "lowest") {
    sortObject = { rating: 1, createdAt: -1 };
  }

  // Get comments
  const comments = await Comment.find({ product: productId })
    .populate({
      path: "user",
      select: "_id name email role", // Explicitly include _id
    })
    .sort(sortObject)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Comment.countDocuments({ product: productId });
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

// @desc    Get product rating summary
// @route   GET /api/products/:productId/rating-summary
// @access  Public
const getProductRatingSummary = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const ratingSummary = await Comment.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);

  if (ratingSummary.length === 0) {
    return res.json({
      success: true,
      summary: {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
    });
  }

  // Calculate distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingSummary[0].ratingDistribution.forEach((rating) => {
    if (distribution[rating] !== undefined) {
      distribution[rating] += 1;
    }
  });

  res.json({
    success: true,
    summary: {
      averageRating: parseFloat(ratingSummary[0].averageRating.toFixed(1)),
      totalReviews: ratingSummary[0].totalReviews,
      distribution,
    },
  });
});

// FIXED: Helper function to update product rating statistics
const updateProductRating = async (productId) => {
  try {
    const ratingSummary = await Comment.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          ratingsCount: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    if (ratingSummary.length > 0) {
      const { averageRating, ratingsCount, ratingDistribution } =
        ratingSummary[0];

      // Calculate distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratingDistribution.forEach((rating) => {
        const ratingKey = parseInt(rating);
        if (distribution[ratingKey] !== undefined) {
          distribution[ratingKey] += 1;
        }
      });

      // Update product
      await Product.findByIdAndUpdate(
        productId,
        {
          averageRating: parseFloat(averageRating.toFixed(1)),
          ratingsCount,
          ratingDistribution: distribution,
        },
        { new: true },
      );
    } else {
      // No reviews, reset to defaults
      await Product.findByIdAndUpdate(
        productId,
        {
          averageRating: 0,
          ratingsCount: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
        { new: true },
      );
    }
  } catch (error) {
    // Silently ignore errors to avoid breaking the main request
  }
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getProductComments,
  getProductRatingSummary,
};
