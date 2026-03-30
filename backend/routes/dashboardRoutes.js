const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");
const {
  getDashboardSummary,
  getRecentTransactions,
  getMonthlyBudgets,
  upsertMonthlyBudget,
  deleteMonthlyBudget,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validationMiddleware");

router.get("/summary", protect, getDashboardSummary);

router.get(
  "/budgets",
  protect,
  [
    query("month")
      .optional()
      .matches(/^\d{4}-\d{2}$/)
      .withMessage("month must be in YYYY-MM format"),
    validateRequest,
  ],
  getMonthlyBudgets,
);

router.post(
  "/budgets",
  protect,
  [
    body("category").trim().notEmpty().withMessage("category is required"),
    body("limit")
      .isFloat({ gt: 0 })
      .withMessage("limit must be a positive number"),
    body("month")
      .optional()
      .matches(/^\d{4}-\d{2}$/)
      .withMessage("month must be in YYYY-MM format"),
    validateRequest,
  ],
  upsertMonthlyBudget,
);

router.delete(
  "/budgets/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid budget id"), validateRequest],
  deleteMonthlyBudget,
);

router.get(
  "/transactions",
  protect,
  [
    query("type")
      .optional()
      .isIn(["all", "expense", "investment"])
      .withMessage("type must be one of all, expense, or investment"),
    query("sort")
      .optional()
      .isIn(["date", "amount"])
      .withMessage('sort must be "date" or "amount"'),
    query("order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage('order must be "asc" or "desc"'),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage("limit must be an integer between 1 and 200"),
    query("from")
      .optional()
      .isISO8601()
      .withMessage("from must be a valid date"),
    query("to").optional().isISO8601().withMessage("to must be a valid date"),
    validateRequest,
  ],
  getRecentTransactions,
);

module.exports = router;
