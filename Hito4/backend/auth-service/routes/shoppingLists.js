const express = require("express");
const router = express.Router();
const ShoppingList = require("../models/ShoppingList");
const auth = require("../middleware/auth");

// GET logged-in user's lists
router.get("/", auth, async (req, res) => {
  try {
    const lists = await ShoppingList.find({ user: req.user.id });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST new list
router.post("/", auth, async (req, res) => {
  try {
    const { name, items } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const newList = new ShoppingList({
      user: req.user.id,
      name,
      items,
    });

    await newList.save();
    res.status(201).json(newList);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE list
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await ShoppingList.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted)
      return res.status(404).json({ error: "Shopping list not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
