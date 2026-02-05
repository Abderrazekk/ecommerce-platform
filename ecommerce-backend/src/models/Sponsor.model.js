// File: ecommerce-backend/src/models/Sponsor.model.js
const mongoose = require("mongoose");

const sponsorSchema = new mongoose.Schema(
  {
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    website: {
      type: String,
      trim: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
sponsorSchema.index({ isVisible: 1, order: 1 });

const Sponsor = mongoose.model("Sponsor", sponsorSchema);

module.exports = Sponsor;
