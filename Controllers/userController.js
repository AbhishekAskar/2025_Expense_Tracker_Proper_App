const db = require('../Utils/db-connection');
const User = require('../Models/userModel');
const bcrypt = require('bcrypt');

console.log("hello")

const addUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body);
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).send("User with the same Email Id already exists");
        }
        const saltround = 10;
        bcrypt.hash(password, saltround, async (error, hash) => {
            await User.create({
                name,
                email,
                password: hash
            });
            res.status(201).send("User Created Successfully!");

        })
    } catch (error) {
        console.log(error);
        res.status(500).send("Cannot create an user");
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).send("Email Id does not exist, please go to the sign up page");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send("Incorrect password!");
        }

        res.status(200).send("Login successful!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Login failed");
    }
};


module.exports = {
    addUser,
    loginUser
}