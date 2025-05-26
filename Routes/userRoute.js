const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");

router.post("/signup", userController.addUser);
router.post("/login", userController.loginUser);

module.exports = router;
