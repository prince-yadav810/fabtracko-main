
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, passwordProvided: !!password });
    
    // Check username
    if (username !== ADMIN_USERNAME) {
      console.log('Username mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password using bcrypt compare
    const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    
    console.log('Password check result:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: 'admin-id', username: ADMIN_USERNAME },
      process.env.JWT_SECRET || 'your-default-secret-key-change-in-production',
      { expiresIn: '1d' }
    );
    
    console.log('Login successful for:', username);
    
    // Send token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: 'admin-id',
        username: ADMIN_USERNAME
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token route (for client-side token validation)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-default-secret-key-change-in-production'
    );
    
    // Verify it's our admin user
    if (decoded.username !== ADMIN_USERNAME) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(200).json({
      user: {
        id: 'admin-id',
        username: ADMIN_USERNAME
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
});

module.exports = router;
