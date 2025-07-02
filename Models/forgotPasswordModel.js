const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../Utils/db-connection");
const User = require("./userModel");

const ForgotPasswordRequest = sequelize.define("forgotpasswordrequest", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, 
    allowNull: false,
    primaryKey: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);

module.exports = ForgotPasswordRequest;
