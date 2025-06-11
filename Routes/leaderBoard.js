const express = require("express");
const router = express.Router();
const authenticate = require('../Middlewares/authMiddleware');
const leaderBoard = require('../Controllers/leaderBoardController');

router.get('/', authenticate, leaderBoard.getLeaderboard);

module.exports = router;