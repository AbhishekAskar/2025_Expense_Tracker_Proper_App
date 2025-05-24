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

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailId = await Expense.findOne({ where: { email } });
    const passwordId = await Expense.findOne({ where: { password } });

    if (!emailId) {
      return res.status(401).send("Email Id does not exist, please go to the sign up page");
    }
    if(!passwordId){
        return res.status(401).send("Incorrect password!");
    }

    res.status(200).send("Login successful!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Login failed");
  }
};

module.exports = {
    addExpense,
    loginUser
}