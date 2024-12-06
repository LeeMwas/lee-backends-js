const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createTransfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipientEmail, amount, description } = req.body;
    const sender = req.user;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ 
        message: 'Invalid transfer amount' 
      });
    }

    // Find recipient
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ 
        message: 'Recipient not found' 
      });
    }

    // Check sender balance
    if (sender.balance < amount) {
      return res.status(400).json({ 
        message: 'Insufficient balance' 
      });
    }

    // Create transaction
    const transaction = new Transaction({
      sender: sender._id,
      recipient: recipient._id,
      amount,
      type: 'transfer',
      description
    });

    // Update balances
    sender.balance -= amount;
    recipient.balance += amount;

    // Save changes
    await sender.save({ session });
    await recipient.save({ session });
    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ 
      message: 'Transfer successful',
      transaction 
    });
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ 
      message: 'Transfer failed', 
      error: error.message 
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
    .populate('sender', 'username')
    .populate('recipient', 'username')
    .sort({ createdAt: -1 });

    res.status(200).json({ 
      transactions 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching transactions', 
      error: error.message 
    });
  }
};

exports.depositFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount } = req.body;
    const user = req.user;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ 
        message: 'Invalid deposit amount' 
      });
    }

    // Create deposit transaction
    const transaction = new Transaction({
      sender: user._id,
      recipient: user._id,
      amount,
      type: 'deposit'
    });

    // Update user balance
    user.balance += amount;

    // Save changes
    await user.save({ session });
    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ 
      message: 'Deposit successful',
      balance: user.balance 
    });
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ 
      message: 'Deposit failed', 
      error: error.message 
    });
  }
};