const express = require('express');
const router = express.Router();
const { getDashboardSummary, getRecentTransactions } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getDashboardSummary);
router.get('/transactions', protect, getRecentTransactions);

module.exports = router;
