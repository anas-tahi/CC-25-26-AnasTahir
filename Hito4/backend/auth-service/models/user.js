const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, {
  timestamps: true // ⭐ optional but useful
});

// ⭐ Sanitize output (hide _id, __v, password)
userSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email
  };
};

module.exports = mongoose.model('User', userSchema);
