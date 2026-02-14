const express = require("express");
const router = express.Router();
const {
  getActivePromo,
  createPromo,
  updatePromo,
  deletePromo,
} = require("../controllers/promo.controller");
const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");
const {
  upload,
  handleMulterError,
} = require("../middlewares/upload.middleware");

// Public route
router.get("/", getActivePromo);

// Admin routes
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"), // Expect field name "image"
  handleMulterError,
  createPromo
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  handleMulterError,
  updatePromo
);

router.delete("/:id", protect, adminOnly, deletePromo);

module.exports = router;