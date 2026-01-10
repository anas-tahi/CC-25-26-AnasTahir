const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

/* ============================
   BODY SIZE (FOR AVATAR BASE64)
============================ */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ============================
   GLOBAL CORS (MUST BE FIRST)
============================ */
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://frontend-12gl.onrender.com"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

/* ============================
   ROUTES
============================ */
app.use("/auth", require("./routes/auth"));
app.use("/shopping-lists", require("./routes/shoppingLists"));

/* ============================
   MONGO
============================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Auth service running on port ${PORT}`)
);
