const mongoose = require("mongoose");

const ShoppingItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  supermarket: { type: String, required: true },
  price: { type: Number, required: true },
});

const ShoppingListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    items: {
      type: [ShoppingItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShoppingList", ShoppingListSchema);
