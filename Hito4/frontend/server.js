const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, "build")));

// SPA fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Render will inject PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
