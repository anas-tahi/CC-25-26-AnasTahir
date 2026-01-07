// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("./logger");

const authRoutes = require("./routes/auth");
const shoppingListsRoutes = require("./routes/shoppingLists");

dotenv.config();

const app = express();

/* ============================
   🔐 CORS — HARD FIX (Render-safe)
============================ */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://frontend-12gl.onrender.com");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ============================
   Middleware
============================ */
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});

/* ============================
   Routes
============================ */
app.use("/auth", authRoutes);
app.use("/shopping-lists", shoppingListsRoutes);

/* ============================
   MongoDB
============================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("✅ MongoDB connected"))
  .catch((err) => logger.error("❌ Mongo error:", err.message));

/* ============================
   Start server
============================ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`🚀 Auth service running on port ${PORT}`);
});
