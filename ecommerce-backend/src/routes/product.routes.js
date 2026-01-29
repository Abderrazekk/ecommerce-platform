const express = require("express");
const router = express.Router();
const {
  getProducts,
  getAdminProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
} = require("../controllers/product.controller");
const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");
const {
  upload,
  validateFiles, // Changed from validateImageCount
  handleMulterError,
} = require("../middlewares/upload.middleware");

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/:id", getProductById);

// Admin routes - Updated to use upload.fields for images and video
router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "video", maxCount: 1 },
  ]),
  validateFiles, // Use the new validation
  handleMulterError,
  createProduct,
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "video", maxCount: 1 },
  ]),
  validateFiles, // Use the new validation
  handleMulterError,
  updateProduct,
);

router.delete("/:id", protect, adminOnly, deleteProduct);

// Admin products route
router.get("/admin/products", protect, adminOnly, getAdminProducts);

module.exports = router;
