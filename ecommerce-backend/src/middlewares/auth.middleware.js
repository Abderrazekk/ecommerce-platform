const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (include isBanned field)
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("User not found");
      }

      // Check if user is banned
      if (user.isBanned) {
        res.status(403);
        throw new Error("Your account has been banned");
      }

      // Add isAdmin property for easier checks
      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === "admin",
        isBanned: user.isBanned,
        phone: user.phone,
        address: user.address,
      };

      next();
    } catch (error) {
      console.error(error);
      
      // Return specific error for banned users
      if (error.message === "Your account has been banned") {
        res.status(403).json({
          success: false,
          error: "Your account has been banned",
          code: "ACCOUNT_BANNED"
        });
        return;
      }
      
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Global banned user check middleware
const checkBanned = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isBanned) {
    res.status(403);
    throw new Error("Your account has been banned");
  }
  next();
});

module.exports = { protect, checkBanned };