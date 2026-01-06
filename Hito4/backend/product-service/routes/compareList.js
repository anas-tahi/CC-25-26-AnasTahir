const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.post("/compare-list", async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Product list is required" });
    }

    const supermarketTotals = {};
    const supermarketMissing = {};

    for (const name of products) {
      const items = await Product.find({ name });

      if (!items || items.length === 0) continue;

      const availableMarkets = items.map(i => i.supermarket);

      for (const item of items) {
        const market = item.supermarket;
        if (!supermarketTotals[market]) {
          supermarketTotals[market] = 0;
          supermarketMissing[market] = 0;
        }
        supermarketTotals[market] += item.price;
      }

      for (const market of Object.keys(supermarketTotals)) {
        if (!availableMarkets.includes(market)) {
          supermarketMissing[market]++;
        }
      }
    }

    const result = Object.keys(supermarketTotals).map(market => ({
      supermarket: market,
      total: parseFloat(supermarketTotals[market].toFixed(2)),
      missing: supermarketMissing[market]
    }));

    result.sort((a, b) => a.total - b.total);

    res.json({
      products,
      supermarkets: result,
      best: result[0]
    });

  } catch (err) {
    console.error("Compare list error:", err);
    res.status(500).json({ message: "Server error comparing list" });
  }
});

module.exports = router;
