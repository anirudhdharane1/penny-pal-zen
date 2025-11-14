import express from "express";
import jwt from "jsonwebtoken";
import Budget from "../models/Budget.js";

const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

// Create or update a budget
router.post("/", verifyToken, async (req, res) => {
  const { category, budgetAmount, month } = req.body;
  const cleanAmount = Number(budgetAmount) || 0;

  const budget = await Budget.findOneAndUpdate(
    { userId: req.userId, category, month },
    { budgetAmount: cleanAmount },
    { new: true, upsert: true }
  );

  res.json(budget);
});

// Get all budgets for current user
router.get("/", verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total spent for current month
router.get("/total-spent", verifyToken, async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const budgets = await Budget.find({ userId: req.userId, month: currentMonth });
    const totalSpent = budgets.reduce((acc, b) => acc + (b.spentAmount || 0), 0);
    res.json({ totalExpenses: totalSpent });
  } catch (err) {
    res.status(500).json({ message: "Error fetching total expenses" });
  }
});

// Delete a budget
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

