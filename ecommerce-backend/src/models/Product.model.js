// ecommerce-backend/src/models/Product.model.js
const mongoose = require("mongoose");

const productCategories = [
  "Electronics & Gadgets",
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Home & Kitchen",
  "Fitness & Outdoors",
  "Baby & Kids",
  "Pets",
  "Automotive & Tools",
  "Lifestyle & Hobbies",
];

const imageSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    brand: {
      type: String,
      required: [true, "Please provide a brand name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: [0, "Shipping fee cannot be negative"],
    },
    images: {
      type: [imageSchema],
      required: [true, "Please upload at least one product image"],
      validate: {
        validator: function (images) {
          return images.length >= 1 && images.length <= 6;
        },
        message: "Product must have between 1 and 6 images",
      },
    },
    video: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return (
            value.startsWith("http") &&
            (value.includes("cloudinary") ||
              value.includes("res.cloudinary.com"))
          );
        },
        message: "Video must be a valid Cloudinary URL",
      },
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: productCategories,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.every(
            (tag) => typeof tag === "string" && tag.trim().length > 0,
          );
        },
        message: "Tags must be non-empty strings",
      },
    },
    stock: {
      type: Number,
      required: [true, "Please provide stock quantity"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isAliExpress: {
      type: Boolean,
      default: false,
    },
    // NEW: Review statistics
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Average rating cannot be negative"],
      max: [5, "Average rating cannot exceed 5"],
      set: (value) => parseFloat(value.toFixed(1)), // Store with 1 decimal place
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: [0, "Ratings count cannot be negative"],
    },
    // NEW: Rating distribution for analytics
    ratingDistribution: {
      type: mongoose.Schema.Types.Mixed,
      default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.discountPrice && this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Index for better search performance
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1, isVisible: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ averageRating: -1 }); // NEW: For sorting by rating

// Middleware to handle image validation on update
productSchema.pre("save", function (next) {
  // Ensure at least one image exists
  if (this.images && this.images.length === 0) {
    next(new Error("Product must have at least one image"));
    return;
  }

  // Ensure discount price is valid
  if (this.discountPrice && this.discountPrice >= this.price) {
    next(new Error("Discount price must be less than original price"));
    return;
  }

  next();
});

productSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "product",
});

// Add this to the Product model to get comment count
productSchema.virtual("commentCount").get(function () {
  return 0;
});

const Product = mongoose.model("Product", productSchema);

module.exports.Product = Product;
module.exports.productCategories = productCategories;
module.exports.imageSchema = imageSchema;