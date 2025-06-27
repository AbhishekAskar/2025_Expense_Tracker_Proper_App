const { Sequelize } = require('sequelize');
const dotenv = require("dotenv");

const sequelize = new Sequelize('process.env.DB_NAME', 'process.env.DB_USERNAME', 'process.env.DB_PASSWORD', {
    host: "localhost",
    dialect: "mysql",
    logging: (msg) => {
        if (!msg.includes("SELECT")) console.log(msg);
    }
});

//.authenticate returns promise that's why we use AWAIT here

(async () => {
    try {

        await sequelize.authenticate();
        console.log("Connection to the database has been created");

    } catch (error) {

        console.log(error);

    }
})();

module.exports = sequelize;