const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Please upload a banner image"],
      trim: true,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one promo is visible at a time (handled in controller)
// Index for faster query of visible promo
promoSchema.index({ isVisible: 1 });

const Promo = mongoose.model("Promo", promoSchema);

module.exports = Promo;