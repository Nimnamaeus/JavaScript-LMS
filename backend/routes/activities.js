const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Create activity
router.post('/', async (req, res) => {
  try {
    // Get the current highest sequence number for this course
    const highestSequence = await Activity.findOne(
      { courseId: req.body.courseId },
      { sequence: 1 }
    ).sort({ sequence: -1 });
    
    // Ensure nextSequence is a valid number
    let nextSequence = 1;
    if (highestSequence && typeof highestSequence.sequence === 'number') {
      nextSequence = highestSequence.sequence + 1;
    }
    
    const activity = new Activity({
      ...req.body,
      sequence: nextSequence
    });
    
    await activity.save();
    res.status(201).json({ message: 'Activity created successfully', activity });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get activities for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const activities = await Activity.find({ courseId: req.params.courseId })
      .sort({ sequence: 1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single activity
router.get('/:id', async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update activity
router.put('/:id', async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete activity
router.delete('/:id', async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 