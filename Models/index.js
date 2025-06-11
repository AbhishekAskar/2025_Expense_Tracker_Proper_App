const Sequelize = require('sequelize');
const sequelize = require('../Utils/db-connection');

const User = require('./userModel');
const Expense = require('./expenseModel');

// 🔗 Define association
User.hasMany(Expense);
Expense.belongsTo(User);

// 🧠 Export with names matching your controller
module.exports = {
  User,
  Expense,
  sequelize
};
