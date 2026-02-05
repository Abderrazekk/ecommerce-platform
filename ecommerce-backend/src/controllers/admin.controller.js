const User = require("../models/User.model");
const Order = require("../models/Order.model");
const { Product } = require("../models/Product.model");
const asyncHandler = require("../middlewares/error.middleware").asyncHandler;
const {
  getDateRange,
  getTopProducts,
  getOrdersByStatus,
  getRevenueOverTime,
  getNewUsersOverTime,
  getSalesByCategory,
  getTopCustomers,
} = require("./analytics.controller");

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  const totalRevenueResult = await Order.aggregate([
    {
      $match: { status: "delivered" },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalRevenue =
    totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

  const recentOrders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    },
    recentOrders,
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });

  res.json({
    success: true,
    users,
    count: users.length,
  });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status;

  let filter = {};
  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate("user", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

// @desc    Update order status
// @route   PUT /api/admin/order/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "confirmed",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // If cancelling an order, return stock
  if (status === "cancelled" && order.status !== "cancelled") {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
  }

  // Update order status
  const oldStatus = order.status;
  order.status = status;
  await order.save();

  // Populate user info for response
  const populatedOrder = await Order.findById(order._id).populate(
    "user",
    "name email",
  );

  res.json({
    success: true,
    message: `Order status updated from ${oldStatus} to ${status}`,
    order: populatedOrder,
  });
});

// @desc    Create new admin (by admin)
// @route   POST /api/admin/users
// @access  Private/Admin
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "admin",
    phone,
    address,
  });

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBanned: user.isBanned,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    },
  });
});

// @desc    Toggle user ban status
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
const toggleUserBan = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { banReason } = req.body;

  // Find the user
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent self-banning (optional but recommended)
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("Cannot ban/unban yourself");
  }

  // Toggle ban status
  user.isBanned = !user.isBanned;

  if (user.isBanned) {
    // When banning
    user.bannedAt = Date.now();
    user.bannedBy = req.user._id;
    user.banReason = banReason || "Violation of terms of service";
  } else {
    // When unbanning
    user.bannedAt = null;
    user.bannedBy = null;
    user.banReason = null;
  }

  await user.save();

  // Populate bannedBy name
  const populatedUser = await User.findById(user._id)
    .select("-password")
    .populate("bannedBy", "name email");

  // Select specific fields for response
  const userResponse = {
    _id: populatedUser._id,
    name: populatedUser.name,
    email: populatedUser.email,
    role: populatedUser.role,
    isBanned: populatedUser.isBanned,
    bannedAt: populatedUser.bannedAt,
    bannedBy: populatedUser.bannedBy
      ? {
          _id: populatedUser.bannedBy._id,
          name: populatedUser.bannedBy.name,
          email: populatedUser.bannedBy.email,
        }
      : null,
    banReason: populatedUser.banReason,
    phone: populatedUser.phone,
    address: populatedUser.address,
    createdAt: populatedUser.createdAt,
  };

  res.json({
    success: true,
    message: user.isBanned
      ? `User ${user.email} has been banned`
      : `User ${user.email} has been unbanned`,
    user: userResponse,
    action: user.isBanned ? "banned" : "unbanned",
  });
});

// @desc    Get comprehensive dashboard analytics
// @route   GET /api/admin/dashboard/analytics
// @access  Private/Admin
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;

  // Get date range based on period
  const { startDate, endDate } = getDateRange(period);

  // 1. Summary/KPI Cards - Execute all in parallel for performance
  const [
    totalUsers,
    totalAdmins,
    totalProducts,
    totalOrders,
    pendingOrders,
    lowStockProducts,
    totalRevenueResult,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "admin" }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Product.countDocuments({ stock: { $lt: 10 } }),
    Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
  ]);

  const totalRevenue = totalRevenueResult[0]?.total || 0;

  // 2. Execute all analytics queries in parallel
  const [
    topProducts,
    ordersByStatus,
    revenueOverTime,
    newUsersOverTime,
    salesByCategory,
    topCustomers,
    recentOrders,
    lowStockProductsList,
    newUsersList,
  ] = await Promise.all([
    getTopProducts(10),
    getOrdersByStatus(),
    getRevenueOverTime(startDate, endDate),
    getNewUsersOverTime(startDate, endDate),
    getSalesByCategory(),
    getTopCustomers(10),
    // Recent Orders (last 10)
    Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    // Low Stock Products
    Product.find({ stock: { $lt: 10 } })
      .select("name stock category price images")
      .sort({ stock: 1 })
      .limit(10)
      .lean(),
    // New Users (last 10)
    User.find({ role: "user" })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  res.json({
    success: true,
    period,
    summary: {
      totalUsers,
      totalAdmins,
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      totalRevenue,
    },
    analytics: {
      topProducts,
      ordersByStatus,
      revenueOverTime,
      newUsersOverTime,
      salesByCategory,
      topCustomers,
    },
    tables: {
      recentOrders,
      lowStockProducts: lowStockProductsList,
      newUsers: newUsersList,
    },
    updatedAt: new Date(),
  });
});

