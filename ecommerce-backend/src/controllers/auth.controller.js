const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../middlewares/error.middleware").asyncHandler;
const { verifyGoogleToken } = require("../utils/googleAuth");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (for user), Admin (for admin)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Only allow creating admin if requester is admin or it's the default admin creation
  let userRole = "user";
  if (role === "admin") {
    if (req.user && req.user.role === "admin") {
      userRole = "admin";
    } else {
      res.status(403);
      throw new Error("Not authorized to create admin account");
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
        isBanned: user.isBanned,
        phone: user.phone,
        address: user.address,
      },
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email (include isBanned field)
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Check if user is banned
  if (user.isBanned) {
    res.status(403);
    throw new Error("Your account has been banned");
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBanned: user.isBanned,
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
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("bannedBy", "name email");

  if (user) {
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authMethod: user.authMethod, // ← ADD THIS LINE
        isBanned: user.isBanned,
        bannedAt: user.bannedAt,
        bannedBy: user.bannedBy
          ? {
              id: user.bannedBy._id,
              name: user.bannedBy.name,
              email: user.bannedBy.email,
            }
          : null,
        banReason: user.banReason,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error("Google ID token is required");
  }

  try {
    // Verify Google token
    const googleUser = await verifyGoogleToken(idToken);

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [
        { googleId: googleUser.googleId },
        { email: googleUser.email.toLowerCase() },
      ],
    });

    // Handle existing user with different auth method
    if (user) {
      // If user exists but with different auth method (local)
      if (user.authMethod === "local" && !user.googleId) {
        // Check if the email is the same
        if (user.email.toLowerCase() === googleUser.email.toLowerCase()) {
          // Merge accounts: Add googleId to existing user
          user.googleId = googleUser.googleId;
          user.avatar = googleUser.picture || user.avatar;
          await user.save();
        } else {
          res.status(409);
          throw new Error(
            "An account with this email already exists. Please use email/password login.",
          );
        }
      }

      // If user is banned
      if (user.isBanned) {
        res.status(403);
        throw new Error("Your account has been banned");
      }
    } else {
      // Create new user without password for Google auth
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.googleId,
        authMethod: "google",
        avatar: googleUser.picture,
        // Don't set password field for Google users
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authMethod: user.authMethod,
        avatar: user.avatar,
        isBanned: user.isBanned,
        phone: user.phone || null,
        address: user.address || null,
      },
      token,
    });
  } catch (error) {
    console.error("Google auth error:", error);

    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      res.status(409);
      throw new Error(
        "An account with this email already exists. Please use email/password login.",
      );
    }

    res.status(401);
    throw new Error(error.message || "Google authentication failed");
  }
});

// @desc    Change user password (only for local auth)
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  // Get user from DB with authMethod (password not needed yet)
  const user = await User.findById(req.user._id).select("+authMethod");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow password change for local authentication
  if (user.authMethod !== "local") {
    res.status(400);
    throw new Error(
      "Password change is not allowed for Google authenticated accounts",
    );
  }

  // Validate new password
  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters long");
  }

  // Update password (pre-save hook will hash it)
  user.password = newPassword;
  await user.save();

  // Optional: generate new token to invalidate old ones
  const newToken = generateToken(user._id, user.role);

  res.json({
    success: true,
    message: "Password changed successfully",
    token: newToken, // send new token if you want to replace the old one
  });
});

// @desc    Send password reset token to email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide an email address");
  }

  // Find user with this email AND local auth method
  const user = await User.findOne({ email, authMethod: "local" });

  // Always send same response to prevent email enumeration
  if (!user) {
    return res.json({
      success: true,
      message:
        "If that email is registered with a local account, a reset link has been sent.",
    });
  }

  // Generate a random token (20 bytes -> 40 hex chars)
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and store in DB (so plain token is never stored)
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration (15 minutes)
  const expires = Date.now() + 15 * 60 * 1000;

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expires;
  await user.save({ validateBeforeSave: false });

  // Create reset URL (frontend will handle the token in URL)
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `Forgot your password? Click the link below to reset it:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 15 minutes)",
      message,
    });

    res.json({
      success: true,
      message: "Reset link sent to email.",
    });
  } catch (error) {
    // If email fails, clear the token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Failed to send email. Please try again later.");
  }
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  // Hash the incoming token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid token and not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token is invalid or has expired");
  }

  // Update password (pre-save hook will hash it)
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Option 1: Force re-login – no new token returned
  res.json({
    success: true,
    message: "Password reset successful. Please log in with your new password.",
  });

  // Option 2 (optional): auto-login – generate and return a JWT
  // const newToken = generateToken(user._id, user.role);
  // res.json({ success: true, message: 'Password reset successful.', token: newToken, user });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  googleAuth,
  changePassword,
  forgotPassword,
  resetPassword,
};
