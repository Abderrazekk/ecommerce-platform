const express = require("express");
const router = express.Router();
const {
  getActiveHero,
  getAllHeroes,
  getHeroById,
  createHero,
  updateHero,
  deleteHero,
} = require("../controllers/hero.controller");
const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");
const {
  upload,
  validateImageCount,
  handleMulterError,
} = require("../middlewares/upload.middleware");

// Public route - Get active hero for homepage
router.get("/", getActiveHero);

// Admin routes - All admin routes are prefixed with /admin
router.get("/admin", protect, adminOnly, getAllHeroes); // GET /api/hero/admin
router.get("/admin/:id", protect, adminOnly, getHeroById); // GET /api/hero/admin/:id
router.post(
  "/admin",
  protect,
  adminOnly,
  upload.array("images", 6),
  validateImageCount,
  handleMulterError, // Add error handler here
  createHero,
); // POST /api/hero/admin
router.put(
  "/admin/:id",
  protect,
  adminOnly,
  upload.array("images", 6),
  validateImageCount,
  handleMulterError, // Add error handler here
  updateHero,
); // PUT /api/hero/admin/:id
router.delete("/admin/:id", protect, adminOnly, deleteHero); // DELETE /api/hero/admin/:id

// Remove this line - handleMulterError should be in the route chain, not as router.use()
// router.use(handleMulterError);

module.exports = router;
