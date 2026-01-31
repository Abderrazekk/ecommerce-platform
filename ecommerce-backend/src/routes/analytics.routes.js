const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");
const analyticsController = require("../controllers/analytics.controller");

// All analytics routes are protected and admin only
router.use(protect);
router.use(adminOnly);

// Get specific analytics data
router.get("/inventory", async (req, res) => {
  try {
    const inventoryMetrics = await analyticsController.getInventoryMetrics();
    res.json({
      success: true,
      ...inventoryMetrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/conversion", async (req, res) => {
  try {
    const conversionMetrics = await analyticsController.getConversionMetrics();
    res.json({
      success: true,
      ...conversionMetrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/top-products", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topProducts = await analyticsController.getTopProducts(limit);
    res.json({
      success: true,
      products: topProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/orders-by-status", async (req, res) => {
  try {
    const ordersByStatus = await analyticsController.getOrdersByStatus();
    res.json({
      success: true,
      statuses: ordersByStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;