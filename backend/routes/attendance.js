
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const attendance = await Attendance.find();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance
router.post('/', async (req, res) => {
  try {
    // Check if record already exists
    const existingRecord = await Attendance.findOne({
      workerId: req.body.workerId,
      date: req.body.date
    });

    if (existingRecord) {
      // Update existing record
      existingRecord.status = req.body.status;
      const updatedRecord = await existingRecord.save();
      return res.json(updatedRecord);
    }

    // Create new record
    const attendance = new Attendance(req.body);
    const newAttendance = await attendance.save();
    res.status(201).json(newAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
