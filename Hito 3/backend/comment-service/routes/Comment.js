const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// ✅ POST /comments
router.post("/", async (req, res) => {
  try {
    const { name, message } = req.body;
    const comment = new Comment({ name, message });
    await comment.save();
    res.status(201).json({ message: "Comment saved successfully." });
  } catch (err) {
    console.error("❌ Failed to save comment:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
