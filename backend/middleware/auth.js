
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Hard-coded credentials
const ADMIN_USERNAME = 'vikasfabtech';
// Pre-hashed password for 'passfabtech'
const ADMIN_PASSWORD_HASH = '$2b$10$V9UEFsxZMmT6UvZsQPA/8ueqwCnOzJYYNFQlLD9Qz0CnYlB.9Lwpe';

// Authentication middleware to protect routes
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed. No token provided.' });
    }
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-default-secret-key-change-in-production'
    );
    
    // For hard-coded authentication, we only check if the token is valid
    // and contains the correct username
    if (decoded.username !== ADMIN_USERNAME) {
      return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
    }
    
    // Create a minimal user object for compatibility with existing code
    req.user = {
      id: 'admin-id',
      username: ADMIN_USERNAME
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};

module.exports = { 
  authenticate,
  // Export for use in auth routes
  ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH
};
