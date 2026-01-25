const User = require('../models/User.model');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../middlewares/error.middleware').asyncHandler;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (for user), Admin (for admin)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Only allow creating admin if requester is admin or it's the default admin creation
  let userRole = 'user';
  if (role === 'admin') {
    if (req.user && req.user.role === 'admin') {
      userRole = 'admin';
    } else {
      res.status(403);
      throw new Error('Not authorized to create admin account');
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    phone,
    address,
  });

  if (user) {
    const token = generateToken(user._id, user.role);
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  
  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id, user.role);
  
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    },
    token,
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { registerUser, loginUser, getUserProfile };