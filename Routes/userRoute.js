const express = require("express");
const router = express.Router();
const authenticate = require('../Middlewares/authMiddleware');
const userController = require("../Controllers/userController");

router.post("/signup", userController.addUser);
router.post("/login", userController.loginUser);
router.get("/details", authenticate, userController.getUserDetails);

module.exports = router;
