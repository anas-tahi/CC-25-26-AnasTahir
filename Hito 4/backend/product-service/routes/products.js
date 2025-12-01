const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// ✅ Get all products (for recommendations)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ NEW: Recommendations route (frontend expects this)
router.get("/recommendations", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all unique product names (for autocomplete)
router.get("/names", async (req, res) => {
  try {
    const products = await Product.find({});
    const uniqueNames = [...new Set(products.map(p => p.name))];
    res.json(uniqueNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Compare all products
router.get("/compare-all", async (req, res) => {
  try {
    const products = await Product.find({});
    const grouped = {};

    products.forEach(p => {
      const normalizedName = p.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      if (!grouped[normalizedName]) grouped[normalizedName] = [];
      grouped[normalizedName].push(p);
    });

    const result = Object.keys(grouped).map(name => {
      const items = grouped[name];
      const cheapest = items.reduce((min, p) => (p.price < min.price ? p : min), items[0]);
      return {
        product: name,
        cheapest: {
          supermarket: cheapest.supermarket,
          price: cheapest.price
        }
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Compare single product
router.get("/compare/:name", auth, async (req, res) => {
  try {
    const rawName = req.params.name;
    const normalizedQuery = rawName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const products = await Product.find({});
    const filtered = products.filter(p => {
      const normalizedName = p.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return normalizedName.includes(normalizedQuery);
    });

    if (filtered.length === 0) {
      return res.status(404).json({ message: "No matching products found." });
    }

    const cheapest = filtered.reduce((min, p) => (p.price < min.price ? p : min), filtered[0]);

    res.json({
      product: rawName,
      supermarkets: filtered,
      cheapest: {
        supermarket: cheapest.supermarket,
        price: cheapest.price
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get product names by prefix
router.get("/names/:prefix", async (req, res) => {
  try {
    const prefix = req.params.prefix.toLowerCase();
    const products = await Product.find({
      name: { $regex: `^${prefix}`, $options: "i" }
    });
    const uniqueNames = [...new Set(products.map(p => p.name))];
    res.json(uniqueNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// (moved above to avoid route shadowing)

// ✅ Get products by exact name
router.get("/:name", async (req, res) => {
  try {
    const nameParam = req.params.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const products = await Product.find({});
    const filtered = products.filter(
      p =>
        p.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase() === nameParam
    );

    if (filtered.length === 0)
      return res.status(404).json({ message: "No products found" });

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
