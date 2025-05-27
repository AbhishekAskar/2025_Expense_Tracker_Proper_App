const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require('../Utils/db-connection');

const Expenses = sequelize.define('expenses', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  money: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING, 
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true 
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Expenses;
