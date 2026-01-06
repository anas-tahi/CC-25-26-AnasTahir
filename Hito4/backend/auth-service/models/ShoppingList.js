const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const shoppingListSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true }, // user-chosen name
    items: { type: [itemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// ⭐ Clean output
shoppingListSchema.methods.toJSON = function () {
  return {
    id: this._id,
    userId: this.userId,
    name: this.name,
    items: this.items,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("ShoppingList", shoppingListSchema);
