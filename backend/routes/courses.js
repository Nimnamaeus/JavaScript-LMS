const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Activity = require('../models/Activity');
const AssignCourse = require('../models/AssignCourse');

// Create a new course
router.post('/', async (req, res) => {
  try {
    const { courseName, courseType, courseImage, courseDescription, adminId } = req.body;
    
    // Check if course already exists for this admin
    const existingCourse = await Course.findOne({ 
      courseName: { $regex: new RegExp(courseName, 'i') },
      courseType: { $regex: new RegExp(courseType, 'i') },
      adminId: adminId
    });
    
    if (existingCourse) {
      return res.status(400).json({ message: 'Course already exists' });
    }

    const course = new Course({
      courseName,
      courseType,
      courseImage,
      courseDescription,
      adminId
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
    const { adminId } = req.query;
    const courses = await Course.find({ adminId });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a course
router.delete('/:id', async (req, res) => {
  try {
    // Delete all activities associated with this course
    await Activity.deleteMany({ courseId: req.params.id });
    
    // Delete the course
    await Course.findByIdAndDelete(req.params.id);
    
    // Remove the course from all student assignments
    await AssignCourse.updateMany(
      { courses: req.params.id },
      { $pull: { courses: req.params.id } }
    );
    
    res.json({ message: 'Course and associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this new route to get a single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
