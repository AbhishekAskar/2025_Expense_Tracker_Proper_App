const express = require("express");
const router = express.Router();
const expenseController = require("../Controllers/expenseController");

router.post("/expenses", expenseController.addExpense);
router.post("/login", expenseController.loginUser);

module.exports = router;
