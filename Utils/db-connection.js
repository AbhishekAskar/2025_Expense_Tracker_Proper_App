const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('newexpensetracker', 'root', 'Root@123', {
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