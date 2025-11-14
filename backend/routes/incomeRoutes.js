import express from "express";
import jwt from "jsonwebtoken";
import Income from "../models/Income.js";

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

// Get all income records
router.get("/", verifyToken, async (req, res) => {
  const income = await Income.find({ userId: req.userId });
  res.json(income);
});

// Get total income for current month
router.get("/total", verifyToken, async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const incomes = await Income.find({ userId: req.userId });

    // Sum up all records for current month across all sources
    const total = incomes.reduce((acc, income) => {
      const currentRecord = income.records?.find((r) => r.month === currentMonth);
      return acc + (currentRecord?.amount || 0);
    }, 0);

    res.json({ totalIncome: total });
  } catch (err) {
    res.status(500).json({ message: "Error fetching total income" });
  }
});

// Add/update current month income for a source
router.post("/", verifyToken, async (req, res) => {
  const { source, amount } = req.body;
  const currentMonth = new Date().toISOString().slice(0, 7);

  let income = await Income.findOne({ userId: req.userId, source });

  if (!income) {
    income = new Income({
      userId: req.userId,
      source,
      records: [{ month: currentMonth, amount }],
    });
  } else {
    const existingRecord = income.records.find((r) => r.month === currentMonth);
    if (existingRecord) {
      existingRecord.amount = amount;
    } else {
      income.records.push({ month: currentMonth, amount });
    }
  }

  await income.save();
  res.json(income);
});

export default router;
