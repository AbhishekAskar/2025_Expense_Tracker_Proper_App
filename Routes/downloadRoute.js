const express = require('express');
const router = express.Router();
const downloadController = require('../Controllers/downloadController');
const authMiddleware = require('../Middlewares/authMiddleware'); 

router.get('/download', authMiddleware, downloadController.downloadExpenses);
router.get('/download-history', authMiddleware, downloadController.getDownloadHistory);

module.exports = router;
