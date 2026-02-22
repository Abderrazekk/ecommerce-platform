const mongoose = require("mongoose");
const Order = require("../models/Order.model");
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
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
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

const uploadVideoToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce/products/videos",
        resource_type: "video",
        chunk_size: 6000000,
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

const deleteImagesFromCloudinary = async (images) => {
  if (!images || images.length === 0) return;

  const deletePromises = images.map((image) => {
    return cloudinary.uploader.destroy(image.public_id);
  });

  await Promise.all(deletePromises);
};

const deleteVideoFromCloudinary = async (videoUrl) => {
  if (!videoUrl) return;

  try {
    const urlParts = videoUrl.split("/");
    const publicIdWithExtension = urlParts.slice(-1)[0];
    const publicId =
      "ecommerce/products/videos/" + publicIdWithExtension.split(".")[0];

    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (error) {
    // Ignore deletion errors, continue
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
  const isAliExpress = req.query.isAliExpress;
  const isOnSale = req.query.isOnSale;

  let filter = { isVisible: true };

  // Handle AliExpress filter
  if (isAliExpress === "true") {
    filter.isAliExpress = true;
  } else if (isAliExpress === "false") {
    filter.isAliExpress = false;
  }

  if (isOnSale === "true") {
    filter.isOnSale = true;
  } else if (isOnSale === "false") {
    filter.isOnSale = false;
  }

  if (category && productCategories.includes(category)) {
    filter.category = category;
  }

  if (brand) {
    filter.brand = new RegExp(brand, "i");
  }

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
  const isAliExpress = req.query.isAliExpress;

  let filter = {};

  if (isAliExpress === "true") {
    filter.isAliExpress = true;
  } else if (isAliExpress === "false") {
    filter.isAliExpress = false;
  }

  if (category && productCategories.includes(category)) {
    filter.category = category;
  }

  if (brand) {
    filter.brand = new RegExp(brand, "i");
  }

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

  if (!req.user?.isAdmin && !product.isVisible) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({
    success: true,
    product,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    brand,
    description,
    price,
    discountPrice,
    shippingFee,
    category,
    stock,
    isFeatured,
    isVisible,
    tags,
    isAliExpress,
    isOnSaleSection,
  } = req.body;

  // ----- Process uploaded files -----
  // Separate files into categories based on fieldname
  const mainImageFiles = [];
  let videoFile = null;
  const colorFilesMap = {}; // key: color index, value: array of files

  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((file) => {
      if (file.fieldname === "images") {
        mainImageFiles.push(file);
      } else if (file.fieldname === "video") {
        // If multiple videos are sent, take the first one
        if (!videoFile) videoFile = file;
      } else {
        const idx = extractColorIndex(file.fieldname);
        if (idx !== null) {
          if (!colorFilesMap[idx]) colorFilesMap[idx] = [];
          colorFilesMap[idx].push(file);
        }
      }
    });
  }

  // ----- Validation -----
  // 1. Main images are required (at least one)
  if (mainImageFiles.length === 0) {
    res.status(400);
    throw new Error("Please upload at least one product image");
  }

  // 2. Max 6 main images
  if (mainImageFiles.length > 6) {
    res.status(400);
    throw new Error("Maximum 6 images allowed per product");
  }

  // 3. Validate category
  if (!productCategories.includes(category)) {
    res.status(400);
    throw new Error("Invalid category");
  }

  // 4. Parse tags if provided
  let parsedTags = [];
  if (tags) {
    parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  // 5. Parse and validate colors
  let colors = [];
  if (req.body.colors) {
    try {
      colors = JSON.parse(req.body.colors); // expected: [{ name, hex }, ...]
    } catch (err) {
      res.status(400);
      throw new Error("Invalid colors format. Must be a valid JSON array.");
    }

    // Validate each color object
    for (const [index, color] of colors.entries()) {
      if (!color.name || typeof color.name !== "string") {
        res.status(400);
        throw new Error(
          `Color at index ${index} must have a valid 'name' string.`,
        );
      }
      if (!color.hex || !/^#([0-9A-F]{3}){1,2}$/i.test(color.hex)) {
        res.status(400);
        throw new Error(
          `Color at index ${index} must have a valid hex code (e.g., #FF0000).`,
        );
      }
    }
  }

  try {
    // ----- Upload main images -----
    const uploadedImages = await uploadImagesToCloudinary(mainImageFiles);

    // ----- Upload video if present -----
    let videoUrl = null;
    if (videoFile) {
      videoUrl = await uploadVideoToCloudinary(videoFile);
    }

    // ----- Upload color images -----
    if (colors.length > 0) {
      for (let i = 0; i < colors.length; i++) {
        const filesForThisColor = colorFilesMap[i] || [];
        if (filesForThisColor.length > 0) {
          const urls = await uploadColorImages(filesForThisColor);
          colors[i].images = urls; // store URLs in the color object
        } else {
          colors[i].images = []; // no images for this color
        }
      }
    }

    // ----- Create product in database -----
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
      shippingFee: shippingFee ? Number(shippingFee) : 0,
      category,
      stock,
      tags: parsedTags,
      images: uploadedImages,
      video: videoUrl,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isVisible: isVisible !== "false",
      isAliExpress: isAliExpress === "true" || isAliExpress === true,
      isOnSaleSection: isOnSaleSection === "true" || isOnSaleSection === true,
      colors: colors,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    // ----- Cleanup on failure -----
    // Attempt to delete any uploaded files (best effort)
    if (uploadedImages && uploadedImages.length > 0) {
      try {
        await deleteImagesFromCloudinary(uploadedImages);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    if (videoUrl) {
      try {
        await deleteVideoFromCloudinary(videoUrl);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    // Clean up color images if any were uploaded
    for (const color of colors) {
      if (color.images && color.images.length > 0) {
        try {
          const deletePromises = color.images.map((url) => {
            const publicId = url.split("/").slice(-1)[0].split(".")[0];
            return cloudinary.uploader.destroy(
              `ecommerce/products/colors/${publicId}`,
            );
          });
          await Promise.all(deletePromises);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
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
    shippingFee,
    category,
    stock,
    isFeatured,
    isVisible,
    tags,
    isAliExpress,
    isOnSaleSection,
  } = req.body;

  // Validate category if provided
  if (category && !productCategories.includes(category)) {
    res.status(400);
    throw new Error("Invalid category");
  }

  // Parse tags if provided
  let parsedTags = product.tags;
  if (tags !== undefined) {
    parsedTags =
      typeof tags === "string"
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : tags;
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

  // Validate shipping fee if provided
  if (shippingFee !== undefined && shippingFee !== "") {
    const shippingNum = parseFloat(shippingFee);
    if (isNaN(shippingNum)) {
      res.status(400);
      throw new Error("Shipping fee must be a valid number");
    }

    if (shippingNum < 0) {
      res.status(400);
      throw new Error("Shipping fee cannot be negative");
    }
  }

  // ----- Process uploaded files -----
  const mainImageFiles = [];
  let videoFile = null;
  const colorFilesMap = {}; // key: color index, value: array of files

  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((file) => {
      if (file.fieldname === "images") {
        mainImageFiles.push(file);
      } else if (file.fieldname === "video") {
        if (!videoFile) videoFile = file; // take first video if multiple
      } else {
        // Check for colorImages[<index>] fieldname
        const match = file.fieldname.match(/^colorImages\[(\d+)\]$/);
        if (match) {
          const idx = parseInt(match[1], 10);
          if (!colorFilesMap[idx]) colorFilesMap[idx] = [];
          colorFilesMap[idx].push(file);
        }
      }
    });
  }

  // Store old files for cleanup
  const oldImages = [...product.images];
  const oldVideoUrl = product.video;
  let newImages = [...product.images];
  let newVideoUrl = product.video;

  // ----- Upload new main images if provided -----
  if (mainImageFiles.length > 0) {
    try {
      const uploadedImages = await uploadImagesToCloudinary(mainImageFiles);

      // APPEND new images to existing images
      newImages = [...oldImages, ...uploadedImages];

      // Validate total images don't exceed 6
      if (newImages.length > 6) {
        // Clean up the newly uploaded images
        await deleteImagesFromCloudinary(uploadedImages);
        throw new Error(
          "Total images cannot exceed 6. You already have " +
            oldImages.length +
            " images.",
        );
      }
    } catch (uploadError) {
      throw new Error("Failed to upload new main images");
    }
  }

  // ----- Upload new video if provided -----
  if (videoFile) {
    try {
      newVideoUrl = await uploadVideoToCloudinary(videoFile);

      if (oldVideoUrl) {
        await deleteVideoFromCloudinary(oldVideoUrl);
      }
    } catch (uploadError) {
      throw new Error("Failed to upload new video");
    }
  } else if (req.body.removeVideo === "true") {
    if (oldVideoUrl) {
      await deleteVideoFromCloudinary(oldVideoUrl);
    }

    newVideoUrl = null;
  } else {
    newVideoUrl = oldVideoUrl;
  }

  // ----- Handle Colors -----
  let updatedColors = product.colors; // default to existing
  if (req.body.colors) {
    try {
      updatedColors = JSON.parse(req.body.colors); // client sends full updated array
    } catch (err) {
      res.status(400);
      throw new Error("Invalid colors format. Must be a valid JSON array.");
    }

    // Validate each color object (basic)
    for (const [index, color] of updatedColors.entries()) {
      if (!color.name || typeof color.name !== "string") {
        res.status(400);
        throw new Error(
          `Color at index ${index} must have a valid 'name' string.`,
        );
      }
      if (!color.hex || !/^#([0-9A-F]{3}){1,2}$/i.test(color.hex)) {
        res.status(400);
        throw new Error(
          `Color at index ${index} must have a valid hex code (e.g., #FF0000).`,
        );
      }
      // Ensure images field exists (may be empty array)
      if (!color.images) color.images = [];
    }

    // Process new images for each color
    for (let i = 0; i < updatedColors.length; i++) {
      const color = updatedColors[i];
      const filesForThisColor = colorFilesMap[i] || [];

      if (filesForThisColor.length > 0) {
        // Upload new images for this color
        const newUrls = await uploadColorImages(filesForThisColor);

        // If the color previously had images, delete the old ones from Cloudinary
        if (color.images && color.images.length > 0) {
          await Promise.all(
            color.images.map(async (url) => {
              try {
                const publicId = url.split("/").slice(-1)[0].split(".")[0];
                await cloudinary.uploader.destroy(
                  `ecommerce/products/colors/${publicId}`,
                );
              } catch (delErr) {
                // Ignore deletion errors
              }
            }),
          );
        }

        // Replace with new URLs
        color.images = newUrls;
      }
      // else keep existing images – they are already in color.images from the client
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
    shippingFee:
      shippingFee !== undefined && shippingFee !== ""
        ? Number(shippingFee)
        : product.shippingFee,
    category: category || product.category,
    stock: stock !== undefined ? Number(stock) : product.stock,
    tags: parsedTags,
    images: newImages,
    video: newVideoUrl,
    colors: updatedColors,
  };

  // Only update boolean fields if provided
  if (isFeatured !== undefined) {
    updateData.isFeatured = isFeatured === "true" || isFeatured === true;
  }

  if (isVisible !== undefined) {
    updateData.isVisible = isVisible !== "false";
  }

  if (isAliExpress !== undefined) {
    updateData.isAliExpress = isAliExpress === "true" || isAliExpress === true;
  }

  if (isOnSaleSection !== undefined) {
    updateData.isOnSaleSection =
      isOnSaleSection === "true" || isOnSaleSection === true;
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
    brands: brands.filter((brand) => brand).sort(),
  });
});

// @desc    Get similar products (3 best‑selling + 3 newest from same category)
// @route   GET /api/products/:id/similar
// @access  Public
const getSimilarProducts = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  // -------------------------------------------------------------
  // 1. Always return 200 – never 404, never 500
  // -------------------------------------------------------------
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.json({ success: true, products: [] });
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    return res.json({ success: true, products: [] });
  }

  // -------------------------------------------------------------
  // 2. Best‑selling product IDs – COMPLETELY SAFE
  // -------------------------------------------------------------
  let bestSellingIds = [];
  try {
    // ✅ This works even if Order collection does NOT exist
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: "orders" }).toArray();
    if (collections.length > 0) {
      const topProducts = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 4 },
        { $match: { _id: { $ne: product._id } } },
      ]);
      bestSellingIds = topProducts.map((p) => p._id);
    }
  } catch (err) {
    // Silently ignore – no orders yet
  }

  // -------------------------------------------------------------
  // 3. Fetch best‑selling products (visible only)
  // -------------------------------------------------------------
  let bestSellingProducts = [];
  if (bestSellingIds.length > 0) {
    bestSellingProducts = await Product.find({
      _id: { $in: bestSellingIds },
      isVisible: true,
    }).lean();
  }

  // -------------------------------------------------------------
  // 4. Newest products from same category (visible only)
  // -------------------------------------------------------------
  const newestFromCategory = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isVisible: true,
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  // -------------------------------------------------------------
  // 5. Merge distinct products (max 6, best‑selling priority)
  // -------------------------------------------------------------
  const seenIds = new Set();
  const similarProducts = [];

  for (const p of bestSellingProducts) {
    if (!seenIds.has(p._id.toString())) {
      seenIds.add(p._id.toString());
      similarProducts.push(p);
      if (similarProducts.length === 6) break;
    }
  }

  if (similarProducts.length < 6) {
    for (const p of newestFromCategory) {
      if (!seenIds.has(p._id.toString())) {
        seenIds.add(p._id.toString());
        similarProducts.push(p);
        if (similarProducts.length === 6) break;
      }
    }
  }

  return res.json({ success: true, products: similarProducts });
});

// Helper: Upload multiple color images to Cloudinary
const uploadColorImages = async (files) => {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map(
    (file) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "ecommerce/products/colors",
            resource_type: "auto",
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
      }),
  );
  return await Promise.all(uploadPromises);
};

const extractColorIndex = (fieldname) => {
  const match = fieldname.match(/^colorImages\[(\d+)\]$/);
  return match ? parseInt(match[1], 10) : null;
};

// @desc    Get on‑sale products (discountPrice > 0, visible, and admin‑selected)
// @route   GET /api/products/onsale
// @access  Public
const getOnSaleProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({
    discountPrice: { $gt: 0 },
    isVisible: true,
    isOnSaleSection: true,
  })
    .select("-__v")
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    products,
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
  getSimilarProducts,
  getOnSaleProducts,
};
