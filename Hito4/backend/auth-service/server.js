// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("./logger");
const shoppingListsRoutes = require("./routes/shoppingLists");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();

// ============================
// Middleware
// ============================

// Parse JSON bodies
app.use(express.json());

// ----------------------------
// CORS configuration
// ----------------------------
const allowedOrigins = [
  "https://frontend-12gl.onrender.com", // deployed frontend
  "http://localhost:3000"               // local dev frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests like Postman with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked origin: ${origin}`), false);
    }
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true, // allow cookies / auth headers
}));

// Log every request
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});

// ============================
// Routes
// ============================
app.use("/auth", authRoutes);
app.use("/shopping-lists", shoppingListsRoutes);

// ============================
// MongoDB Connection
// ============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("✅ Connected to MongoDB"))
  .catch((err) => logger.error(`❌ MongoDB connection error: ${err.message}`));

// ============================
// Error handler
// ============================
app.use((err, req, res, next) => {
  if (err.message.startsWith("CORS")) {
    logger.warn(err.message);
    return res.status(403).json({ message: err.message });
  }
  logger.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// ============================
// Start Server
// ============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`🚀 Auth service running on port ${PORT}`);
});
