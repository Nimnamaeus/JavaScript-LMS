const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// Create a new submission
router.post('/', async (req, res) => {
  try {
    const { studentId, activityId, submissionUrl } = req.body;
    console.log('Received submission:', { studentId, activityId, submissionUrl });

    const submission = new Submission({ studentId, activityId, submissionUrl });
    await submission.save();
    res.status(201).json({ message: 'Submission created successfully' });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get submissions for a specific activity
router.get('/activity/:activityId', async (req, res) => {
  try {
    const submissions = await Submission.find({ activityId: req.params.activityId })
      .populate({
        path: 'studentId',
        select: 'userName idNumber'
      })
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific submission by activity and student ID
router.get('/:activityId/:studentId', async (req, res) => {
  try {
    const { activityId, studentId } = req.params;
    const submission = await Submission.findOne({ activityId, studentId });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this new route to handle submission deletion
router.delete('/:submissionId', async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.status(200).json({ message: 'Submission cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
