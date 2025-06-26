const { DataTypes } = require("sequelize");
const sequelize = require("../Utils/db-connection");

const DownloadHistory = sequelize.define("DownloadHistory", {
  fileURL: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  downloadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = DownloadHistory;
