const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ⭐ Sanitize output
commentSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    message: this.message,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model("Comment", commentSchema);
