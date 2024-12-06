const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = req.user;

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      isVerified: user.isVerified
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const user = req.user;

    // Update user
    user.username = username || user.username;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message 
    });
  }
};