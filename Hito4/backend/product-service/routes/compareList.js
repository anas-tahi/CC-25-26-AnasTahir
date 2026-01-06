const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Helper to normalize products input
// Accepts:
// - ["Milk", "Eggs"]
// - [{ name: "Milk", quantity: 2 }, { name: "Eggs", quantity: 12 }]
function normalizeProducts(rawProducts) {
  if (!Array.isArray(rawProducts)) return [];

  // Case 1: array of strings
  if (typeof rawProducts[0] === "string") {
    return rawProducts.map((name) => ({
      name,
      quantity: 1,
    }));
  }

  // Case 2: array of objects
  return rawProducts
    .filter((p) => p && typeof p.name === "string")
    .map((p) => ({
      name: p.name,
      quantity: p.quantity && p.quantity > 0 ? p.quantity : 1,
    }));
}

// POST /compare-list
router.post("/", async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Product list is required" });
    }

    // Normalize input → always: [{ name, quantity }]
    const normalized = normalizeProducts(products);
    if (normalized.length === 0) {
      return res.status(400).json({ message: "Product names are required" });
    }

    const productNames = normalized.map((p) => p.name);

    // Fetch all product documents for these names
    const allItems = await Product.find({ name: { $in: productNames } });

    const supermarketTotals = {};
    const supermarketMissing = {};

    // For each requested product
    for (const { name, quantity } of normalized) {
      const items = allItems.filter((i) => i.name === name);

      if (items.length === 0) {
        // if no supermarket has it, we skip totals but still count missing later
        continue;
      }

      const availableMarkets = items.map((i) => i.supermarket);

      // Add cost per supermarket, multiplied by quantity
      for (const item of items) {
        const market = item.supermarket;

        if (!supermarketTotals[market]) {
          supermarketTotals[market] = 0;
          supermarketMissing[market] = 0;
        }

        supermarketTotals[market] += item.price * quantity;
      }

      // For any supermarket that exists in totals but doesn't have this product → mark as missing
      for (const market of Object.keys(supermarketTotals)) {
        if (!availableMarkets.includes(market)) {
          supermarketMissing[market] = (supermarketMissing[market] || 0) + 1;
        }
      }
    }

    const result = Object.keys(supermarketTotals).map((market) => ({
      supermarket: market,
      total: parseFloat(supermarketTotals[market].toFixed(2)),
      missing: supermarketMissing[market] || 0,
    }));

    result.sort((a, b) => a.total - b.total);

    // Backwards compatible + richer response
    res.json({
      // original: array of names (for old frontend)
      products: productNames,

      // new: includes quantities (for new frontend)
      items: normalized,

      supermarkets: result,
      best: result[0] || null,
    });
  } catch (err) {
    console.error("Compare list error:", err);
    res.status(500).json({ message: "Server error comparing list" });
  }
});

module.exports = router;
