const mongoose = require("mongoose");

const budgetSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, "Please add a budget limit"],
      min: [0, "Budget limit cannot be negative"],
    },
    month: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
