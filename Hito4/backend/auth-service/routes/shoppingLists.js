const express = require("express");
const router = express.Router();
const ShoppingList = require("../models/ShoppingList");
const auth = require("../middleware/auth");

/* =======================
   GET USER LISTS
======================= */
router.get("/", auth, async (req, res) => {
  try {
    const lists = await ShoppingList.find({ user: req.user.id });
    res.json(lists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   CREATE LIST
======================= */
router.post("/", auth, async (req, res) => {
  try {
    const { name, items } = req.body;

    if (!name || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const list = await ShoppingList.create({
      user: req.user.id, // ✅ MATCHES YOUR JWT
      name,
      items,
    });

    res.status(201).json(list);
  } catch (err) {
    console.error("SAVE LIST ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   DELETE LIST
======================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const list = await ShoppingList.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    res.json({ message: "Deleted", list });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
