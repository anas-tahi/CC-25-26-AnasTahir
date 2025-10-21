const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");


// Add a product (optional, maybe admin only)
router.post("/", async (req, res) => {
  try {
    const { name, supermarket, price } = req.body;
    const product = new Product({ name, supermarket, price });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compare single product (protected)
router.get("/compare/:name", auth, async (req, res) => {
  try {
    const name = req.params.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const products = await Product.find({});
    const filtered = products.filter(p =>
      p.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === name.toLowerCase()
    );

    if (filtered.length === 0) return res.status(404).json({ message: "Product not found" });

    let cheapest = filtered.reduce((min, p) => (p.price < min.price ? p : min), filtered[0]);

    res.json({
      product: name,
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

// Compare all products (protected)
router.get("/compare-all", auth, async (req, res) => {
  try {
    const products = await Product.find({});
    const productNames = [...new Set(products.map(p => p.name))];

    const result = productNames.map(name => {
      const filtered = products.filter(p =>
        p.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ===
        name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      );
      let cheapest = filtered.reduce((min, p) => (p.price < min.price ? p : min), filtered[0]);
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

// Get single product by name (protected)
router.get("/:name", auth, async (req, res) => {
  try {
    const name = req.params.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const products = await Product.find({});
    const filtered = products.filter(p =>
      p.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === name.toLowerCase()
    );
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
