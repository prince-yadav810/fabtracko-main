
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'halfday', 'overtime'],
    required: true
  }
}, { timestamps: true });

// Compound index to ensure unique attendance records per worker per day
attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
