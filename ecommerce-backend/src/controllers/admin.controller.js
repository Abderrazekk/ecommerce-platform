const User = require("../models/User.model");
const Order = require("../models/Order.model");
const { Product } = require("../models/Product.model");
const asyncHandler = require("../middlewares/error.middleware").asyncHandler;

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

  order.status = status;
  await order.save();

  res.json({
    success: true,
    order,
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

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  createAdmin,
  toggleUserBan,
};
