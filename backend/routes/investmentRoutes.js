const express = require('express');
const router = express.Router();
const {
    getInvestments,
    createInvestment,
    updateInvestment,
    deleteInvestment,
} = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getInvestments).post(protect, createInvestment);
router.route('/:id').put(protect, updateInvestment).delete(protect, deleteInvestment);

module.exports = router;
