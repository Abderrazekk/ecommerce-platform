const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Connection successful – you may add a logger here if needed
  } catch (error) {
    // Exit process with failure (no logging to avoid exposing details)
    process.exit(1);
  }
};

module.exports = connectDB;
