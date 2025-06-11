const express = require('express');
const router = express.Router();
const authenticate = require('../Middlewares/authMiddleware');
const purchaseController = require('../Controllers/purchaseController');

router.post('/pay', authenticate, purchaseController.initiatePayment);
router.get('/expense/:orderId', authenticate, purchaseController.markUserPremium);
router.post('/update-status', authenticate, purchaseController.updatePaymentStatus);

module.exports = router;
