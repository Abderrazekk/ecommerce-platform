const asyncHandler = require("express-async-handler");
const Hero = require("../models/Hero.model");
const cloudinary = require("../config/cloudinary");

// @desc    Get active hero
// @route   GET /api/hero
// @access  Public
const getActiveHero = asyncHandler(async (req, res) => {
  const hero = await Hero.getActiveHero();

  if (!hero) {
    return res.status(200).json({
      success: true,
      data: null,
      message: "No active hero found",
    });
  }

  res.json({
    success: true,
    data: hero,
  });
});

// @desc    Get all heroes (for admin)
// @route   GET /api/admin/hero
// @access  Private/Admin
const getAllHeroes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [heroes, total] = await Promise.all([
    Hero.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")
      .select("-__v"),
    Hero.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: heroes,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

// @desc    Create new hero
// @route   POST /api/admin/hero
// @access  Private/Admin
const createHero = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    season,
    isActive = false,
    layoutStyle = "auto",
    transitionEffect = "fade",
    transitionSpeed = 1000,
    autoRotate = true,
    rotationInterval = 5000,
    overlayTexts = [],
    overlayPositions = [],
    overlayColors = [],
    textSizes = [],
  } = req.body;

  // Validate required fields
  if (!title || !season) {
    res.status(400);
    throw new Error("Title and season are required");
  }

  if (!req.files || req.files.length < 1) {
    res.status(400);
    throw new Error("At least 1 image is required");
  }

  if (req.files.length > 6) {
    res.status(400);
    throw new Error("Maximum 6 images allowed");
  }

  // Upload images to Cloudinary with overlay data
  const uploadPromises = req.files.map((file, index) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "hero-images",
          transformation: [
            { width: 1920, height: 1080, crop: "fill" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else
            resolve({
              public_id: result.public_id,
              url: result.secure_url,
              overlayText: overlayTexts[index] || "",
              overlayPosition: overlayPositions[index] || "bottom-left",
              overlayColor: overlayColors[index] || "#FFFFFF",
              textSize: textSizes[index] || "medium",
            });
        },
      );

      // Attach error handler to the stream itself
      uploadStream.on("error", (err) => reject(err));
      uploadStream.end(file.buffer);
    });
  });

  const images = await Promise.all(uploadPromises);

  // Create hero
  const hero = await Hero.create({
    title,
    subtitle,
    season,
    images,
    layoutStyle,
    transitionEffect,
    transitionSpeed: parseInt(transitionSpeed),
    autoRotate,
    rotationInterval: parseInt(rotationInterval),
    isActive,
    createdBy: req.user._id,
  });

  // Populate createdBy
  const populatedHero = await Hero.findById(hero._id)
    .populate("createdBy", "name email")
    .select("-__v");

  res.status(201).json({
    success: true,
    data: populatedHero,
    message: "Hero created successfully",
  });
});

