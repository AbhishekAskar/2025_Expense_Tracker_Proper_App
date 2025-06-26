const express = require('express');
const router = express.Router();
const { downloadExpenses } = require('../Controllers/downloadController');
const authMiddleware = require('../Middlewares/authMiddleware'); // for req.user

router.get('/download', authMiddleware, downloadExpenses);

module.exports = router;
