// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("./logger");

// Load .env file
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
const commentRoutes = require("./routes/Comment"); 
app.use("/comments", commentRoutes);

// ✅ MongoDB connection
// Only use the COMMENT_MONGO_URI for this service
const MONGO_URI = process.env.COMMENT_MONGO_URI;

if (!MONGO_URI) {
  logger.error("❌ COMMENT_MONGO_URI is not defined in .env");
  process.exit(1); // Exit if no URI
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => logger.info("✅ Connected to MongoDB Atlas"))
  .catch(err => logger.error("❌ MongoDB connection error: " + err));

// ✅ Start server
const PORT = process.env.COMMENT_PORT || 6000;
app.listen(PORT, () => logger.info(`🚀 Comment service running on port ${PORT}`));
