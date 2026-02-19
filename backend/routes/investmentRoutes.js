const express = require('express');
const router = express.Router();
const {
    getInvestments,
    getInvestmentSummary,
    createInvestment,
    updateInvestment,
    deleteInvestment,
} = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');

// Summary must come BEFORE /:id to avoid being caught as an id lookup
router.route('/summary').get(protect, getInvestmentSummary);
router.route('/').get(protect, getInvestments).post(protect, createInvestment);
router.route('/:id').put(protect, updateInvestment).delete(protect, deleteInvestment);

module.exports = router;
