const User = require('../models/User.model');
const asyncHandler = require('../middlewares/error.middleware').asyncHandler;

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Check if user is banned
  if (user.isBanned) {
    res.status(403);
    throw new Error('Your account has been banned');
  }
  
  // Update fields
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  
  await user.save();
  
  // Get updated user with bannedBy populated
  const updatedUser = await User.findById(user._id)
    .select('-password')
    .populate('bannedBy', 'name email');
  
  res.json({
    success: true,
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isBanned: updatedUser.isBanned,
      bannedAt: updatedUser.bannedAt,
      bannedBy: updatedUser.bannedBy ? {
        id: updatedUser.bannedBy._id,
        name: updatedUser.bannedBy.name,
        email: updatedUser.bannedBy.email
      } : null,
      banReason: updatedUser.banReason,
      phone: updatedUser.phone,
      address: updatedUser.address,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
  });
});

module.exports = { updateUserProfile };