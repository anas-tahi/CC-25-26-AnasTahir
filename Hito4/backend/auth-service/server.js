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

// CORS configuration
const allowedOrigins = [
  "https://frontend-12gl.onrender.com", // deployed frontend
  "http://localhost:3000"               // local frontend for dev
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // allows cookies and auth headers
};
app.use(cors(corsOptions));

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
// Start Server
// ============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`🚀 Auth service running on port ${PORT}`);
});
