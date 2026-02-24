const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getInvestments,
    getInvestmentSummary,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    stopInvestment,
} = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

// Summary must come BEFORE /:id to avoid being caught as an id lookup
router.route('/summary').get(protect, getInvestmentSummary);

router
    .route('/')
    .get(protect, getInvestments)
    .post(
        protect,
        [
            body('investmentMode')
                .isIn(['recurring', 'one-time'])
                .withMessage('investmentMode must be "recurring" or "one-time"'),
            body('assetName').trim().notEmpty().withMessage('assetName is required'),
            body('type').trim().notEmpty().withMessage('type is required'),
            body('expectedReturnRate')
                .optional()
                .isFloat({ min: 0 })
                .withMessage('expectedReturnRate must be a non-negative number'),
            body('monthlyAmount')
                .if(body('investmentMode').equals('recurring'))
                .isFloat({ gt: 0 })
                .withMessage('monthlyAmount must be a positive number for recurring investments'),
            body('startDate')
                .if(body('investmentMode').equals('recurring'))
                .isISO8601()
                .withMessage('startDate must be a valid date for recurring investments'),
            body('amount')
                .if(body('investmentMode').equals('one-time'))
                .isFloat({ gt: 0 })
                .withMessage('amount must be a positive number for one-time investments'),
            body('date')
                .if(body('investmentMode').equals('one-time'))
                .isISO8601()
                .withMessage('date must be a valid date for one-time investments'),
            validateRequest,
        ],
        createInvestment
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
            body('expectedReturnRate')
                .optional()
                .isFloat({ min: 0 })
                .withMessage('expectedReturnRate must be a non-negative number'),
            validateRequest,
        ],
        updateInvestment
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
        deleteInvestment
    );

router
    .route('/:id/stop')
    .put(
        protect,
        [
            body('stopDate')
                .isISO8601()
                .withMessage('stopDate must be a valid date'),
            body('realizedValue')
                .isFloat({ gt: 0 })
                .withMessage('realizedValue must be a positive number'),
            validateRequest,
        ],
        stopInvestment
    );

module.exports = router;
