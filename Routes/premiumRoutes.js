const express = require('express');
const router = express.Router();
const premiumController = require('../Controllers/premiumController');
const authenticate = require('../Middlewares/authMiddleware');
const Users = require('../Models/userModel');

router.post('/pay', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log("🧠 userId from token:", userId);

        const user = await Users.findByPk(userId);
        console.log("📦 Fetched user from DB:", user?.dataValues || user);

        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Don't check phone here, just proceed.


        const orderId = `order_${Date.now()}`;
        const amount = 99;
        const currency = "INR";

        const paymentSessionId = await premiumController.createOrder(
            orderId,
            amount,
            currency,
            userId,
            "9999999999"
        );

        console.log("✅ Got paymentSessionId:", paymentSessionId);

        res.status(200).json({ paymentSessionId });
    } catch (err) {
        console.error("❌ Pay Route Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/expense/:orderId', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId } = req.params;

        console.log("🌟 Payment completed for Order ID:", orderId);

        // Update user as premium
        const user = await Users.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isPremium = true;
        await user.save();

        console.log("🎉 User upgraded to premium:", user.name);

        // Redirect back to main expense page
        res.redirect('/expense.html');
    } catch (err) {
        console.error("❌ Error in GET /expense/:orderId:", err);
        res.status(500).send("Something went wrong.");
    }
});



module.exports = router;
