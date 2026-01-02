const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  supermarket: { type: String, required: true },
  price: { type: Number, required: true },
});

// ⭐ Sanitize output (hide _id, __v)
productSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    supermarket: this.supermarket,
    price: this.price
  };
};

module.exports = mongoose.model("Product", productSchema);
