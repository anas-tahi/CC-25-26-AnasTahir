const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const logger = console; // or your own logger

const app = express();

app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  logger.log(`[${req.method}] ${req.url}`);
  next();
});

// ROUTES
const productsRoutes = require("./routes/products");
const compareListRoutes = require("./routes/compareList");
const wishlistRoutes = require("./routes/wishlist");

app.use("/products", productsRoutes);
app.use("/compare-list", compareListRoutes);
app.use("/wishlist", wishlistRoutes);

// MONGODB
mongoose
  .connect(process.env.PRODUCT_MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.log("MongoDB connected"))
  .catch((err) => logger.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.log(`Server running on port ${PORT}`));
