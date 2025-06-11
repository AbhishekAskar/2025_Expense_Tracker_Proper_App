const express = require("express");
const router = express.Router();
const forgetPasswordController = require("../Controllers/forgetPasswordController");
const authenticate = require("../Middlewares/authMiddleware");

console.log("Inside Reset Password route.")
router.post("/link", forgetPasswordController.getPasswordLink);
router.post("/update-password", forgetPasswordController.updatePassword);

module.exports = router;