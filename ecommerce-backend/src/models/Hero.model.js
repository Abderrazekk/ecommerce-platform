const mongoose = require("mongoose");

const heroImageSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  overlayText: {
    type: String,
    trim: true,
    maxlength: [200, "Overlay text cannot exceed 200 characters"],
    default: "",
  },
  overlayPosition: {
    type: String,
    enum: [
      "top-left",
      "top-center",
      "top-right",
      "center-left",
      "center",
      "center-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ],
    default: "bottom-left",
  },
  overlayColor: {
    type: String,
    default: "#FFFFFF", // White
  },
  textSize: {
    type: String,
    enum: ["small", "medium", "large"],
    default: "medium",
  },
});

const heroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, "Subtitle cannot exceed 200 characters"],
      default: "",
    },
    images: {
      type: [heroImageSchema],
      validate: {
        validator: function (images) {
          return images.length >= 2 && images.length <= 6;
        },
        message: "Hero must have between 2 and 6 images",
      },
      required: [true, "At least 2 images are required"],
    },
    season: {
      type: String,
      required: [true, "Season is required"],
      enum: {
        values: ["spring", "summer", "autumn", "winter", "special"],
        message:
          "Season must be one of: spring, summer, autumn, winter, special",
      },
    },
    // New layout control fields
    layoutStyle: {
      type: String,
      enum: {
        values: [
          "auto",
          "2-modern",
          "3-stacked",
          "4-grid",
          "5-dynamic",
          "6-stylish",
          "slideshow",
        ],
        message: "Invalid layout style",
      },
      default: "auto",
    },
    // Transition settings
    transitionEffect: {
      type: String,
      enum: ["fade", "slide", "zoom", "flip", "cube"],
      default: "fade",
    },
    transitionSpeed: {
      type: Number,
      min: 500,
      max: 3000,
      default: 1000,
    },
    autoRotate: {
      type: Boolean,
      default: true,
    },
    rotationInterval: {
      type: Number,
      min: 2000,
      max: 10000,
      default: 5000,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual field to get effective layout based on image count
heroSchema.virtual("effectiveLayout").get(function () {
  if (this.layoutStyle !== "auto") {
    return this.layoutStyle;
  }

  const imageCount = this.images.length;
  const layouts = {
    2: "2-modern",
    3: "3-stacked",
    4: "4-grid",
    5: "5-dynamic",
    6: "6-stylish",
  };

  return layouts[imageCount] || "2-modern";
});

// Index for faster queries
heroSchema.index({ isActive: 1, season: 1 });
heroSchema.index({ createdAt: -1 });

// Middleware to ensure only one active hero exists
heroSchema.pre("save", async function (next) {
  if (this.isActive && this.isModified("isActive")) {
    try {
      // Deactivate all other heroes
      await this.constructor.updateMany(
        { _id: { $ne: this._id }, isActive: true },
        { $set: { isActive: false } },
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static method to get active hero
heroSchema.statics.getActiveHero = async function () {
  return this.findOne({ isActive: true })
    .select("-__v")
    .populate("createdBy", "name email");
};

const Hero = mongoose.model("Hero", heroSchema);

module.exports = Hero;
