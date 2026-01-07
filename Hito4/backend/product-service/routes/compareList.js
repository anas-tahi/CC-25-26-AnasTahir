const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Normalize products
function normalizeProducts(rawProducts) {
  if (!Array.isArray(rawProducts)) return [];

  if (typeof rawProducts[0] === "string") {
    return rawProducts.map(name => ({ name, quantity: 1 }));
  }

  return rawProducts
    .filter(p => p && typeof p.name === "string")
    .map(p => ({
      name: p.name,
      quantity: p.quantity > 0 ? p.quantity : 1
    }));
}

router.post("/", async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({ message: "Products required" });
    }

    const normalized = normalizeProducts(products);
    const names = normalized.map(p => p.name);

    const allItems = await Product.find({ name: { $in: names } });

    const totals = {};
    const missing = {};

    for (const { name, quantity } of normalized) {
      const items = allItems.filter(i => i.name === name);

      for (const item of items) {
        const market = item.supermarket;
        totals[market] = (totals[market] || 0) + item.price * quantity;
        missing[market] = missing[market] || 0;
      }

      for (const market of Object.keys(totals)) {
        if (!items.find(i => i.supermarket === market)) {
          missing[market]++;
        }
      }
    }

    const result = Object.keys(totals).map(market => ({
      supermarket: market,
      total: +totals[market].toFixed(2),
      missing: missing[market]
    }));

    result.sort((a, b) => a.total - b.total);

    res.json({
      items: normalized,
      supermarkets: result,
      best: result[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Compare list failed" });
  }
});

module.exports = router;
