const mongoose = require("mongoose");

const { MongoClient, ServerApiVersion } = require("mongodb");

const mongoURI = process.env.MONGODB_API_TOKEN;

const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(mongoURI, dbOptions)
  .then(() => console.log("MongoDB is connected..."))
  .catch((err) => console.error("Error in connection to MongoDB"));

