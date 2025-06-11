const Users = require('../Models/userModel');
const { getPaymentStatus, createOrder } = require('./premiumController');

// 🔹 For /premium/pay
const initiatePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await Users.findByPk(userId);

        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        const orderId = `order_${Date.now()}`;
        const amount = 99;
        const currency = "INR";

        const paymentSessionId = await createOrder(orderId, amount, currency, userId, "9999999999");

        res.status(200).json({ paymentSessionId, orderId });
    } catch (err) {
        console.error("❌ Pay Route Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// 🔹 For /purchase/update-status
const updatePaymentStatus = async (req, res) => {
    const { orderId } = req.body;

    try {
        const status = await getPaymentStatus(orderId);
        if (status === "Success") {
            const user = await Users.findByPk(req.user.id);
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
};

// 🔹 For /premium/expense/:orderId
const markUserPremium = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isPremium = true;
        await user.save();

        res.redirect('/expense.html');
    } catch (err) {
        console.error("❌ Error in GET /expense/:orderId:", err);
        res.status(500).send("Something went wrong.");
    }
};

module.exports = {
    initiatePayment,
    updatePaymentStatus,
    markUserPremium
};
