const multer = require("multer");
const path = require("path");

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  // Allowed video types
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm|flv|wmv/;

  const isImage = allowedImageTypes.test(file.mimetype);
  const isVideo = allowedVideoTypes.test(file.mimetype);

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"));
  }
};

// Create upload middleware for multiple files
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file (increased for videos)
  },
  fileFilter: fileFilter,
});

// Custom middleware to validate file count and types (for products)
const validateFiles = (req, res, next) => {
  const files = req.files;

  // For create operation
  if (req.method === "POST") {
    // Check for at least one image
    if (!files?.images || files.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Validate image count (1-6 images)
    if (files.images.length > 6) {
      return res.status(400).json({
        success: false,
        message: "Maximum 6 images allowed per product",
      });
    }

    // Validate video (optional, max 1)
    if (files.video && files.video.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Maximum 1 video allowed per product",
      });
    }
  }

  // For update operation
  if (req.method === "PUT") {
    // Validate image count if provided
    if (files.images && files.images.length > 6) {
      return res.status(400).json({
        success: false,
        message: "Maximum 6 images allowed per product",
      });
    }

    // Validate video count if provided
    if (files.video && files.video.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Maximum 1 video allowed per product",
      });
    }
  }

  next();
};

// Keep the old validateImageCount for backward compatibility (used by hero routes)
const validateImageCount = (req, res, next) => {
  // For create operation, require at least 1 image
  if (req.method === "POST") {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    if (req.files.length > 6) {
      return res.status(400).json({
        success: false,
        message: "Maximum 6 images allowed per product",
      });
    }
  }

  // For update operation, images are optional but limited to 6 if provided
  if (req.method === "PUT" && req.files && req.files.length > 6) {
    return res.status(400).json({
      success: false,
      message: "Maximum 6 images allowed per product",
    });
  }

  next();
};

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB per file",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field. Field names must be "images" or "video"',
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }
  next();
};

module.exports = {
  upload,
  validateFiles,
  validateImageCount,
  handleMulterError,
};
