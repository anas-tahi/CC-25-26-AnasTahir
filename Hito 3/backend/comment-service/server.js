const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const logger = require('./logger'); // ✅ Winston logger

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Log every request with Winston
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});

// ✅ Routes
const commentRoutes = require("./routes/comment");
app.use("/comments", commentRoutes);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("✅ Connected to MongoDB"))
  .catch(err => logger.error(`❌ MongoDB connection error: ${err.message}`));

// ✅ Start Server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => logger.info(`🚀 Comment service running on port ${PORT}`));
