const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const logger = require('./logger'); 

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Log every request with Winston
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});

// ✅ Routes
const productRoutes = require("./routes/products");
app.use("/products", productRoutes);

const wishlistRoutes = require("./routes/wishlist");
app.use("/wishlist", wishlistRoutes);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("✅ Connected to MongoDB"))
  .catch(err => logger.error(`❌ MongoDB connection error: ${err.message}`));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🚀 Product service running on port ${PORT}`));
