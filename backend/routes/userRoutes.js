const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    registerUser,
    loginUser,
    getMe,
    updateUserProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isString()
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
        validateRequest,
    ],
    registerUser
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isString()
            .notEmpty()
            .withMessage('Password is required'),
        validateRequest,
    ],
    loginUser
);

router.get('/me', protect, getMe);
router.put(
    '/profile',
    protect,
    [
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().withMessage('Email must be valid'),
        validateRequest,
    ],
    updateUserProfile
);

module.exports = router;
