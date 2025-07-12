
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const workerRoutes = require('./routes/workers');
const attendanceRoutes = require('./routes/attendance');
const paymentRoutes = require('./routes/payments');
const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/workers', authenticate, workerRoutes);
app.use('/api/attendance', authenticate, attendanceRoutes);
app.use('/api/payments', authenticate, paymentRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// CI/CD test
// CI/CD test
// CI/CD test - fixed auth
// CI/CD test - fixed auth
// CI/CD test - authentication fixed
// Test after permission fix
// Test after permission fix
