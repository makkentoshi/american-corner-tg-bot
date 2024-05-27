const mongoose = require("mongoose");

const mongoURI = process.env.MONGODB_API_TOKEN;

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB is connected..."))
  .catch((err) => console.error("Error in connection to MongoDB", err));



  
