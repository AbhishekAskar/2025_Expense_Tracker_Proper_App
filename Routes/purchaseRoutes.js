const express = require('express');
const router = express.Router();
const authenticate = require('../Middlewares/authMiddleware');
const { getPaymentStatus } = require('../Controllers/premiumController');
const Users = require('../Models/userModel');

router.post('/update-status', authenticate, async (req, res) => {
    const { orderId } = req.body;

    try {
        const status = await getPaymentStatus(orderId);
        console.log("🧾 Payment status for", orderId, ":", status);

        if (status === "Success") {
            const user = await Users.findByPk(req.user.userId);
            if (!user) return res.status(404).json({ message: "User not found" });

            user.isPremium = true;
            await user.save();

            return res.status(200).json({ message: "User upgraded to premium" });
        } else {
            return res.status(200).json({ message: "Payment not successful", status });
        }
    } catch (error) {
        console.error("Error in /purchase/update-status:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
