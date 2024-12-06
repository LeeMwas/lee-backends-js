const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No token, authorization denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      status: 'error',
      message: 'Token is not valid',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

module.exports = authMiddleware;