require('dotenv').config();
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Brevo = require('@getbrevo/brevo');

const User = require('../Models/userModel');
const ForgotPasswordRequest = require("../Models/forgotPasswordModel");

const BREVO_KEY = process.env.BREVO_KEY;
const SECRET_KEY = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const serveResetPasswordForm = async (req, res) => {
  const uuid = req.params.uuid;

  try {
    const request = await ForgotPasswordRequest.findOne({
      where: { id: uuid, isActive: true }
    });

    if (!request) {
      return res.status(400).send("Invalid or expired password reset link");
    }

    const oneHour = 60 * 60 * 1000;
    const age = Date.now() - new Date(request.createdAt).getTime();
    if (age > oneHour) {
      request.isActive = false;
      await request.save();
      return res.status(400).send("Link expired. Please request a new one.");
    }

    res.sendFile(path.join(__dirname, "../public/reset-password.html"));
  } catch (err) {
    console.error("Error in serveResetPasswordForm:", err);
    res.status(500).send("Server error");
  }
};

const getPasswordLink = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with that email" });
    }

    const requestId = uuidv4();

    await ForgotPasswordRequest.create({
      id: requestId,
      userId: user.id,
      isActive: true
    });

    const resetLink = `${BASE_URL}/passwordreset/resetpassword/${requestId}`;

    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_KEY);

    const sendSmtpEmail = {
      to: [{ email }],
      sender: { name: "Expense Tracker", email: "abhiaskar.18@gmail.com" },
      subject: "Reset your password",
      htmlContent: `
        <p>Hi there,</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({ success: true, message: "Reset link sent successfully" });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error in getPasswordLink:", error.message);
    }
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const updatePassword = async (req, res) => {
  const { newPassword, resetId } = req.body;

  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const request = await ForgotPasswordRequest.findOne({ where: { id: resetId } });
    if (!request || !request.isActive) {
      return res.status(400).json({ success: false, message: "Invalid or expired link" });
    }

    const user = await User.findByPk(request.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    request.isActive = false;
    await request.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error updating password:", err);
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getPasswordLink,
  updatePassword,
  serveResetPasswordForm
};
