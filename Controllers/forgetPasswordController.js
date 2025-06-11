require('dotenv').config();
const User = require('../Models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Brevo = require('@getbrevo/brevo'); // Brevo SDK
const BREVO_KEY = process.env.BREVO_KEY;
const SECRET_KEY = process.env.JWT_SECRET || "mellow234@*%Yellow"; // Fallback if .env not set

const getPasswordLink = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Find user by email
        const user = await User.findOne({
            where: { email }
        }); // ✅ Correct Sequelize syntax


        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with that email" });
        }

        // 2. Generate a reset token valid for 1 hour
        const token = jwt.sign(
            { userId: user.id },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        // 3. Create reset link (update URL as per your frontend setup)
        const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;

        // 4. Setup Brevo (Sendinblue)
        const apiInstance = new Brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_KEY);

        const sendSmtpEmail = {
            to: [{ email: email }],
            sender: { name: "Expense Tracker", email: "abhiaskar.18@gmail.com" },
            subject: "Password Reset Link",
            htmlContent: `<p>Hello 👋,</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 1 hour.</p>`
        };

        // 5. Send email
        await apiInstance.sendTransacEmail(sendSmtpEmail);

        // 6. Respond back
        res.status(200).json({ success: true, message: "Reset link sent successfully", token });

    } catch (error) {
        console.error("Error in getPasswordLink:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

const updatePassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // 1. Verify token
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;

        // 2. Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Find user by PK and update password
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.password = hashedPassword;
        await user.save(); // ✅ Save updated password

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error("Error updating password:", error.message);
        res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
};


module.exports = {
    getPasswordLink,
    updatePassword
};
