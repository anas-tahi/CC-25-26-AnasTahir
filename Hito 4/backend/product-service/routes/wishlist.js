const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// Helper to sanitize product (relies on Product.toJSON)
const sanitizeProduct = (p) => p.toJSON();

// ✅ Add to wishlist
router.post('/', authMiddleware, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user?.id;

  console.log('➡️ POST /wishlist hit');
  console.log('🧾 productId:', productId);
  console.log('👤 userId:', userId);

  if (!productId || !userId) {
    console.log('❌ Missing productId or userId');
    return res.status(400).json({ message: 'Missing productId or userId' });
  }

  try {
    const exists = await Wishlist.findOne({ userId, productId });
    if (exists) {
      console.log('⚠️ Already in wishlist');
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    const item = new Wishlist({ userId, productId });
    await item.save();
    console.log('✅ Wishlist item saved');
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    console.error('❌ Error adding to wishlist:', err);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

// ✅ Remove from wishlist
router.delete('/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    await Wishlist.deleteOne({ userId, productId });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

// ✅ Get user's wishlist
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const items = await Wishlist.find({ userId }).populate('productId');

    // ⭐ sanitize each populated product
    const products = items
      .filter(entry => entry.productId) // just in case
      .map((entry) => sanitizeProduct(entry.productId));

    res.json(products);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

module.exports = router;
