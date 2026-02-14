const Order = require("../models/Order.model");
const { Product } = require("../models/Product.model");
const asyncHandler = require("../middlewares/error.middleware").asyncHandler;

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  // NEW: accept description from request body
  const { items, deliveryAddress, phone, description } = req.body;

  console.log("Creating order with items:", items);

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // Validate and process items
  let orderItems = [];
  let productsTotal = 0;
  let highestShippingFee = 0;
  const FREE_SHIPPING_THRESHOLD = 100;

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for: ${product.name}`);
    }

    const itemPrice = product.discountPrice || product.price;
    const itemTotal = itemPrice * item.quantity;
    productsTotal += itemTotal;

    if (product.shippingFee > highestShippingFee) {
      highestShippingFee = product.shippingFee;
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: itemPrice,
      quantity: item.quantity,
      image: product.images[0]?.url || product.image,
      shippingFee: product.shippingFee,
    });

    product.stock -= item.quantity;
    await product.save();
  }

  let shippingFee = 0;
  let freeShipping = false;

  if (productsTotal <= FREE_SHIPPING_THRESHOLD) {
    shippingFee = highestShippingFee;
  } else {
    freeShipping = true;
  }

  const totalPrice = productsTotal + shippingFee;

  // NEW: include description in order creation
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    productsTotal,
    shippingFee,
    totalPrice,
    freeShipping,
    deliveryAddress,
    phone,
    description: description || "", // optional field
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// @desc    Get all orders (admin)
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
    .populate("user", "name email phone address")
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

// @desc    Get user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    orders,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email phone address",
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(401);
    throw new Error("Not authorized to view this order");
  }

  res.json({
    success: true,
    order,
  });
});

// NEW: Delete order (admin only)
// @desc    Delete order
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Optional: restore product stock? Usually not needed for deleted orders, but you could implement if desired.
  await order.deleteOne();

  res.json({
    success: true,
    message: "Order deleted successfully",
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  deleteOrder,
};
