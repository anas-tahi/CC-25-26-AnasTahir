const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    message: { type: String, required: true }
  },
  { timestamps: true } // ⭐ Automatically adds createdAt + updatedAt
);

// ⭐ Index for fast "find last comment by name"
commentSchema.index({ name: 1, createdAt: -1 });

// ⭐ Clean JSON output
commentSchema.methods.toJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    message: this.message,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model("Comment", commentSchema);
