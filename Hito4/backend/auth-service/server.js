const express = require("express");     
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require('./logger');  
const shoppingListsRoutes = require("./routes/shoppingLists");


dotenv.config();

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
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
app.use("/shopping-lists", shoppingListsRoutes);


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info("✅ Connected to MongoDB"))
  .catch((err) => logger.error(`❌ MongoDB connection error: ${err.message}`));

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`🚀 Auth service running on port ${PORT}`);
});
