const router = require("express").Router();
const Comment = require("../models/Comment");

// POST /comments
router.post("/", async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ message: "Name and message are required" });
    }

    const newComment = new Comment({ name, message });
    await newComment.save();

    res.json({ message: "Comment saved successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
