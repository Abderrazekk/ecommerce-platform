const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  googleAuth  // Add this
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { updateUserProfile } = require('../controllers/profile.controller');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);  // Add Google auth route

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;