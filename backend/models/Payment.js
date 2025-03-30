
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['advance'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
