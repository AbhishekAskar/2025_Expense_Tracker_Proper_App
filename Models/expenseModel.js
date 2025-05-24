const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require('../Utils/db-connection');

const Expenses = sequelize.define('expenses', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING, 
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true 
  }
});

module.exports = Expenses;
