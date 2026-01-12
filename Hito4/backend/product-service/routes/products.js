const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

/* ============================
   HELPERS
============================ */
const normalize = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const sanitizeProduct = (p) => ({
  id: p._id,
  name: p.name,
  supermarket: p.supermarket,
  price: p.price,
});

/* ============================
   AUTOCOMPLETE SEARCH
   GET /products?search=le
============================ */
router.get("/", async (req, res) => {
  try {
    const search = req.query.search;
    if (!search) return res.json({ products: [] });

    const products = await Product.find({
      name: { $regex: search, $options: "i" },
    }).limit(10);

    // remove duplicate names
    const uniqueProducts = [];
    const seen = new Set();
    products.forEach((p) => {
      const key = normalize(p.name);
      if (!seen.has(key)) {
        uniqueProducts.push(p);
        seen.add(key);
      }
    });

    res.json({ products: uniqueProducts.map(sanitizeProduct) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   RECOMMENDED PRODUCTS
   GET /products/recommended
============================ */
router.get("/recommended", async (req, res) => {
  try {
    const products = await Product.find({});

    // group by normalized name
    const grouped = {};
    products.forEach((p) => {
      const key = normalize(p.name);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });

    // return top 6 products with all supermarkets
    const result = Object.values(grouped)
      .slice(0, 6)
      .map((items) => ({
        product: items[0].name,
        supermarkets: items.map((p) => ({
          supermarket: p.supermarket,
          price: p.price,
        })),
        cheapest: items.reduce(
          (min, p) => (p.price < min.price ? p : min),
          items[0]
        ),
      }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   AUTOCOMPLETE BY FIRST LETTER
   GET /products/names/:letter
============================ */
router.get("/names/:letter", async (req, res) => {
  try {
    const letter = req.params.letter.toLowerCase();
    const products = await Product.find({
      name: { $regex: `^${letter}`, $options: "i" },
    }).limit(20);

    // remove duplicates
    const uniqueProducts = [];
    const seen = new Set();
    products.forEach((p) => {
      const key = normalize(p.name);
      if (!seen.has(key)) {
        uniqueProducts.push(p);
        seen.add(key);
      }
    });

    res.status(200).json(uniqueProducts.map(sanitizeProduct));
  } catch (err) {
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
    const grouped = {};

    products.forEach((p) => {
      const key = normalize(p.name);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });

    const result = Object.values(grouped).map((items) => {
      const cheapest = items.reduce(
        (min, p) => (p.price < min.price ? p : min),
        items[0]
      );

      return {
        product: items[0].name,
        supermarkets: items.map((p) => ({
          supermarket: p.supermarket,
          price: p.price,
        })),
        cheapest: {
          supermarket: cheapest.supermarket,
          price: cheapest.price,
        },
      };
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   SINGLE PRODUCT COMPARISON
   GET /products/compare/:name
============================ */
router.get("/compare/:name", async (req, res) => {
  try {
    const query = normalize(req.params.name);
    const products = await Product.find({});

    const matches = products.filter((p) => normalize(p.name) === query);

    if (matches.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    const cheapest = matches.reduce(
      (min, p) => (p.price < min.price ? p : min),
      matches[0]
    );

    res.status(200).json({
      product: matches[0].name,
      supermarkets: matches.map(sanitizeProduct),
      cheapest: {
        supermarket: cheapest.supermarket,
        price: cheapest.price,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   GET PRODUCTS BY NAME
   GET /products/:name
============================ */
router.get("/:name", async (req, res) => {
  try {
    const query = normalize(req.params.name);
    const products = await Product.find({});

    const matches = products.filter((p) => normalize(p.name) === query);

    if (matches.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(matches.map(sanitizeProduct));
  } catch (err) {
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
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
