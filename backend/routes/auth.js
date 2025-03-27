
const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-default-secret-key-change-in-production',
      { expiresIn: '1d' }
    );
    
    // Send token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username
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
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
});

// Initialize admin user route (for first-time setup)
router.post('/init', async (req, res) => {
  try {
    // Check if any user exists
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      return res.status(400).json({ 
        message: 'Admin user already exists. Initialization not allowed.' 
      });
    }
    
    // Create admin user with environment variables
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'changeme123';
    
    const user = new User({ username, password });
    await user.save();
    
    res.status(201).json({ 
      message: 'Admin user initialized successfully',
      username
    });
  } catch (error) {
    console.error('Admin initialization error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
