const express = require('express');
const { 
  createTransfer, 
  getTransactions,
  depositFunds 
} = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/transfer', authMiddleware, createTransfer);
router.get('/history', authMiddleware, getTransactions);
router.post('/deposit', authMiddleware, depositFunds);

module.exports = router;