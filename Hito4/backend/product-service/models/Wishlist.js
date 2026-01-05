const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
});

// ⭐ Sanitize output
wishlistSchema.methods.toJSON = function () {
  return {
    id: this._id,
    productId: this.productId,
  };
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
