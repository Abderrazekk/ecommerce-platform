const User = require("../models/User.model");
const Order = require("../models/Order.model");
const { Product } = require("../models/Product.model");

// Helper function to get date range based on period
const getDateRange = (period) => {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'all':
      startDate.setFullYear(2020, 0, 1); // Start from 2020
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }
  
  return { startDate, endDate };
};

// Get top products sold
const getTopProducts = async (limit = 10) => {
  return await Order.aggregate([
    { $match: { status: "delivered" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        image: { $first: "$items.image" }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        name: 1,
        quantity: 1,
        revenue: 1,
        image: 1,
        category: "$productDetails.category",
        price: "$productDetails.price",
        discountPrice: "$productDetails.discountPrice"
      }
    }
  ]);
};

// Get orders by status
const getOrdersByStatus = async () => {
  return await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$totalPrice", 0] } }
      }
    },
    { $project: { status: "$_id", count: 1, revenue: 1, _id: 0 } },
    { $sort: { count: -1 } }
  ]);
};

// Get revenue over time
const getRevenueOverTime = async (startDate, endDate) => {
  return await Order.aggregate([
    { 
      $match: { 
        status: "delivered", 
        createdAt: { $gte: startDate, $lte: endDate } 
      } 
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: "$totalPrice" }
      }
    },
    { $sort: { _id: 1 } },
    { 
      $project: { 
        date: "$_id", 
        revenue: 1, 
        orders: 1, 
        avgOrderValue: { $round: ["$avgOrderValue", 2] },
        _id: 0 
      } 
    }
  ]);
};

// Get new users over time
const getNewUsersOverTime = async (startDate, endDate) => {
  return await User.aggregate([
    { 
      $match: { 
        role: "user", 
        createdAt: { $gte: startDate, $lte: endDate } 
      } 
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 },
        googleUsers: {
          $sum: { $cond: [{ $eq: ["$authMethod", "google"] }, 1, 0] }
        },
        localUsers: {
          $sum: { $cond: [{ $eq: ["$authMethod", "local"] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } },
    { 
      $project: { 
        date: "$_id", 
        count: 1,
        googleUsers: 1,
        localUsers: 1,
        _id: 0 
      } 
    }
  ]);
};

// Get sales by category
const getSalesByCategory = async () => {
  return await Order.aggregate([
    { $match: { status: "delivered" } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$product.category",
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        quantity: { $sum: "$items.quantity" },
        orders: { $addToSet: "$_id" }
      }
    },
    {
      $project: {
        category: "$_id",
        revenue: 1,
        quantity: 1,
        orderCount: { $size: "$orders" },
        _id: 0
      }
    },
    { $sort: { revenue: -1 } }
  ]);
};

// Get top customers
const getTopCustomers = async (limit = 10) => {
  return await Order.aggregate([
    { $match: { status: "delivered" } },
    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 },
        firstOrder: { $min: "$createdAt" },
        lastOrder: { $max: "$createdAt" }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails"
      }
    },
    { $unwind: "$userDetails" },
    {
      $project: {
        userId: "$_id",
        name: "$userDetails.name",
        email: "$userDetails.email",
        phone: "$userDetails.phone",
        totalSpent: 1,
        orderCount: 1,
        avgOrderValue: { $divide: ["$totalSpent", "$orderCount"] },
        firstOrder: 1,
        lastOrder: 1,
        daysSinceLastOrder: {
          $divide: [
            { $subtract: [new Date(), "$lastOrder"] },
            1000 * 60 * 60 * 24
          ]
        },
        _id: 0
      }
    }
  ]);
};

// Get inventory metrics
const getInventoryMetrics = async () => {
  const totalProducts = await Product.countDocuments();
  const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
  const outOfStockProducts = await Product.countDocuments({ stock: 0 });
  const highStockProducts = await Product.countDocuments({ stock: { $gt: 50 } });
  
  const inventoryValue = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        avgStock: { $avg: "$stock" }
      }
    }
  ]);
  
  const categoryStock = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        totalStock: { $sum: "$stock" },
        productCount: { $sum: 1 },
        avgPrice: { $avg: "$price" }
      }
    },
    { $sort: { totalStock: -1 } }
  ]);
  
  return {
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    highStockProducts,
    inventoryValue: inventoryValue[0] || { totalValue: 0, avgStock: 0 },
    categoryStock
  };
};

// Get conversion funnel metrics
const getConversionMetrics = async () => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const usersWithOrders = await Order.distinct("user");
  const repeatCustomers = await Order.aggregate([
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 }
      }
    },
    { $match: { orderCount: { $gt: 1 } } },
    { $count: "repeatCustomers" }
  ]);
  
  const avgOrderFrequency = await Order.aggregate([
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
        firstOrder: { $min: "$createdAt" },
        lastOrder: { $max: "$createdAt" }
      }
    },
    {
      $project: {
        orderCount: 1,
        daysActive: {
          $divide: [
            { $subtract: ["$lastOrder", "$firstOrder"] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $match: { daysActive: { $gt: 0 } }
    },
    {
      $group: {
        _id: null,
        avgOrdersPerDay: { $avg: { $divide: ["$orderCount", "$daysActive"] } }
      }
    }
  ]);
  
  return {
    totalUsers,
    usersWithOrders: usersWithOrders.length,
    conversionRate: totalUsers > 0 ? (usersWithOrders.length / totalUsers * 100).toFixed(2) : 0,
    repeatCustomers: repeatCustomers[0]?.repeatCustomers || 0,
    avgOrderFrequency: avgOrderFrequency[0]?.avgOrdersPerDay || 0
  };
};

module.exports = {
  getDateRange,
  getTopProducts,
  getOrdersByStatus,
  getRevenueOverTime,
  getNewUsersOverTime,
  getSalesByCategory,
  getTopCustomers,
  getInventoryMetrics,
  getConversionMetrics
};