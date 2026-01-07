const express = require("express");
const router = express.Router();
const ShoppingList = require("../models/ShoppingList");

// GET all shopping lists
router.get("/", async (req, res) => {
  try {
    const lists = await ShoppingList.find();
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET a single shopping list by ID
router.get("/:id", async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ error: "Shopping list not found" });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new shopping list
router.post("/", async (req, res) => {
  try {
    const { name, items } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const newList = new ShoppingList({ name, items });
    await newList.save();

    res.status(201).json(newList);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update a shopping list by ID
router.put("/:id", async (req, res) => {
  try {
    const { name, items } = req.body;
    const updatedList = await ShoppingList.findByIdAndUpdate(
      req.params.id,
      { name, items },
      { new: true, runValidators: true }
    );

    if (!updatedList) return res.status(404).json({ error: "Shopping list not found" });
    res.json(updatedList);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE a shopping list by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ShoppingList.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Shopping list not found" });

    res.json({ message: "Deleted successfully", deleted });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
