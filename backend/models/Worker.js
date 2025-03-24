
const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String
  },
  joiningDate: {
    type: String,
    required: true
  },
  dailyWage: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);
