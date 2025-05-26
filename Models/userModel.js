const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require('../Utils/db-connection');

const Users = sequelize.define('users', {
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

module.exports = Users;
