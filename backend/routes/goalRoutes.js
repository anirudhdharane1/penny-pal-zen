import express from "express";
import jwt from "jsonwebtoken";
import Goal from "../models/Goal.js";
import Income from "../models/income.js";
import Budget from "../models/Budget.js";

const router = express.Router();

// JWT middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

// POST - Add new goal (auto rank adjustment)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description, targetAmount, timelineMonths, type, priority } =
      req.body;

    // Push other goals down if same or higher rank exists
    await Goal.updateMany(
      { userId: req.userId, type, priority: { $gte: priority } },
      { $inc: { priority: 1 } }
    );

    const goal = await Goal.create({
      userId: req.userId,
      name,
      description,
      targetAmount,
      timelineMonths,
      type,
      priority,
      currentSaved: 0,
      allocatedMonths: [], // Initialize empty array
    });

    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Fetch goals & auto allocate savings (ONLY ONCE PER MONTH)
router.get("/", verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // "2025-11"

    console.log("\n=== ALLOCATION STARTED FOR", currentMonth, "===");

    // Get total income
    const incomes = await Income.find({ userId: req.userId });
    const totalIncome = incomes.reduce((sum, src) => {
      const record = src.records.find((r) => r.month === currentMonth);
      return sum + (record ? record.amount : 0);
    }, 0);

    // Get total expenses
    const budgets = await Budget.find({ userId: req.userId, month: currentMonth });
    const totalExpenses = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
    let availableSavings = totalIncome - totalExpenses;

    console.log("Total Income:", totalIncome);
    console.log("Total Expenses:", totalExpenses);
    console.log("Available Savings:", availableSavings);

    const allGoals = await Goal.find({ userId: req.userId }).sort({
      priority: 1, // Sort by priority ascending (1, 2, 3...) - lower number = higher priority
    });

    // Allocation logic: Only allocate if current month hasn't been allocated yet
    const savingGoals = allGoals.filter((g) => g.type === "saving");
    
    console.log("\nGoals sorted by priority:");
    savingGoals.forEach(g => {
      console.log(`- ${g.name}: Priority ${g.priority}, Monthly: ₹${(g.targetAmount / g.timelineMonths).toFixed(0)}, Already allocated: ${g.allocatedMonths?.includes(currentMonth) ? 'YES' : 'NO'}`);
    });

    console.log("\n--- Starting Allocation ---");
    
    for (const goal of savingGoals) {
      // Check if this month has already been allocated
      if (goal.allocatedMonths && goal.allocatedMonths.includes(currentMonth)) {
        console.log(`⏭️  SKIP: ${goal.name} - Already allocated for ${currentMonth}`);
        continue; // Skip this goal - already allocated for this month
      }

      // Calculate how much this goal needs this month
      const monthlyContribution = goal.targetAmount / goal.timelineMonths;
      const remainingToGoal = goal.targetAmount - goal.currentSaved;
      
      console.log(`\n📊 Processing: ${goal.name}`);
      console.log(`   Priority: ${goal.priority}`);
      console.log(`   Monthly Contribution: ₹${monthlyContribution.toFixed(0)}`);
      console.log(`   Remaining to Goal: ₹${remainingToGoal.toFixed(0)}`);
      console.log(`   Available Savings: ₹${availableSavings.toFixed(0)}`);

      // Don't allocate if goal is already achieved
      if (remainingToGoal <= 0) {
        console.log(`   ✅ Goal already achieved, skipping`);
        continue;
      }

      // Determine how much to allocate this month
      let allocationAmount = 0;
      
      if (availableSavings >= monthlyContribution) {
        // Full monthly contribution available
        allocationAmount = Math.min(monthlyContribution, remainingToGoal);
        console.log(`   💰 Full allocation: ₹${allocationAmount.toFixed(0)}`);
      } else if (availableSavings > 0) {
        // Partial allocation - give what's left
        allocationAmount = Math.min(availableSavings, remainingToGoal);
        console.log(`   ⚠️  Partial allocation (not enough funds): ₹${allocationAmount.toFixed(0)}`);
      } else {
        console.log(`   ❌ No funds available, skipping`);
      }

      if (allocationAmount > 0) {
        goal.currentSaved += allocationAmount;
        availableSavings -= allocationAmount;
        
        // Mark this month as allocated
        if (!goal.allocatedMonths) {
          goal.allocatedMonths = [];
        }
        goal.allocatedMonths.push(currentMonth);
        
        await goal.save();
        console.log(`   ✅ Allocated ₹${allocationAmount.toFixed(0)} to ${goal.name}`);
        console.log(`   📈 New total saved: ₹${goal.currentSaved.toFixed(0)} / ₹${goal.targetAmount}`);
        console.log(`   💵 Remaining savings: ₹${availableSavings.toFixed(0)}`);
      }
    }

    const incomeGoals = allGoals.filter((g) => g.type === "income");

    console.log("\n=== ALLOCATION COMPLETED ===");
    console.log("Leftover Savings:", availableSavings);
    console.log("============================\n");

    res.json({ 
      savingGoals, 
      incomeGoals, 
      totalIncome, 
      totalExpenses, 
      leftover: availableSavings 
    });
  } catch (err) {
    console.error("Error in goal allocation:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Remove a goal & shift priorities
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findOneAndDelete({ _id: id, userId: req.userId });
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    // Shift remaining priorities down
    await Goal.updateMany(
      {
        userId: req.userId,
        type: goal.type,
        priority: { $gt: goal.priority },
      },
      { $inc: { priority: -1 } }
    );

    res.json({ success: true, message: "Goal deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
