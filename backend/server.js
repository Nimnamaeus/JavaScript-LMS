const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add this after your middleware setup
app.use('/uploads', express.static('uploads'));

// Add the submissions route
app.use('/api/submissions', require('./routes/submissions'));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/lms_db')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assign-courses', require('./routes/assignCourses'));
app.use('/api/activities', require('./routes/activities'));

let server;
const PORT = process.env.PORT || 5000;

// Graceful shutdown function
function shutdown() {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  }
}

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 