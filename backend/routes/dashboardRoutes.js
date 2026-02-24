const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const { getDashboardSummary, getRecentTransactions } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

router.get('/summary', protect, getDashboardSummary);

router.get(
    '/transactions',
    protect,
    [
        query('type')
            .optional()
            .isIn(['all', 'expense', 'investment'])
            .withMessage('type must be one of all, expense, or investment'),
        query('sort')
            .optional()
            .isIn(['date', 'amount'])
            .withMessage('sort must be "date" or "amount"'),
        query('order')
            .optional()
            .isIn(['asc', 'desc'])
            .withMessage('order must be "asc" or "desc"'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 200 })
            .withMessage('limit must be an integer between 1 and 200'),
        query('from')
            .optional()
            .isISO8601()
            .withMessage('from must be a valid date'),
        query('to')
            .optional()
            .isISO8601()
            .withMessage('to must be a valid date'),
        validateRequest,
    ],
    getRecentTransactions
);

module.exports = router;
