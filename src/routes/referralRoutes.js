const express = require('express');
const referralController = require('../controllers/referralController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Generate referral link
router.get('/link', authMiddleware, referralController.generateReferralLink);

// Apply referral code
router.post('/apply', authMiddleware, referralController.applyReferralCode);

// Get referral statistics
router.get('/stats', authMiddleware, referralController.getReferralStats);

module.exports = router;