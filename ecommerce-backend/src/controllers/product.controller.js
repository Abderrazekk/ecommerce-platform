const { Product, productCategories } = require("../models/Product.model");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("express-async-handler");

// Helper function to upload images to Cloudinary
const uploadImagesToCloudinary = async (files) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ecommerce/products",
          resource_type: "auto", // Auto-detect image
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve({
              public_id: result.public_id,
              url: result.secure_url,
            });
          }
        },
      );
      stream.end(file.buffer);
    });
  });

  return await Promise.all(uploadPromises);
};

// NEW: Helper function to upload video to Cloudinary
const uploadVideoToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce/products/videos",
        resource_type: "video", // Explicitly set to video
        chunk_size: 6000000, // 6MB chunks for large videos
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary video upload error:", error);
          reject(error);
        } else {
          console.log("Video uploaded successfully:", result.public_id);
          resolve(result.secure_url);
        }
      },
    );
    stream.end(file.buffer);
  });
};

// Helper function to delete images from Cloudinary
const deleteImagesFromCloudinary = async (images) => {
  if (!images || images.length === 0) return;

  const deletePromises = images.map((image) => {
    return cloudinary.uploader.destroy(image.public_id);
  });

  await Promise.all(deletePromises);
};

// NEW: Helper function to delete video from Cloudinary
const deleteVideoFromCloudinary = async (videoUrl) => {
  if (!videoUrl) return;

  try {
    // Extract public_id from Cloudinary URL
    const urlParts = videoUrl.split("/");
    const publicIdWithExtension = urlParts.slice(-1)[0];
    const publicId =
      "ecommerce/products/videos/" + publicIdWithExtension.split(".")[0];

    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    console.log("Video deleted from Cloudinary:", publicId);
  } catch (error) {
    console.error("Error deleting video from Cloudinary:", error);
  }
};

// @desc    Get all products (visible only)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const category = req.query.category;
  const search = req.query.search;
  const brand = req.query.brand;

  let filter = { isVisible: true }; // Only visible products for public

  // Filter by category
  if (category && productCategories.includes(category)) {
    filter.category = category;
  }

  // Filter by brand
  if (brand) {
    filter.brand = new RegExp(brand, "i");
  }

  // Search in name, description, and brand
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  const products = await Product.find(filter)
    .select("-__v")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

// @desc    Get all products for admin (visible and hidden)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAdminProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  const category = req.query.category;
  const search = req.query.search;
  const brand = req.query.brand;

  let filter = {}; // No visibility filter for admin

  // Filter by category
  if (category && productCategories.includes(category)) {
    filter.category = category;
  }

  // Filter by brand
  if (brand) {
    filter.brand = new RegExp(brand, "i");
  }

  // Search in name, description, and brand
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  const products = await Product.find(filter)
    .select("-__v")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

