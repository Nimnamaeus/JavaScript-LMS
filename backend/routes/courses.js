const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Create a new course
router.post('/', async (req, res) => {
  try {
    const { courseName, courseType, courseImage, courseDescription } = req.body;
    
    // Check if course already exists
    const existingCourse = await Course.findOne({ 
      courseName: { $regex: new RegExp(courseName, 'i') },
      courseType: { $regex: new RegExp(courseType, 'i') }
    });
    
    if (existingCourse) {
      return res.status(400).json({ message: 'Course already exists' });
    }

    const course = new Course({
      courseName,
      courseType,
      courseImage,
      courseDescription
    });

    await course.save();
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a course
router.delete('/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
