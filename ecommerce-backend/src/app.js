const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middlewares/error.middleware");

// Route imports
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const heroRoutes = require("./routes/hero.routes");
const commentRoutes = require("./routes/comment.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const sponsorRoutes = require("./routes/sponsor.routes");
const promoRoutes = require("./routes/promo.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api", commentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/sponsors", sponsorRoutes);
app.use("/api/promo", promoRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Error handler (must be last middleware)
app.use(errorHandler);

module.exports = app;
