const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  balance: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Referral System Fields
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralEarnings: {
    type: Number,
    default: 0
  },
  referralCount: {
    type: Number,
    default: 0
  },
  referralHistory: [{
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bonus: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Generate unique referral code
UserSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = this.username + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Method to apply referral bonus
UserSchema.methods.applyReferralBonus = async function(referrer) {
  const REFERRAL_BONUS = 500; // 500 naira bonus
  
  // Add referral bonus to referrer
  referrer.referralEarnings += REFERRAL_BONUS;
  referrer.referralCount += 1;
  
  // Log referral in history
  referrer.referralHistory.push({
    referredUser: this._id,
    bonus: REFERRAL_BONUS
  });

  await referrer.save();
};

module.exports = mongoose.model('User', UserSchema);
