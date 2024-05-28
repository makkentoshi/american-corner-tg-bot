const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: String,
  dayschedule: {
    day: String,
    time: String,
  },
});

module.exports = mongoose.model("Course", CourseSchema);
