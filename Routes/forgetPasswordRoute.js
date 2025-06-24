const express = require("express");
const router = express.Router();
const forgetPasswordController = require("../Controllers/forgetPasswordController");
const authenticate = require("../Middlewares/authMiddleware");

router.post("/link", forgetPasswordController.getPasswordLink);
router.get("/resetpassword/:uuid", forgetPasswordController.serveResetPasswordForm);
router.post("/update-password", forgetPasswordController.updatePassword);

module.exports = router;