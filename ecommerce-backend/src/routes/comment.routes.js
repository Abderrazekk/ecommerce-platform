const express = require("express");
const router = express.Router();
const {
  createComment,
  updateComment,
  deleteComment,
  getProductComments,
} = require("../controllers/comment.controller");
const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");

// Public route - get comments for a product
router.get("/products/:productId/comments", getProductComments);

// Protected routes
router.post("/products/:productId/comments", protect, createComment);
router.put("/comments/:commentId", protect, updateComment);
router.delete("/comments/:commentId", protect, adminOnly, deleteComment);

module.exports = router;