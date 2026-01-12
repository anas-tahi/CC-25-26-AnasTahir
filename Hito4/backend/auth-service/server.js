const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();
const app = express();

/* ============================
   LOGGING
============================ */
app.use(morgan("dev"));

/* ============================
   BODY PARSING
============================ */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ============================
   CORS
============================ */
app.use(cors({
  origin: "https://frontend-12gl.onrender.com",
  credentials: true
}));

/* ============================
   HEALTH CHECK
============================ */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "auth-service",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

/* ============================
   ROUTES
============================ */
app.use("/auth", require("./routes/auth"));
app.use("/shopping-lists", require("./routes/shoppingLists"));

/* ============================
   MONGO CONNECTION
============================ */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

/* ============================
   SERVER START
============================ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Auth service running on port ${PORT}`));
