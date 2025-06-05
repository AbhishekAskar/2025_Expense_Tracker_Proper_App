const express = require("express");
const router = express.Router();
const Users = require('../Models/userModel');
const authenticate = require('../Middlewares/authMiddleware')
const userController = require("../Controllers/userController");

router.post("/signup", userController.addUser);
router.post("/login", userController.loginUser);
router.get('/details', authenticate, async (req, res) => {
    try {
        const user = await Users.findByPk(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ name: user.name, email: user.email, isPremium: user.isPremium });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
