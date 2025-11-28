const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("./logger");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const commentRoutes = require("./routes/Comment");
app.use("/comments", commentRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info("✅ Connected to MongoDB"))
  .catch((err) => logger.error("❌ MongoDB connection error: " + err));

// Start server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => logger.info(`🚀 Comment service running on port ${PORT}`));
