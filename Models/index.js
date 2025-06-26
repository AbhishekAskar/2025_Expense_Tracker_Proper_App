const Sequelize = require('sequelize');
const sequelize = require('../Utils/db-connection');

const User = require('./userModel');
const Expense = require('./expenseModel');
const DownloadHistory = require("./downloadHistory");

User.hasMany(Expense);
Expense.belongsTo(User);

DownloadHistory.belongsTo(User);
User.hasMany(DownloadHistory);


module.exports = {
  User,
  Expense,
  DownloadHistory,
  sequelize
};
