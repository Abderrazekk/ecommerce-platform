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
); // Don't create _id for subdocuments

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
      // REMOVE the validate object entirely
    },
    images: {
      type: [imageSchema],
      required: [true, "Please upload at least one product image"],
      validate: {
        validator: function (images) {
          // Must have between 1 and 6 images
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
          // Allow null or Cloudinary URL format
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
          // Each tag should be a non-empty string
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
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
  // This would need population or separate query
  return 0;
});

const Product = mongoose.model("Product", productSchema);

// Export both as named exports
module.exports.Product = Product;
module.exports.productCategories = productCategories;
module.exports.imageSchema = imageSchema;