// @desc    Get featured products (featured AND visible)
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({
    isFeatured: true,
    isVisible: true,
  })
    .select("-__v")
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select("-__v");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if product is visible for non-admin users
  if (!req.user?.isAdmin && !product.isVisible) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({
    success: true,
    product,
  });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  console.log("=== CREATE PRODUCT REQUEST ===");
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);

  const {
    name,
    brand,
    description,
    price,
    discountPrice,
    category,
    stock,
    isFeatured,
    isVisible,
    tags,
  } = req.body;

  // Check for required images
  if (!req.files?.images || req.files.images.length === 0) {
    console.log("No images in request");
    res.status(400);
    throw new Error("Please upload at least one product image");
  }

  // Validate category
  if (!productCategories.includes(category)) {
    res.status(400);
    throw new Error("Invalid category");
  }

  // Parse tags if provided
  let parsedTags = [];
  if (tags) {
    parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  try {
    // Upload images to Cloudinary
    console.log(`Uploading ${req.files.images.length} images to Cloudinary...`);
    const uploadedImages = await uploadImagesToCloudinary(req.files.images);
    console.log("Images uploaded successfully:", uploadedImages.length);

    // Upload video to Cloudinary if provided
    let videoUrl = null;
    if (req.files.video && req.files.video.length > 0) {
      console.log("Uploading video to Cloudinary...");
      videoUrl = await uploadVideoToCloudinary(req.files.video[0]);
      console.log("Video uploaded successfully:", videoUrl);
    }

    const product = await Product.create({
      name,
      brand,
      description,
      price,
      discountPrice:
        discountPrice !== undefined
          ? discountPrice === "" || discountPrice === null
            ? null
            : Number(discountPrice)
          : null,
      category,
      stock,
      tags: parsedTags,
      images: uploadedImages,
      video: videoUrl, // NEW: Add video URL
      isFeatured: isFeatured === "true" || isFeatured === true,
      isVisible: isVisible !== "false",
    });

    console.log("Product created successfully:", product._id);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);

    // Clean up uploaded files if product creation fails
    if (req.files?.images && req.files.images.length > 0) {
      try {
        // Extract public_ids from uploaded images
        const uploadedImages = await uploadImagesToCloudinary(req.files.images);
        await deleteImagesFromCloudinary(uploadedImages);
      } catch (cleanupError) {
        console.error("Error cleaning up images:", cleanupError);
      }
    }

    // Clean up uploaded video if exists
    if (req.files?.video && req.files.video.length > 0) {
      try {
        const videoUrl = await uploadVideoToCloudinary(req.files.video[0]);
        await deleteVideoFromCloudinary(videoUrl);
      } catch (cleanupError) {
        console.error("Error cleaning up video:", cleanupError);
      }
    }

    res.status(500);
    throw new Error("Failed to create product");
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const {
    name,
    brand,
    description,
    price,
    discountPrice,
    category,
    stock,
    isFeatured,
    isVisible,
    tags,
  } = req.body;

  // Validate category if provided
  if (category && !productCategories.includes(category)) {
    res.status(400);
    throw new Error("Invalid category");
  }

  // Parse tags if provided
  let parsedTags = product.tags;
  if (tags !== undefined) {
    parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  // Validate discount price if provided
  if (discountPrice !== undefined && discountPrice !== "") {
    const priceNum = price ? parseFloat(price) : product.price;
    const discountNum = parseFloat(discountPrice);

    if (isNaN(discountNum)) {
      res.status(400);
      throw new Error("Discount price must be a valid number");
    }

    if (discountNum < 0) {
      res.status(400);
      throw new Error("Discount price cannot be negative");
    }

    if (discountNum >= priceNum) {
      res.status(400);
      throw new Error("Discount price must be less than original price");
    }
  }

  // Store old files for cleanup
  const oldImages = [...product.images];
  const oldVideoUrl = product.video;
  let newImages = [...product.images];
  let newVideoUrl = product.video;

  // Upload new images if provided
  if (req.files?.images && req.files.images.length > 0) {
    try {
      console.log(
        `Uploading ${req.files.images.length} new images to Cloudinary...`,
      );
      const uploadedImages = await uploadImagesToCloudinary(req.files.images);
      newImages = uploadedImages; // Replace all images

      // Delete old images from Cloudinary
      if (oldImages.length > 0) {
        console.log(
          `Deleting ${oldImages.length} old images from Cloudinary...`,
        );
        await deleteImagesFromCloudinary(oldImages);
      }
    } catch (uploadError) {
      console.error("Error uploading new images:", uploadError);
      throw new Error("Failed to upload new images");
    }
  }

  // Upload new video if provided
  if (req.files?.video && req.files.video.length > 0) {
    try {
      console.log("Uploading new video to Cloudinary...");
      newVideoUrl = await uploadVideoToCloudinary(req.files.video[0]);

      // Delete old video from Cloudinary if it exists
      if (oldVideoUrl) {
        console.log("Deleting old video from Cloudinary...");
        await deleteVideoFromCloudinary(oldVideoUrl);
      }
    } catch (uploadError) {
      console.error("Error uploading new video:", uploadError);
      throw new Error("Failed to upload new video");
    }
  }

  // Build update object
  const updateData = {
    name: name || product.name,
    brand: brand || product.brand,
    description: description || product.description,
    price: price ? Number(price) : product.price,
    discountPrice:
      discountPrice !== undefined
        ? discountPrice === "" || discountPrice === null
          ? null
          : Number(discountPrice)
        : product.discountPrice,
    category: category || product.category,
    stock: stock !== undefined ? Number(stock) : product.stock,
    tags: parsedTags,
    images: newImages,
    video: newVideoUrl, // NEW: Add video URL
  };

  // Only update boolean fields if provided
  if (isFeatured !== undefined) {
    updateData.isFeatured = isFeatured === "true" || isFeatured === true;
  }

  if (isVisible !== undefined) {
    updateData.isVisible = isVisible !== "false";
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true },
  ).select("-__v");

  res.json({
    success: true,
    product: updatedProduct,
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Delete all images from Cloudinary
  if (product.images && product.images.length > 0) {
    await deleteImagesFromCloudinary(product.images);
  }

  // Delete video from Cloudinary if exists
  if (product.video) {
    await deleteVideoFromCloudinary(product.video);
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
});
// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    categories: productCategories,
  });
});

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct("brand", { isVisible: true });

  res.json({
    success: true,
    brands: brands.filter((brand) => brand).sort(), // Remove null/undefined and sort
  });
});

module.exports = {
  getProducts,
  getAdminProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
};
