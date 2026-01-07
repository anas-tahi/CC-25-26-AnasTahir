const mongoose = require("mongoose");

const ShoppingListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  items: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model("ShoppingList", ShoppingListSchema);
