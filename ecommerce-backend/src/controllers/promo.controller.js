const Promo = require("../models/Promo.model");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("express-async-handler");

// Helper to upload image to Cloudinary
const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce/promo",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      },
    );
    stream.end(file.buffer);
  });
};

// Helper to delete image from Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
    await cloudinary.uploader.destroy(`ecommerce/promo/${publicId}`);
  } catch (error) {
    // Error is silently ignored to prevent disrupting the main flow
    // You may want to log this to an external service in production
  }
};

// @desc    Get active promo (visible)
// @route   GET /api/promo
// @access  Public
const getActivePromo = asyncHandler(async (req, res) => {
  const promo = await Promo.findOne({ isVisible: true }).lean();
  res.json({
    success: true,
    promo: promo || null,
  });
});

// @desc    Create new promo
// @route   POST /api/promo
// @access  Private/Admin
const createPromo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image");
  }

  // Upload image to Cloudinary
  const imageUrl = await uploadImageToCloudinary(req.file);

  // Create promo
  const promo = await Promo.create({
    image: imageUrl,
    isVisible: req.body.isVisible === "true" || req.body.isVisible === true,
  });

  // If this promo is visible, make sure all others are hidden
  if (promo.isVisible) {
    await Promo.updateMany({ _id: { $ne: promo._id } }, { isVisible: false });
  }

  res.status(201).json({
    success: true,
    promo,
  });
});

// @desc    Update promo
// @route   PUT /api/promo/:id
// @access  Private/Admin
const updatePromo = asyncHandler(async (req, res) => {
  const promo = await Promo.findById(req.params.id);
  if (!promo) {
    res.status(404);
    throw new Error("Promo not found");
  }

  let imageUrl = promo.image;

  // If new image is uploaded, replace old one
  if (req.file) {
    // Delete old image from Cloudinary
    await deleteImageFromCloudinary(promo.image);
    // Upload new image
    imageUrl = await uploadImageToCloudinary(req.file);
  }

  // Update fields
  promo.image = imageUrl;
  if (req.body.isVisible !== undefined) {
    promo.isVisible =
      req.body.isVisible === "true" || req.body.isVisible === true;
  }

  await promo.save();

  // If this promo is now visible, hide all others
  if (promo.isVisible) {
    await Promo.updateMany({ _id: { $ne: promo._id } }, { isVisible: false });
  }

  res.json({
    success: true,
    promo,
  });
});

// @desc    Delete promo
// @route   DELETE /api/promo/:id
// @access  Private/Admin
const deletePromo = asyncHandler(async (req, res) => {
  const promo = await Promo.findById(req.params.id);
  if (!promo) {
    res.status(404);
    throw new Error("Promo not found");
  }

  // Delete image from Cloudinary
  await deleteImageFromCloudinary(promo.image);

  await promo.deleteOne();

  res.json({
    success: true,
    message: "Promo deleted successfully",
  });
});

module.exports = {
  getActivePromo,
  createPromo,
  updatePromo,
  deletePromo,
};
