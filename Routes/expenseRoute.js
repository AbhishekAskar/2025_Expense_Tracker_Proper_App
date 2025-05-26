const express = require("express");
const router = express.Router();
const expenseController = require("../Controllers/expenseController");

router.post("/", expenseController.addExpense);
router.get("/", expenseController.getExpense);
router.delete("/delete/:id", expenseController.deleteExpense);

module.exports = router;