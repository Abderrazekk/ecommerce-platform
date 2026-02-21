// File: ecommerce-backend/src/controllers/sponsor.controller.js
const asyncHandler = require("express-async-handler");
const Sponsor = require("../models/Sponsor.model");
const cloudinary = require("../config/cloudinary");

// @desc    Get all visible sponsors (public)
// @route   GET /api/sponsors
// @access  Public
const getVisibleSponsors = asyncHandler(async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ isVisible: true })
      .select("-createdBy")
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: sponsors.length,
      sponsors,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch sponsors");
  }
});

// @desc    Get all sponsors (admin)
// @route   GET /api/sponsors/admin
// @access  Private/Admin
const getAllSponsors = asyncHandler(async (req, res) => {
  try {
    const sponsors = await Sponsor.find()
      .populate("createdBy", "name email")
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: sponsors.length,
      sponsors,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch sponsors");
  }
});

// @desc    Create a new sponsor
// @route   POST /api/sponsors
// @access  Private/Admin
const createSponsor = asyncHandler(async (req, res) => {
  try {
    const { name, website, isVisible, order } = req.body;

    // Check if file is uploaded
    if (!req.file) {
      res.status(400);
      throw new Error("Please upload an image");
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "sponsors",
        width: 500,
        height: 250,
        crop: "fill",
        quality: "auto:good",
      },
    );

    const sponsor = await Sponsor.create({
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      name,
      website,
      isVisible: isVisible !== undefined ? isVisible : true,
      order: order || 0,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Sponsor created successfully",
      sponsor,
    });
  } catch (error) {
    // Delete uploaded file if sponsor creation fails
    if (req.file && req.file.buffer) {
      // Note: Cloudinary upload is async, so we can't easily rollback here
    }

    if (error.message === "Please upload an image") {
      res.status(400);
    } else {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Update a sponsor
// @route   PUT /api/sponsors/:id
// @access  Private/Admin
const updateSponsor = asyncHandler(async (req, res) => {
  try {
    const { name, website, isVisible, order } = req.body;
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      res.status(404);
      throw new Error("Sponsor not found");
    }

    let updatedData = {
      name,
      website,
      isVisible: isVisible !== undefined ? isVisible : sponsor.isVisible,
      order: order !== undefined ? order : sponsor.order,
    };

    // If new image is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (sponsor.image && sponsor.image.public_id) {
        try {
          await cloudinary.uploader.destroy(sponsor.image.public_id);
        } catch (cloudinaryError) {
          // Continue with upload even if delete fails
        }
      }

      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "sponsors",
          width: 500,
          height: 250,
          crop: "fill",
          quality: "auto:good",
        },
      );

      updatedData.image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const updatedSponsor = await Sponsor.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true },
    ).populate("createdBy", "name email");

    res.json({
      success: true,
      message: "Sponsor updated successfully",
      sponsor: updatedSponsor,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to update sponsor");
  }
});

// @desc    Delete a sponsor
// @route   DELETE /api/sponsors/:id
// @access  Private/Admin
const deleteSponsor = asyncHandler(async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      res.status(404);
      throw new Error("Sponsor not found");
    }

    // Delete image from Cloudinary
    if (sponsor.image && sponsor.image.public_id) {
      try {
        await cloudinary.uploader.destroy(sponsor.image.public_id);
      } catch (cloudinaryError) {
        // Continue with deletion even if image delete fails
      }
    }

    await sponsor.deleteOne();

    res.json({
      success: true,
      message: "Sponsor deleted successfully",
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to delete sponsor");
  }
});

// @desc    Toggle sponsor visibility
// @route   PATCH /api/sponsors/:id/toggle-visibility
// @access  Private/Admin
const toggleSponsorVisibility = asyncHandler(async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      res.status(404);
      throw new Error("Sponsor not found");
    }

    sponsor.isVisible = !sponsor.isVisible;
    await sponsor.save();

    res.json({
      success: true,
      message: `Sponsor ${sponsor.isVisible ? "made visible" : "hidden"} successfully`,
      sponsor,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to toggle sponsor visibility");
  }
});

module.exports = {
  getVisibleSponsors,
  getAllSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  toggleSponsorVisibility,
};
