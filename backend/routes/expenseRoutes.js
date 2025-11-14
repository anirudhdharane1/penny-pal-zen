import express from "express";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

// Add a new expense
router.post("/", verifyToken, async (req, res) => {
  try {
    const { category, name, amount } = req.body;

    const expense = await Expense.create({
      userId: req.userId,
      category,
      name,
      amount,
    });

    // update spentAmount in budget
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOne({
      userId: req.userId,
      category,
      month: currentMonth,
    });

    if (budget) {
      budget.spentAmount += Number(amount);
      await budget.save();
    }

    res.json({ message: "Expense added", expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses by user
router.get("/", verifyToken, async (req, res) => {
  const expenses = await Expense.find({ userId: req.userId });
  res.json(expenses);
});

// Delete an expense
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) return res.status(404).json({ error: "Expense not found" });

    // Reduce spentAmount in Budget
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOne({
      userId: req.userId,
      category: expense.category,
      month: currentMonth,
    });

    if (budget) {
      budget.spentAmount = Math.max(0, budget.spentAmount - expense.amount);
      await budget.save();
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
