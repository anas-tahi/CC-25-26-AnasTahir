const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

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
    service: "product-service",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

/* ============================
   ROUTES
============================ */
app.use("/products", require("./routes/products"));
app.use("/compare-list", require("./routes/compareList"));
app.use("/wishlist", require("./routes/wishlist"));

/* ============================
   MONGO
============================ */
mongoose
  .connect(process.env.PRODUCT_MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Product service running on ${PORT}`)
);