// @desc    Update hero
// @route   PUT /api/admin/hero/:id
// @access  Private/Admin
const updateHero = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    season,
    isActive,
    layoutStyle,
    transitionEffect,
    transitionSpeed,
    autoRotate,
    rotationInterval,
    overlayTexts,
    overlayPositions,
    overlayColors,
    textSizes,
    imagesToDelete,
  } = req.body;

  const hero = await Hero.findById(req.params.id);
  if (!hero) {
    res.status(404);
    throw new Error("Hero not found");
  }

  // Parse imagesToDelete if it's a string (from FormData)
  let imagesToDeleteArray = [];
  if (imagesToDelete) {
    try {
      if (typeof imagesToDelete === "string") {
        imagesToDeleteArray = JSON.parse(imagesToDelete);
      } else if (Array.isArray(imagesToDelete)) {
        imagesToDeleteArray = imagesToDelete;
      }
    } catch (error) {
      // Silently ignore parsing errors – no images will be deleted
    }
  }

  // Handle image deletion if specified
  if (imagesToDeleteArray.length > 0) {
    // Delete from Cloudinary
    const deletePromises = imagesToDeleteArray.map((publicId) => {
      if (publicId && typeof publicId === "string") {
        return cloudinary.uploader.destroy(publicId).catch(() => null);
      }
      return Promise.resolve(null);
    });

    await Promise.all(deletePromises);

    // Remove from hero images
    hero.images = hero.images.filter(
      (img) => !imagesToDeleteArray.includes(img.public_id),
    );
  }

  // Update basic fields if provided
  if (title !== undefined) hero.title = title;
  if (subtitle !== undefined) hero.subtitle = subtitle;
  if (season !== undefined) hero.season = season;
  if (isActive !== undefined) hero.isActive = isActive;
  if (layoutStyle !== undefined) hero.layoutStyle = layoutStyle;
  if (transitionEffect !== undefined) hero.transitionEffect = transitionEffect;
  if (transitionSpeed !== undefined)
    hero.transitionSpeed = parseInt(transitionSpeed);
  if (autoRotate !== undefined) hero.autoRotate = autoRotate;
  if (rotationInterval !== undefined)
    hero.rotationInterval = parseInt(rotationInterval);

  // Handle image overlay updates for existing images
  if (overlayTexts && Array.isArray(overlayTexts)) {
    hero.images.forEach((img, index) => {
      // Only update existing images (not new ones)
      if (img.public_id && overlayTexts[index] !== undefined) {
        img.overlayText = overlayTexts[index];
      }
      if (
        img.public_id &&
        overlayPositions &&
        overlayPositions[index] !== undefined
      ) {
        img.overlayPosition = overlayPositions[index];
      }
      if (
        img.public_id &&
        overlayColors &&
        overlayColors[index] !== undefined
      ) {
        img.overlayColor = overlayColors[index];
      }
      if (img.public_id && textSizes && textSizes[index] !== undefined) {
        img.textSize = textSizes[index];
      }
    });
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const totalImages = hero.images.length + req.files.length;
    if (totalImages > 6) {
      res.status(400);
      throw new Error("Maximum 6 images allowed");
    }

    const uploadPromises = req.files.map((file, index) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "hero-images",
            transformation: [
              { width: 1920, height: 1080, crop: "fill" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              reject(
                error instanceof Error
                  ? error
                  : new Error(error || "Cloudinary upload callback error"),
              );
            } else {
              const overlayIndex = hero.images.length + index;
              resolve({
                public_id: result.public_id,
                url: result.secure_url,
                overlayText: (overlayTexts && overlayTexts[overlayIndex]) || "",
                overlayPosition:
                  (overlayPositions && overlayPositions[overlayIndex]) ||
                  "bottom-left",
                overlayColor:
                  (overlayColors && overlayColors[overlayIndex]) || "#FFFFFF",
                textSize: (textSizes && textSizes[overlayIndex]) || "medium",
              });
            }
          },
        );

        uploadStream.on("error", (err) => {
          reject(
            err instanceof Error
              ? err
              : new Error(err || "Cloudinary upload stream error"),
          );
        });

        uploadStream.end(file.buffer);
      });
    });

    const newImages = await Promise.all(uploadPromises);
    hero.images.push(...newImages);
  }

  // Ensure at least 2 images remain
  if (hero.images.length < 2) {
    res.status(400);
    throw new Error("Hero must have at least 2 images");
  }

  const updatedHero = await hero.save();
  await updatedHero.populate("createdBy", "name email");

  res.json({
    success: true,
    data: updatedHero,
    message: "Hero updated successfully",
  });
});

// @desc    Delete hero
// @route   DELETE /api/admin/hero/:id
// @access  Private/Admin
const deleteHero = asyncHandler(async (req, res) => {
  const hero = await Hero.findById(req.params.id);
  if (!hero) {
    res.status(404);
    throw new Error("Hero not found");
  }

  // Delete images from Cloudinary
  const deletePromises = hero.images.map((img) => {
    return cloudinary.uploader.destroy(img.public_id);
  });
  await Promise.all(deletePromises);

  await hero.deleteOne();

  res.json({
    success: true,
    message: "Hero deleted successfully",
  });
});

// @desc    Get hero by ID
// @route   GET /api/admin/hero/:id
// @access  Private/Admin
const getHeroById = asyncHandler(async (req, res) => {
  const hero = await Hero.findById(req.params.id)
    .populate("createdBy", "name email")
    .select("-__v");

  if (!hero) {
    res.status(404);
    throw new Error("Hero not found");
  }

  res.json({
    success: true,
    data: hero,
  });
});

module.exports = {
  getActiveHero,
  getAllHeroes,
  getHeroById,
  createHero,
  updateHero,
  deleteHero,
};
