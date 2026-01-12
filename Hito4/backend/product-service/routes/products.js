const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

/* ============================
   SAFE SANITIZER (NO toJSON)
============================ */
const sanitizeProduct = (p) => ({
  id: p._id?.toString() || p.id,
  name: p.name,
  supermarket: p.supermarket,
  price: p.price,
});

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
      products: products.map(sanitizeProduct),
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   RECOMMENDED PRODUCTS
============================ */
router.get("/recommended", async (req, res) => {
  try {
    const products = await Product.find({}).limit(50);
    res.status(200).json(products.map(sanitizeProduct));
  } catch (err) {
    console.error("Recommended error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   AUTOCOMPLETE PREFIX SEARCH
   GET /products/names/:prefix
============================ */
router.get("/names/:prefix", async (req, res) => {
  try {
    const prefix = req.params.prefix.toLowerCase();

    const products = await Product.find({
      name: { $regex: `^${prefix}`, $options: "i" },
    });

    const uniqueNames = [...new Set(products.map((p) => p.name))];
    res.status(200).json(uniqueNames.map((name) => ({ name })));
  } catch (err) {
    console.error("Prefix search error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   COMPARE ALL PRODUCTS
   GET /products/compare-all
============================ */
router.get("/compare-all", async (req, res) => {
  try {
    const products = await Product.find({});

    const cheapestMap = {};

    products.forEach((p) => {
      const key = p.name.toLowerCase();
      if (!cheapestMap[key] || p.price < cheapestMap[key].price) {
        cheapestMap[key] = p;
      }
    });

    res.status(200).json(
      Object.values(cheapestMap).map(sanitizeProduct)
    );
  } catch (err) {
    console.error("Compare all error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   SINGLE PRODUCT COMPARISON
   GET /products/compare/:name
============================ */
router.get("/compare/:name", async (req, res) => {
  try {
    const rawName = req.params.name.toLowerCase();

    const products = await Product.find({
      name: new RegExp(`^${rawName}$`, "i"),
    });

    if (!products.length) {
      return res.status(404).json({ message: "No matching products found." });
    }

    let cheapest = products[0];
    products.forEach((p) => {
      if (p.price < cheapest.price) cheapest = p;
    });

    res.status(200).json({
      product: rawName,
      supermarkets: products.map(sanitizeProduct),
      cheapest: sanitizeProduct(cheapest),
    });
  } catch (err) {
    console.error("Compare error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   GET ALL PRODUCTS
============================ */
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products.map(sanitizeProduct));
  } catch (err) {
    console.error("Get all products error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
