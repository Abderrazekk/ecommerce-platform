// product.routes.js
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
  getSimilarProducts,
} = require("../controllers/product.controller");
const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");
const {
  upload,
  handleMulterError,
} = require("../middlewares/upload.middleware");

// Public routes (unchanged)
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/:id/similar", getSimilarProducts);
router.get("/:id", getProductById);

// Admin routes - now using upload.any()
router.post(
  "/",
  protect,
  adminOnly,
  upload.any(), // Accept any files – we'll sort them in the controller
  handleMulterError,
  createProduct,
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.any(),
  handleMulterError,
  updateProduct,
);

router.delete("/:id", protect, adminOnly, deleteProduct);
router.get("/admin/products", protect, adminOnly, getAdminProducts);

module.exports = router;
