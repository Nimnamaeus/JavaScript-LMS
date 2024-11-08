const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: Number,
    required: true,
    enum: [0, 1]  // 0 for admin, 1 for student
  }
});

module.exports = mongoose.model('User', userSchema); 