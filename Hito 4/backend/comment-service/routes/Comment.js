const router = require("express").Router();
const Comment = require("../models/Comment");

// GET /comments - list all comments (new)
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find({}).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /comments
router.post("/", async (req, res) => {
  try {
    // accept either 'message' or 'text' from frontend
    const { name, message, text } = req.body;
    const finalMessage = message || text;

    if (!name || !finalMessage) {
      return res.status(400).json({ message: "Name and message are required" });
    }

    const newComment = new Comment({ name, message: finalMessage });
    await newComment.save();

    res.json({ message: "Comment saved successfully.", comment: newComment });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
