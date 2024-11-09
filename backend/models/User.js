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
  },
  idNumber: {
    type: String,
    required: function() {
      return this.type === 1; // Only required if user is a student
    },
    unique: true,
    sparse: true, // Allows multiple null values for admin users
    validate: {
      validator: function(v) {
        if (this.type === 0) return true; // Skip validation for admin
        return /^\d{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid ID number! Must be 12 digits.`
    }
  }
});

module.exports = mongoose.model('User', userSchema); 