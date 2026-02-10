// ecommerce-backend/src/routes/comment.routes.js
const express = require("express");
const router = express.Router();
const {
  createComment,
  updateComment,
  deleteComment,
  getProductComments,
  getProductRatingSummary,
} = require("../controllers/comment.controller");
const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");

// Public routes
router.get("/products/:productId/comments", getProductComments);
router.get("/products/:productId/rating-summary", getProductRatingSummary);

// Protected routes
router.post("/products/:productId/comments", protect, createComment);
router.put("/comments/:commentId", protect, updateComment);
router.delete("/comments/:commentId", protect, adminOnly, deleteComment);

module.exports = router;
