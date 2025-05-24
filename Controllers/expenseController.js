const db = require('../Utils/db-connection');
const Expense = require('../Models/expenseModel');

const addExpense = async (req, res) =>{
    try {
        const { name, email, password } = req.body;
        const existingUser = await Expense.findOne({ where: {email} });
        if(existingUser){
            return res.status(400).send("User with the same Email Id already exists");
        }
        await Expense.create({
            name,
            email,
            password
        });
        res.status(201).send("Expense Created Successfully!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Cannot create an expense");
    }
}

module.exports = {
    addExpense
}