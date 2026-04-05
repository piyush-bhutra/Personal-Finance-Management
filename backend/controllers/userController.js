const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Generate JWT (hoisted via function declaration so generateUserResponse can safely call it)
function generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

// Helper to generate user response
const generateUserResponse = (user) => {
    return {
        _id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        occupation: user.occupation,
        investmentExperience: user.investmentExperience,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt,
        token: generateToken(user._id),
    };
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, age, occupation, investmentExperience, dateOfBirth } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
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
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json(generateUserResponse(user));
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
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
        // Prevent email collisions if they are changing their email
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                res.status(400);
                throw new Error('Email is already in use by another account');
            }
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        // updatedAt is automatically handled by Mongoose timestamps

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
