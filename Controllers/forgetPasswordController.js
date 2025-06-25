require('dotenv').config();
const User = require('../Models/userModel');
const ForgotPasswordRequest = require("../Models/forgotPasswordModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Brevo = require('@getbrevo/brevo'); // Brevo SDK
const BREVO_KEY = process.env.BREVO_KEY;
const SECRET_KEY = process.env.JWT_SECRET; // Fallback if .env not set
const path = require("path");

// GET /password/resetpassword/:uuid
const serveResetPasswordForm = async (req, res) => {
  const uuid = req.params.uuid;

  try {
    const request = await ForgotPasswordRequest.findOne({ where: { id: uuid, isActive: true } });

    if (!request) {
      return res.status(400).send("Invalid or expired password reset link");
    }

    // Serve your HTML form
    res.sendFile(path.join(__dirname, "../public/reset-password.html"));
  } catch (err) {
    console.error("Error in serveResetPasswordForm:", err);
    res.status(500).send("Server error");
  }
};


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

        const { v4: uuidv4 } = require("uuid");
        const ForgotPasswordRequest = require("../Models/forgotPasswordModel");

        const requestId = uuidv4();

        // Store reset request in DB
        await ForgotPasswordRequest.create({
            id: requestId,
            userId: user.id,
            isActive: true
        });

        // Link with UUID
        const resetLink = `http://localhost:3000/passwordreset/resetpassword/${requestId}`;


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
        res.status(200).json({ success: true, message: "Reset link sent successfully" });


    } catch (error) {
        console.error("Error in getPasswordLink:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

const updatePassword = async (req, res) => {
  const { newPassword, resetId } = req.body;

  try {
    const request = await ForgotPasswordRequest.findOne({ where: { id: resetId } });

    if (!request || !request.isActive) {
      return res.status(400).json({ success: false, message: "Invalid or expired link" });
    }

    const user = await User.findByPk(request.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Mark the reset link as used
    request.isActive = false;
    await request.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



module.exports = {
    getPasswordLink,
    updatePassword,
    serveResetPasswordForm
};
