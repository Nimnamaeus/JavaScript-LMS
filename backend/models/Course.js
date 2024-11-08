const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true
  },
  courseType: {
    type: String,
    required: true
  },
  courseImage: {
    type: String,
    required: true
  },
  courseDescription: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Course', courseSchema); 