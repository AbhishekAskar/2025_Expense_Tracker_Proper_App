require("dotenv").config(); // ✅ Load env variables

const { Sequelize } = require('sequelize');

// ✅ Use environment variables (not strings)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.RDS_ENDPOINT,
    dialect: "mysql",
    logging: (msg) => {
      if (!msg.includes("SELECT")) console.log(msg);
    }
  }
);

// ✅ Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection to the database has been created");
  } catch (error) {
    console.error("❌ DB Sync Error:", error);
  }
})();

module.exports = sequelize;
