const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  console.log('Multer file filter - Original filename:', file.originalname);
  console.log('Multer file filter - MIME type:', file.mimetype);
  
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log('File accepted by multer');
    return cb(null, true);
  } else {
    console.log('File rejected by multer. Type:', file.mimetype, 'Ext:', path.extname(file.originalname));
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)!'));
  }
};

// Create upload middleware for multiple images (1-6)
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 6 // Maximum 6 files
  },
  fileFilter: fileFilter,
});

// Custom middleware to validate image count
const validateImageCount = (req, res, next) => {
  // For create operation, require at least 1 image
  if (req.method === 'POST') {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }
    
    if (req.files.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 images allowed per product'
      });
    }
  }
  
  // For update operation, images are optional but limited to 6 if provided
  if (req.method === 'PUT' && req.files && req.files.length > 6) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 6 images allowed per product'
    });
  }
  
  next();
};

const validateHeroImageCount = (req, res, next) => {
  // For hero create operation, require at least 2 images
  if (req.method === 'POST' && req.path.includes('/admin/hero')) {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 images are required for hero'
      });
    }
    
    if (req.files.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 images allowed for hero'
      });
    }
  }
  
  // For hero update operation, images are optional but limited to 6 total
  if (req.method === 'PUT' && req.path.includes('/admin/hero')) {
    // We'll handle total image count validation in controller
    // since we need to check existing images
  }
  
  next();
};

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB per image'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 6 images allowed'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field. Field name must be "images"'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  next();
};

module.exports = { 
  upload, 
  validateImageCount,
  validateHeroImageCount, // Add this
  handleMulterError 
};