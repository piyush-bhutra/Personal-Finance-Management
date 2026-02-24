const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    stopExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

const idParamValidation = [
    body('id').optional(),
];

router
    .route('/')
    .get(protect, getExpenses)
    .post(
        protect,
        [
            body('expenseMode')
                .isIn(['recurring', 'one-time'])
                .withMessage('expenseMode must be "recurring" or "one-time"'),
            body('category').trim().notEmpty().withMessage('category is required'),
            body('monthlyAmount')
                .if(body('expenseMode').equals('recurring'))
                .isFloat({ gt: 0 })
                .withMessage('monthlyAmount must be a positive number for recurring expenses'),
            body('startDate')
                .if(body('expenseMode').equals('recurring'))
                .isISO8601()
                .withMessage('startDate must be a valid date for recurring expenses'),
            body('amount')
                .if(body('expenseMode').equals('one-time'))
                .isFloat({ gt: 0 })
                .withMessage('amount must be a positive number for one-time expenses'),
            body('date')
                .if(body('expenseMode').equals('one-time'))
                .isISO8601()
                .withMessage('date must be a valid date for one-time expenses'),
            validateRequest,
        ],
        createExpense
    );

router
    .route('/:id')
    .put(
        protect,
        [
            body('fromDate')
                .optional()
                .isISO8601()
                .withMessage('fromDate must be a valid date'),
            body('monthlyAmount')
                .optional()
                .isFloat({ gt: 0 })
                .withMessage('monthlyAmount must be a positive number'),
            body('amount')
                .optional()
                .isFloat({ gt: 0 })
                .withMessage('amount must be a positive number'),
            body('date')
                .optional()
                .isISO8601()
                .withMessage('date must be a valid date'),
            validateRequest,
        ],
        updateExpense
    )
    .delete(
        protect,
        [
            body('fromDate')
                .optional()
                .isISO8601()
                .withMessage('fromDate must be a valid date'),
            validateRequest,
        ],
        deleteExpense
    );

router
    .route('/:id/stop')
    .put(
        protect,
        [
            body('stopDate')
                .isISO8601()
                .withMessage('stopDate must be a valid date'),
            validateRequest,
        ],
        stopExpense
    );

module.exports = router;
