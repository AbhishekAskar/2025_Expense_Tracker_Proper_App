const db = require('../Utils/db-connection');
const Expense = require('../Models/expenseModel');

const addExpense = async (req, res) => {
    try {
        const { money, description, category } = req.body;
        const userId = req.user.userId;
        const expense = await Expense.create({money, description, category, userId});
        res.status(201).json(expense);
    } catch (error) {
        console.log(error);
        res.status(500).send("Cannot create an expense");
    }
}

const getExpense = async (req, res) => {
    try {
        const userId = req.user.userId
        const expense = await Expense.findAll({where : {userId}});
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