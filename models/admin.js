const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  userId: String,
  name: String,
  role: { type: String, default: "admin" },
});

module.exports = mongoose.model('Admin', AdminSchema);