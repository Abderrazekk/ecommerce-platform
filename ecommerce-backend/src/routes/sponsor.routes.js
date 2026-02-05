// File: ecommerce-backend/src/routes/sponsor.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");
const {
  getVisibleSponsors,
  getAllSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  toggleSponsorVisibility,
} = require("../controllers/sponsor.controller");
const { upload, handleMulterError } = require("../middlewares/upload.middleware");

// Public routes
router.get("/", getVisibleSponsors);

// Admin routes (protected)
router.get("/admin", protect, adminOnly, getAllSponsors);
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  handleMulterError,
  createSponsor
);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  handleMulterError,
  updateSponsor
);
router.delete("/:id", protect, adminOnly, deleteSponsor);
router.patch("/:id/toggle-visibility", protect, adminOnly, toggleSponsorVisibility);

module.exports = router;