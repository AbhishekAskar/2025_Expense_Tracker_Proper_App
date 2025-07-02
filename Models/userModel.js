const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require('../Utils/db-connection');

const User = sequelize.define('user', {
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
    allowNull: false,
    unique : true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  totalExpense: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, 
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = User;
