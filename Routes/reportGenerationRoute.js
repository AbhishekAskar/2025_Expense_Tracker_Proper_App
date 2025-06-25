const express = require("express");
const router = express.Router();
const authenticate = require("../Middlewares/authMiddleware");
const analyticsController = require("../Controllers/reportGenerationController");

router.get("/data", authenticate, analyticsController.getAnalyticsData);
router.get("/download", authenticate, analyticsController.downloadExpenses);

module.exports = router;
