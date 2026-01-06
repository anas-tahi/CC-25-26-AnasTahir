const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Sanitize helper
const sanitizeProduct = (p) => p.toJSON();

/* ============================
   AUTOCOMPLETE SEARCH
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
        name: p.name,
        supermarket: p.supermarket,
        price: p.price,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   UNIQUE NAMES (prefix search)
   GET /products/names/:prefix
============================ */
router.get("/names/:prefix", async (req, res) => {
  try {
    const prefix = req.params.prefix.toLowerCase();

    const products = await Product.find({
      name: { $regex: `^${prefix}`, $options: "i" },
    });

    const uniqueNames = [...new Set(products.map((p) => p.name))];

    res.json(uniqueNames.map((name) => ({ name })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   GET ALL PRODUCTS
============================ */
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products.map(sanitizeProduct));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   GET PRODUCT BY EXACT NAME
============================ */
router.get("/:name", async (req, res) => {
  try {
    const nameParam = req.params.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const products = await Product.find({});
    const filtered = products.filter(
      (p) =>
        p.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase() === nameParam
    );

    if (filtered.length === 0)
      return res.status(404).json({ message: "No products found" });

    res.json(filtered.map(sanitizeProduct));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
