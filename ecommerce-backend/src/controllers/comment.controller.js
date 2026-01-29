const { Product } = require("../models/Product.model");
const Comment = require("../models/Comment.model");
const asyncHandler = require("express-async-handler");

// @desc    Create a comment
// @route   POST /api/products/:productId/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  console.log("DEBUG - Creating comment:", {
    productId,
    userId,
    text,
    userRole: req.user.role,
  });

  // Validate product exists
  const product = await Product.findById(productId);
  console.log("DEBUG - Product found:", product ? "Yes" : "No");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Validate text
  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  // Check if product is visible (for non-admin users)
  if (!req.user.isAdmin && !product.isVisible) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Create comment
  const comment = await Comment.create({
    user: userId,
    product: productId,
    text: text.trim(),
  });

  console.log("DEBUG - Comment created:", comment._id);

  // Populate user details
  const populatedComment = await Comment.findById(comment._id)
    .populate("user", "_id name email role")
    .lean();

  res.status(201).json({
    success: true,
    comment: populatedComment,
  });
});

// @desc    Update a comment
// @route   PUT /api/comments/:commentId
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;
  const isAdmin = req.user.role === "admin";

  // Validate text
  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  // Find comment and populate user
  const comment = await Comment.findById(commentId).populate("user", "role");
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  // Authorization check
  const isOwner = comment.user._id.toString() === userId.toString();
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to edit this comment");
  }

  // Update comment
  comment.text = text.trim();
  comment.isEdited = true;
  comment.updatedAt = Date.now();

  await comment.save();

  // Populate user details again
  const populatedComment = await Comment.findById(comment._id)
    .populate("user", "_id name email role")
    .lean();

  res.json({
    success: true,
    comment: populatedComment,
  });
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private/Admin
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  await comment.deleteOne();

  res.json({
    success: true,
    message: "Comment deleted successfully",
  });
});

// @desc    Get comments for a product
// @route   GET /api/products/:productId/comments
// @access  Public
const getProductComments = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  console.log("DEBUG - Fetching comments for product:", productId);

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

  // FIXED: Properly populate user with _id field
  const comments = await Comment.find({ product: productId })
    .populate({
      path: "user",
      select: "_id name email role", // Explicitly include _id
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Comment.countDocuments({ product: productId });
  const totalPages = Math.ceil(total / limit);

  console.log(
    `DEBUG - Found ${comments.length} comments for product ${productId}`,
  );
  console.log("DEBUG - Sample comment user:", comments[0]?.user);

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

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getProductComments,
};
