const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  money: {
    type: Number,  // Use Number instead of String
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User
    ref: "User",
    required: true
  }
}, { timestamps: true }); // createdAt and updatedAt auto-managed

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
