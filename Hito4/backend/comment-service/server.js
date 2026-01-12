const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./logger");

// Load .env file
dotenv.config();

const app = express();

/* ============================
   LOGGING (OBSERVABILITY)
============================ */
app.use(morgan("dev"));

/* ============================
   MIDDLEWARE
============================ */
app.use(cors());
app.use(express.json());

/* ============================
   HEALTH CHECK (MONITORING)
============================ */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "comment-service",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

/* ============================
   ROUTES
============================ */
const commentRoutes = require("./routes/Comment");
app.use("/comments", commentRoutes);

/* ============================
   MONGO
============================ */
const MONGO_URI = process.env.COMMENT_MONGO_URI;

if (!MONGO_URI) {
  logger.error("❌ COMMENT_MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("✅ Connected to MongoDB Atlas"))
  .catch((err) =>
    logger.error("❌ MongoDB connection error: " + err)
  );

/* ============================
   START SERVER
============================ */
const PORT = process.env.COMMENT_PORT || 6000;
app.listen(PORT, () =>
  logger.info(`🚀 Comment service running on port ${PORT}`)
);
