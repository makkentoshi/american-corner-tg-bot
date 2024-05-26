const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: String,
    description: String,
    schedule: {
      day: String,
      time: String
    },
    weeklySchedule: [{
      day: String,
      time: String
    }]
  });
  


module.exports = mongoose.model('Course', CourseSchema);