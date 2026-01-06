const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const sanitizeProduct = (p) => p.toJSON();

// Add to wishlist
router.post('/', authMiddleware, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user?.id;

  if (!productId || !userId) {
    return res.status(400).json({ message: 'Missing productId or userId' });
  }

  try {
    const exists = await Wishlist.findOne({ userId, productId });
    if (exists) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    const item = new Wishlist({ userId, productId });
    await item.save();
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

// Remove from wishlist
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

// Get user's wishlist
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const items = await Wishlist.find({ userId }).populate('productId');

    const products = items
      .filter(entry => entry.productId)
      .map((entry) => sanitizeProduct(entry.productId));

    res.json(products);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

module.exports = router;
