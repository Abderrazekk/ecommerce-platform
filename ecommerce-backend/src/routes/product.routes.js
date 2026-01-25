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
  validateImageCount,
  handleMulterError,
} = require("../middlewares/upload.middleware");

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/:id", getProductById);

// Admin routes - Add error handler after multer
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 6), // Accept up to 6 images
  validateImageCount,
  handleMulterError,
  createProduct,
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 6), // Accept up to 6 images
  validateImageCount,
  handleMulterError,
  updateProduct,
);

router.delete("/:id", protect, adminOnly, deleteProduct);

// Admin products route (gets all products including hidden)
router.get("/admin/products", protect, adminOnly, getAdminProducts);

module.exports = router;
