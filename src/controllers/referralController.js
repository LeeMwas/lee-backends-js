const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.generateReferralLink = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    // Ensure referral code is generated
    if (!user.referralCode) {
      await user.save();
    }

    res.status(200).json({
      status: 'success',
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

exports.applyReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body;
    const newUser = req.user;

    if (!referralCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Referral code is required'
      });
    }

    // Find the referrer
    const referrer = await User.findOne({ referralCode });

    if (!referrer) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid referral code'
      });
    }

    // Check if user has already been referred
    if (newUser.referredBy) {
      return res.status(400).json({
        status: 'error',
        message: 'User already referred'
      });
    }

    // Apply referral bonus
    const bonusAmount = await newUser.applyReferralBonus(referrer);

    // Create referral bonus transaction
    await Transaction.create({
      user: referrer._id,
      type: 'REFERRAL_BONUS',
      amount: bonusAmount,
      description: `Referral bonus for ${newUser.username}`
    });

    res.status(200).json({
      status: 'success',
      message: 'Referral code applied successfully',
      referralBonus: bonusAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

exports.getReferralStats = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    const referralStats = user.getReferralStats();

    res.status(200).json({
      status: 'success',
      data: referralStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};