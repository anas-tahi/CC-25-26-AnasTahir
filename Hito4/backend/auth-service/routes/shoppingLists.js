const express = require("express");
const router = express.Router();
const ShoppingList = require("../models/ShoppingList");
const auth = require("../middleware/auth");

// GET /shopping-lists
router.get("/", auth, async (req, res) => {
  try {
    const lists = await ShoppingList.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(
      lists.map((list) => ({
        id: list._id,
        name: list.name,
        items: list.items,
        createdAt: list.createdAt,
      }))
    );
  } catch (err) {
    console.error("Get shopping lists error:", err);
    res.status(500).json({ message: "Server error fetching shopping lists" });
  }
});

// GET /shopping-lists/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const list = await ShoppingList.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!list) {
      return res.status(404).json({ message: "Shopping list not found" });
    }

    res.json({
      id: list._id,
      name: list.name,
      items: list.items,
      createdAt: list.createdAt,
    });
  } catch (err) {
    console.error("Get shopping list error:", err);
    res.status(500).json({ message: "Server error fetching shopping list" });
  }
});

// POST /shopping-lists
router.post("/", auth, async (req, res) => {
  try {
    const { name, items } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "List name is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Items array is required and cannot be empty" });
    }

    const normalizedItems = items.map((item) => ({
      name: item.name,
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
    }));

    const list = new ShoppingList({
      userId: req.user.id,
      name,
      items: normalizedItems,
    });

    await list.save();

    res.status(201).json({
      id: list._id,
      name: list.name,
      items: list.items,
      createdAt: list.createdAt,
    });
  } catch (err) {
    console.error("Create shopping list error:", err);
    res.status(500).json({ message: "Server error creating shopping list" });
  }
});

// PUT /shopping-lists/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, items } = req.body;

    const list = await ShoppingList.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!list) {
      return res.status(404).json({ message: "Shopping list not found" });
    }

    if (name && typeof name === "string") {
      list.name = name;
    }

    if (Array.isArray(items)) {
      list.items = items.map((item) => ({
        name: item.name,
        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      }));
    }

    await list.save();

    res.json({
      id: list._id,
      name: list.name,
      items: list.items,
      createdAt: list.createdAt,
    });
  } catch (err) {
    console.error("Update shopping list error:", err);
    res.status(500).json({ message: "Server error updating shopping list" });
  }
});

// DELETE /shopping-lists/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const list = await ShoppingList.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!list) {
      return res.status(404).json({ message: "Shopping list not found" });
    }

    res.json({ message: "Shopping list deleted" });
  } catch (err) {
    console.error("Delete shopping list error:", err);
    res.status(500).json({ message: "Server error deleting shopping list" });
  }
});

module.exports = router;
