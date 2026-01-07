const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

/* ============================
   ✅ GLOBAL CORS (MUST BE FIRST)
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

app.use(express.json());

/* ============================
   Routes
============================ */
app.use("/auth", require("./routes/auth"));
app.use("/shopping-lists", require("./routes/shoppingLists"));

/* ============================
   Mongo
============================ */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(console.error);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth service on ${PORT}`));
