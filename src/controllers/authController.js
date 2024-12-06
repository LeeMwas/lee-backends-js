const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Handle referral if code is provided
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        await newUser.applyReferralBonus(referrer);
      }
    }

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      status: 'success',
      token,
      data: { 
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        referralCode: newUser.referralCode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      status: 'success',
      token,
      data: { 
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};