const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { userName, password, type } = req.body;
    const user = await User.findOne({ userName, password, type });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { userName, password, type, idNumber } = req.body;

    // Only check for existing ID number if registering a student
    if (type === 1) {
      const existingUser = await User.findOne({ idNumber });
      if (existingUser) {
        return res.status(400).json({ message: 'ID number already exists' });
      }
    }

    const userData = { userName, password, type };
    if (type === 1) {
      userData.idNumber = idNumber;
    }

    const user = new User(userData);
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ type: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
