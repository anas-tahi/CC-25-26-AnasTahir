const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const logger = require("./logger");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});

// Routes
const productRoutes = require("./routes/products");
app.use("/products", productRoutes);

const wishlistRoutes = require("./routes/wishlist");
app.use("/wishlist", wishlistRoutes);

const compareListRoutes = require("./routes/compareList");
app.use("/compare-list", compareListRoutes);

// MongoDB connection
const mongoUri = process.env.PRODUCT_MONGO_URI;
if (!mongoUri) {
  logger.error("❌ PRODUCT_MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info("✅ Connected to MongoDB Atlas"))
  .catch((err) => logger.error("❌ MongoDB connection error: " + err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🚀 Product service running on port ${PORT}`));
