import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import User from "../models/User.js"; // ✅ Add this import

const router = express.Router(); // ✅ Must be declared BEFORE any router.get/put/post

// ✅ Register and Login
router.post("/register", register);
router.post("/login", login);

// ✅ Get logged-in user's details
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// ✅ Update user details
router.put("/update", verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating user profile" });
  }
});

export default router;
