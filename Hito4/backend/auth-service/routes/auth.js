const express = require("express");
const router = express.Router(); // ✅ THIS WAS MISSING
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

// Helper: sanitize user
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || null,
});

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ME =================
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE PROFILE =================
router.put("/update", auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select("-password");

    res.json(sanitizeUser(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE AVATAR =================
router.put("/avatar", auth, async (req, res) => {
  try {
    const { avatar } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    ).select("-password");

    res.json(sanitizeUser(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= CHANGE PASSWORD =================
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= DELETE ACCOUNT =================
router.delete("/delete", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
