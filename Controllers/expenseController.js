const db = require('../Utils/db-connection');
const Expense = require('../Models/expenseModel');

const addExpense = async (req, res) => {
    try {
        const { money, description, category } = req.body;
        const expense = Expense.create({money, description, category});
        res.status(200).send("Expense has been added successfully!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Cannot create an expense");
    }
}

const getExpense = async (req, res) => {
    try {
        const expense = await Expense.findAll();
        res.status(200).json(expense);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error occured!");
    }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.destroy({ where: { id } });
    res.status(200).send("Expense deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to delete expense");
  }
};


module.exports = {
    addExpense,
    getExpense,
    deleteExpense
}