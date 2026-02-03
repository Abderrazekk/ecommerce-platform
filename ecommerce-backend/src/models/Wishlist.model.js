const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ "items.product": 1 });

// Method to check if product is in wishlist
wishlistSchema.methods.isProductInWishlist = function (productId) {
  return this.items.some(
    (item) => item.product && item.product.toString() === productId.toString(),
  );
};

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function (productId) {
  if (!this.isProductInWishlist(productId)) {
    this.items.push({
      product: productId,
      addedAt: new Date(),
    });
    return true;
  }
  return false;
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function (productId) {
  const initialLength = this.items.length;
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString(),
  );
  return this.items.length < initialLength;
};

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;
