const express = require("express");
const router = express.Router();
const authenticate = require('../Middlewares/authMiddleware');
const expenseController = require("../Controllers/expenseController");

console.log("Inside Expense Route")
router.post("/", authenticate, expenseController.addExpense);
router.get("/", authenticate,  expenseController.getExpense);
router.delete("/delete/:id", authenticate, expenseController.deleteExpense);

module.exports = router;