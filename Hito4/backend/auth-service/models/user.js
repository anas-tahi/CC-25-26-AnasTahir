const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ NEW
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
  };
};

module.exports = mongoose.model("User", userSchema);
