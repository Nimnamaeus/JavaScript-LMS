const express = require('express');
const router = express.Router();
const AssignCourse = require('../models/AssignCourse');
const User = require('../models/User');
const Course = require('../models/Course');

// Assign course to student
router.post('/', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    // Find existing assignment
    let assignCourse = await AssignCourse.findOne({ student: studentId });
    
    if (!assignCourse) {
      // Create new assignment if doesn't exist
      assignCourse = new AssignCourse({
        student: studentId,
        courses: [courseId]
      });
    } else {
      // Add course to existing assignment if not already present
      if (!assignCourse.courses.includes(courseId)) {
        assignCourse.courses.push(courseId);
      }
    }
    
    await assignCourse.save();
    res.status(201).json({ message: 'Course assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get courses assigned to a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const assignCourse = await AssignCourse.findOne({ student: req.params.studentId })
      .populate('student')
      .populate('courses');
    res.json(assignCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove course from student
router.delete('/:studentId/:courseId', async (req, res) => {
  try {
    const assignCourse = await AssignCourse.findOne({ student: req.params.studentId });
    if (assignCourse) {
      assignCourse.courses = assignCourse.courses.filter(
        course => course.toString() !== req.params.courseId
      );
      await assignCourse.save();
    }
    res.json({ message: 'Course removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
