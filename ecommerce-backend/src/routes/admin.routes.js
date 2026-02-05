const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  createAdmin,
  toggleUserBan,
  getDashboardAnalytics,
  exportAnalytics,
  getProductPerformance,
  getRevenueReport,
  getUserMetrics,
  deleteUser,
} = require("../controllers/admin.controller");
const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");

// All admin routes are protected and admin only
router.use(protect);
router.use(adminOnly);

// Dashboard routes
router.get("/dashboard", getDashboardStats);
router.get("/dashboard/analytics", getDashboardAnalytics);
router.get("/dashboard/export", exportAnalytics);
router.get("/dashboard/product-performance/:productId", getProductPerformance);
router.get("/dashboard/revenue-report", getRevenueReport);
router.get("/dashboard/user-metrics", getUserMetrics);

// Existing routes
router.get("/users", getAllUsers);
router.get("/orders", getAllOrders);
router.put("/order/:id/status", updateOrderStatus);
router.post("/users", createAdmin);
router.put("/users/:id/ban", toggleUserBan);
router.delete('/users/:id', deleteUser);

module.exports = router;
