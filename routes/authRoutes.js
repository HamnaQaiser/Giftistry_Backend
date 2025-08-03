import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
const router = express.Router();
import { protect, adminOnly } from "../middleware/authMiddleware.js";
console.log("✅ authRoutes loaded");
router.get("/test", (req, res) => {
  res.send("Auth route is working");
});
// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});


// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    console.log("📩 Login route triggered");
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("❌ Error in /login route:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ /api/auth/me - Get current user
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});
router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ message: "You are an admin!" });
});


export default router;
