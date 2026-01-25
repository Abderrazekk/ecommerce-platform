const Order = require("../models/Order.model");
const { Product } = require('../models/Product.model');
const asyncHandler = require("../middlewares/error.middleware").asyncHandler;

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryAddress, phone } = req.body;

  console.log("Creating order with items:", items); // Debug log

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // Validate and process items
  let orderItems = [];
  let totalPrice = 0;

  for (const item of items) {
    // Make sure Product model is imported correctly
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for: ${product.name}`);
    }

    const itemTotal = product.price * item.quantity;
    totalPrice += itemTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
    });

    // Update product stock
    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalPrice,
    deliveryAddress,
    phone,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// In fetchAllOrders function (or get all orders for admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status;

  let filter = {};
  if (status) {
    filter.status = status;
  }

  // Populate user information
  const orders = await Order.find(filter)
    .populate('user', 'name email phone address') // Add phone and address if needed
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

// Also update fetchMyOrders to populate user info
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    orders,
  });
});

// Update getOrderById to populate user info
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone address');
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns order or is admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    order,
  });
});



module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders  };
