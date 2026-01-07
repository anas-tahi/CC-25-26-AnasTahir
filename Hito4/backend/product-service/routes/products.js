const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Sanitize helper
const sanitizeProduct = (p) => p.toJSON();

/* ============================
   AUTOCOMPLETE SEARCH (legacy)
   GET /products?search=milk
============================ */
router.get("/", async (req, res) => {
  try {
    const search = req.query.search;

    if (!search) {
      return res.json({ products: [] });
    }

    const products = await Product.find({
      name: { $regex: search, $options: "i" },
    }).limit(10);

    res.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        supermarket: p.supermarket,
        price: p.price,
      })),
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   RECOMMENDED PRODUCTS
   GET /products/recommended
============================ */
router.get("/recommended", async (req, res) => {
  try {
    const products = await Product.find({}).limit(50);
    res.json(products.map(sanitizeProduct));
  } catch (err) {
    console.error("Recommended error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   UNIQUE NAMES (prefix search)
   GET /products/names/:prefix
   Used by autocomplete in ShoppingList
============================ */
router.get("/names/:prefix", async (req, res) => {
  try {
    const prefix = req.params.prefix.toLowerCase();

    const products = await Product.find({
      name: { $regex: `^${prefix}`, $options: "i" },
    });

    const uniqueNames = [...new Set(products.map((p) => p.name))];

    // IMPORTANT: frontend expects [{ name }]
    res.json(uniqueNames.map((name) => ({ name })));
  } catch (err) {
    console.error("Prefix search error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   SINGLE PRODUCT COMPARISON
   GET /products/compare/:name
============================ */
router.get("/compare/:name", async (req, res) => {
  try {
    const rawName = req.params.name;

    const normalizedQuery = rawName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const products = await Product.find({});

    const filtered = products.filter((p) => {
      const normalizedName = p.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return normalizedName.includes(normalizedQuery);
    });

    if (filtered.length === 0) {
      return res.status(404).json({ message: "No matching products found." });
    }

    const cheapest = filtered.reduce(
      (min, p) => (p.price < min.price ? p : min),
      filtered[0]
    );

    res.json({
      product: rawName,
      supermarkets: filtered.map(sanitizeProduct),
      cheapest: {
        supermarket: cheapest.supermarket,
        price: cheapest.price,
      },
    });
  } catch (err) {
    console.error("Compare error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   GET ALL PRODUCTS
   GET /products/all
============================ */
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products.map(sanitizeProduct));
  } catch (err) {
    console.error("Get all products error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================
============================ */

router.get("/names/:prefix", async (req, res) => {
  try {
    const prefix = req.params.prefix.toLowerCase();

    // Find products starting with the prefix
    const products = await Product.find({
      name: { $regex: `^${prefix}`, $options: "i" }
    });

    // Remove duplicates
    const uniqueNames = [...new Set(products.map(p => p.name))];

    // Return format expected by frontend
    res.json(uniqueNames.map(name => ({ name })));
  } catch (err) {
    console.error("Autocomplete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