// @desc    Export analytics data
// @route   GET /api/admin/dashboard/export
// @access  Private/Admin
const exportAnalytics = asyncHandler(async (req, res) => {
  const { format = "csv", type = "summary", startDate, endDate } = req.query;

  try {
    let data;
    const exportUtils = require("../utils/exportUtils");

    switch (type) {
      case "orders":
        data = await Order.find()
          .populate("user", "name email")
          .populate("items.product", "name")
          .lean();
        break;
      case "products":
        data = await Product.find().lean();
        break;
      case "users":
        data = await User.find().lean();
        break;
      case "revenue":
        const dateFilter =
          startDate && endDate
            ? {
                createdAt: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
              }
            : {};
        data = await Order.aggregate([
          { $match: { ...dateFilter, status: "delivered" } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              date: { $first: "$createdAt" },
              revenue: { $sum: "$totalPrice" },
              orders: { $sum: 1 },
              avgOrderValue: { $avg: "$totalPrice" },
            },
          },
          { $sort: { _id: 1 } },
        ]);
        break;
      default:
        // For summary, we need to get the analytics data
        const analytics = await getDashboardAnalytics(req, res, true);
        data = analytics;
    }

    if (format === "csv") {
      const csvData = await exportUtils.convertToCSV(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${type}-export-${Date.now()}.csv`,
      );
      res.send(csvData);
    } else if (format === "pdf") {
      const pdfBuffer = await exportUtils.generatePDFReport(data, type);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${type}-report-${Date.now()}.pdf`,
      );
      res.send(pdfBuffer);
    } else {
      res.status(400).json({
        success: false,
        message: "Unsupported export format",
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export data",
    });
  }
});

// @desc    Get product performance analytics
// @route   GET /api/admin/dashboard/product-performance/:productId
// @access  Private/Admin
const getProductPerformance = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { period = "month" } = req.query;

  const { startDate, endDate } = getDateRange(period);

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const performanceData = await Order.aggregate([
    {
      $match: {
        status: "delivered",
        "items.product": productId,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $unwind: "$items" },
    { $match: { "items.product": productId } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        quantitySold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalStats = await Order.aggregate([
    {
      $match: {
        status: "delivered",
        "items.product": productId,
      },
    },
    { $unwind: "$items" },
    { $match: { "items.product": productId } },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    product: {
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
    },
    performance: performanceData,
    totals: totalStats[0] || {
      totalQuantity: 0,
      totalRevenue: 0,
      totalOrders: 0,
    },
    period,
  });
});

// @desc    Get revenue report with filters
// @route   GET /api/admin/dashboard/revenue-report
// @access  Private/Admin
const getRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = "day" } = req.query;

  let dateFormat;
  switch (groupBy) {
    case "hour":
      dateFormat = "%Y-%m-%d %H:00";
      break;
    case "day":
      dateFormat = "%Y-%m-%d";
      break;
    case "week":
      dateFormat = "%Y-%W";
      break;
    case "month":
      dateFormat = "%Y-%m";
      break;
    default:
      dateFormat = "%Y-%m-%d";
  }

  const matchFilter = { status: "delivered" };
  if (startDate && endDate) {
    matchFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const revenueReport = await Order.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          $dateToString: { format: dateFormat, date: "$createdAt" },
        },
        date: { $first: "$createdAt" },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
        averageOrderValue: { $avg: "$totalPrice" },
        productsSold: { $sum: { $size: "$items" } },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        period: "$_id",
        date: 1,
        revenue: 1,
        orders: 1,
        averageOrderValue: { $round: ["$averageOrderValue", 2] },
        productsSold: 1,
        _id: 0,
      },
    },
  ]);

  // Calculate summary
  const summary = await Order.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: "$totalPrice" },
        maxOrderValue: { $max: "$totalPrice" },
        minOrderValue: { $min: "$totalPrice" },
      },
    },
  ]);

  res.json({
    success: true,
    report: revenueReport,
    summary: summary[0] || {},
    filters: {
      startDate,
      endDate,
      groupBy,
    },
  });
});

// @desc    Get user acquisition metrics
// @route   GET /api/admin/dashboard/user-metrics
// @access  Private/Admin
const getUserMetrics = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;
  const { startDate, endDate } = getDateRange(period);

  const userMetrics = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalUsers: { $sum: 1 },
        regularUsers: {
          $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] },
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
        },
        googleUsers: {
          $sum: { $cond: [{ $eq: ["$authMethod", "google"] }, 1, 0] },
        },
        localUsers: {
          $sum: { $cond: [{ $eq: ["$authMethod", "local"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const conversionRate = await Order.aggregate([
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        totalUsersWithOrders: { $sum: 1 },
        avgOrdersPerUser: { $avg: "$orderCount" },
      },
    },
  ]);

  res.json({
    success: true,
    metrics: userMetrics,
    conversion: conversionRate[0] || {},
    period,
  });
});

// @desc    Delete user permanently
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Find the user
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent self-deletion
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("Cannot delete your own account");
  }

  // Optional: Check if user has active orders before deletion
  const activeOrders = await Order.countDocuments({
    user: userId,
    status: { $nin: ["delivered", "cancelled"] },
  });

  if (activeOrders > 0) {
    res.status(400);
    throw new Error(`Cannot delete user with ${activeOrders} active orders`);
  }

  // Delete user's orders (optional: you might want to keep orders for records)
  await Order.deleteMany({ user: userId });

  // Delete user's wishlist references
  // Note: Products will remain, just remove user's reference

  // Delete user's comments (if you have comments system)
  // await Comment.deleteMany({ user: userId });

  // Finally, delete the user
  await User.findByIdAndDelete(userId);

  res.json({
    success: true,
    message: `User ${user.email} has been permanently deleted`,
    deletedUserId: userId,
  });
});

module.exports = {
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
};
