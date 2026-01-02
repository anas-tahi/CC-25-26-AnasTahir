const router = require("express").Router();
const Comment = require("../models/Comment");

// GET /comments - list all comments
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find({}).sort({ createdAt: -1 });
    res.json(comments.map(c => c.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /comments - limit 1 comment per 5 minutes per name
router.post("/", async (req, res) => {
  try {
    const { name, message, text } = req.body;
    const finalMessage = message || text;

    if (!name || !finalMessage) {
      return res.status(400).json({ message: "Name and message are required" });
    }

    // ⭐ Check last comment by this user
    const lastComment = await Comment.findOne({ name }).sort({ createdAt: -1 });

    if (lastComment) {
      const now = Date.now();
      const last = new Date(lastComment.createdAt).getTime();
      const diffMinutes = (now - last) / (1000 * 60);

      if (diffMinutes < 5) {
        const remaining = Math.ceil(5 - diffMinutes);
        return res.status(429).json({
          message: `Please wait ${remaining} more minute(s) before commenting again.`
        });
      }
    }

    // ⭐ Save new comment
    const newComment = new Comment({ name, message: finalMessage });
    await newComment.save();

    res.json({
      message: "Comment saved successfully.",
      comment: newComment.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
