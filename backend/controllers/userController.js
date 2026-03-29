const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;

const hashResetToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Helper to generate user response
const generateUserResponse = (user) => {
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  };
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if user exists
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json(generateUserResponse(user));
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  // Check for user email
  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json(generateUserResponse(user));
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// @desc    Request password reset token
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error("Valid email is required");
  }

  const genericResponse = {
    message:
      "If an account exists for this email, password reset instructions have been generated.",
  };

  const user = await User.findOne({ email });

  // Avoid account enumeration by always returning success.
  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = hashResetToken(resetToken);
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
  await user.save({ validateBeforeSave: false });

  const frontendBaseUrl =
    process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
  const sanitizedBase = frontendBaseUrl.replace(/\/+$/, "");
  const resetUrl = `${sanitizedBase}/reset-password/${resetToken}`;

  // In local/dev environments, return reset link for quick testing.
  if (process.env.NODE_ENV !== "production") {
    return res.status(200).json({
      ...genericResponse,
      resetToken,
      resetUrl,
      expiresInMinutes: RESET_TOKEN_EXPIRY_MS / 60000,
    });
  }

  return res.status(200).json(genericResponse);
});

// @desc    Reset password using token
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const rawToken = req.params.token;
  const { password } = req.body;

  const hashedToken = hashResetToken(rawToken);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Reset token is invalid or has expired");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    message: "Password reset successful. You can now sign in with your new password.",
  });
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const nextEmail = req.body.email
      ? String(req.body.email).trim().toLowerCase()
      : user.email;

    // Prevent email collisions if they are changing their email
    if (nextEmail !== user.email) {
      const emailExists = await User.findOne({ email: nextEmail });
      if (emailExists) {
        res.status(400);
        throw new Error("Email is already in use by another account");
      }
    }

    user.name = req.body.name || user.name;
    user.email = nextEmail;
    // updatedAt is automatically handled by Mongoose timestamps

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: generateToken(updatedUser._id), // Optionally re-issue token (good practice on identity changes)
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateUserProfile,
};
