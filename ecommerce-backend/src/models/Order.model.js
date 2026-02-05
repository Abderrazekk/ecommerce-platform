const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: String,
        // NEW: Store the product's shipping fee for record
        shippingFee: {
          type: Number,
          default: 0,
        },
      },
    ],
    // Products total before shipping
    productsTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    // NEW: Shipping fee for the order
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    // Total price including shipping
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      type: String,
      required: [true, "Please provide delivery address"],
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    // NEW: Free shipping flag
    freeShipping: {
      type: Boolean,
      default: false,
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

// Index for user orders and status
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
