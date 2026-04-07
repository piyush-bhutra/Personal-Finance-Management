const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");


function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
}

const generateUserResponse = (user) => {
  const id = user?._id || user?.id;
  return {
    _id: id?.toString ? id.toString() : id,
    name: user.name,
    email: user.email,
    age: user.age,
    occupation: user.occupation,
    investmentExperience: user.investmentExperience,
    dateOfBirth: user.dateOfBirth,
    createdAt: user.createdAt,
    token: generateToken(id),
  };
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, age, occupation, investmentExperience, dateOfBirth } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    age: typeof age === 'number' ? age : age ? Number(age) : undefined,
    occupation,
    investmentExperience,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
  });

  if (user) {
    res.status(201).json(generateUserResponse(user));
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).lean();

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json(generateUserResponse(user));
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});


const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const nextEmail = req.body.email
      ? String(req.body.email).trim().toLowerCase()
      : user.email;

    user.name = req.body.name || user.name;
    user.email = nextEmail;
    const updatedUser = await user.save();

    res.json(generateUserResponse(updatedUser));
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateUserProfile,
};
