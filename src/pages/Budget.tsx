/*
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getToken } from "@/lib/api";
import { X } from "lucide-react"; // ❌ icon

const API_BUDGET = "http://localhost:5000/api/budgets";
const API_EXPENSE = "http://localhost:5000/api/expenses";

const categories = [
  { name: "Food", color: "from-[#9b5cff] to-[#e65cff]" },
  { name: "Rent", color: "from-[#0090ff] to-[#3cc4ff]" },
  { name: "Bills", color: "from-[#ff9800] to-[#ffc107]" },
  { name: "EMI", color: "from-[#ff5252] to-[#ff1744]" },
  { name: "Travel", color: "from-[#00c853] to-[#00e676]" },
  { name: "Miscellaneous", color: "from-[#d500f9] to-[#ff80ab]" },
];

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [newBudget, setNewBudget] = useState<{ [key: string]: string }>({});
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    category: "Food",
  });

  async function fetchBudgets() {
    const res = await fetch(API_BUDGET, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setBudgets(await res.json());
  }

  async function fetchExpenses() {
    const res = await fetch(API_EXPENSE, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setExpenses(await res.json());
  }

  async function handleAddBudget(e: React.FormEvent, category: string) {
    e.preventDefault();
    try {
      const res = await fetch(API_BUDGET, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          category,
          budgetAmount: Number(newBudget[category]),
          month: new Date().toISOString().slice(0, 7),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Budget updated");
      fetchBudgets();
    } catch {
      toast.error("Error updating budget");
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(API_EXPENSE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: newExpense.name,
          amount: Number(newExpense.amount),
          category: newExpense.category,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Expense added");
      setNewExpense({ name: "", amount: "", category: "Food" });
      fetchBudgets();
      fetchExpenses();
    } catch {
      toast.error("Error adding expense");
    }
  }

  async function handleDeleteExpense(id: string) {
    try {
      const res = await fetch(`${API_EXPENSE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Expense deleted");
      fetchBudgets();
      fetchExpenses();
    } catch {
      toast.error("Error deleting expense");
    }
  }

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, []);

  const getExpensesForCategory = (category: string) =>
    expenses.filter((e) => e.category === category);

  return (
    <div className="min-h-screen bg-[#0e0e11] p-8 text-white">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#9b5cff] to-[#e65cff] bg-clip-text text-transparent mb-10">
        Budget Planner
      </h1>

      {/* Add Expense Section *}
      <div className="bg-[#141418]/60 p-6 rounded-2xl border border-white/10 mb-16">
        <h2 className="text-xl font-bold mb-4 text-gray-200">Add New Expense</h2>
        <form onSubmit={handleAddExpense} className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Expense name"
            value={newExpense.name}
            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
            required
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10 flex-1 min-w-[180px]"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            required
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10 w-36"
          />
          <select
            value={newExpense.category}
            onChange={(e) =>
              setNewExpense({ ...newExpense, category: e.target.value })
            }
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10"
          >
            {categories.map((cat) => (
              <option key={cat.name}>{cat.name}</option>
            ))}
          </select>
          <Button
            type="submit"
            className="bg-gradient-to-r from-[#9b5cff] to-[#e65cff] text-white"
          >
            Add Expense
          </Button>
        </form>
      </div>

      {/* Category Budget Boxes *}
      <div className="grid md:grid-cols-2 gap-8">
        {categories.map(({ name, color }) => {
          const budget = budgets.find((b) => b.category === name);
          const spent = budget?.spentAmount || 0;
          const total = budget?.budgetAmount || 0;
          const percent = total ? Math.min((spent / total) * 100, 100) : 0;

          const progressColor =
            percent < 80
              ? "bg-green-500"
              : percent < 100
              ? "bg-yellow-500"
              : "bg-red-500";

          return (
            <div
              key={name}
              className={`bg-[#141418]/60 border border-white/10 p-6 rounded-2xl shadow-[0_0_20px_rgba(155,92,255,0.1)]`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-lg font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
                >
                  {name}
                </h3>
                <form
                  onSubmit={(e) => handleAddBudget(e, name)}
                  className="flex gap-2 items-center"
                >
                  <input
                    type="number"
                    placeholder="₹"
                    className="w-24 p-2 rounded-lg bg-[#1a1a20] text-white border border-white/10"
                    value={newBudget[name] || ""}
                    onChange={(e) =>
                      setNewBudget({
                        ...newBudget,
                        [name]: e.target.value,
                      })
                    }
                  />
                  <Button
                    type="submit"
                    className={`bg-gradient-to-r ${color} text-white`}
                  >
                    Set
                  </Button>
                </form>
              </div>

              <div className="w-full bg-[#1a1a20] rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className={`h-full ${progressColor}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                ₹{spent} spent of ₹{total}
              </p>

              <div className="space-y-2">
                {getExpensesForCategory(name).map((exp) => (
                  <div
                    key={exp._id}
                    className="flex justify-between items-center text-sm bg-[#1a1a20] p-2 rounded-lg"
                  >
                    <span>{exp.name}</span>
                    <div className="flex items-center gap-2">
                      <span>₹{exp.amount}</span>
                      <button
                        onClick={() => handleDeleteExpense(exp._id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
*/

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getToken } from "@/lib/api";
import { X } from "lucide-react";

const API_BUDGET = "http://localhost:5000/api/budgets";
const API_EXPENSE = "http://localhost:5000/api/expenses";

const categories = [
  { name: "Food", color: "from-[#9b5cff] to-[#e65cff]" },
  { name: "Rent", color: "from-[#0090ff] to-[#3cc4ff]" },
  { name: "Bills", color: "from-[#ff9800] to-[#ffc107]" },
  { name: "EMI", color: "from-[#ff5252] to-[#ff1744]" },
  { name: "Travel", color: "from-[#00c853] to-[#00e676]" },
  { name: "Miscellaneous", color: "from-[#d500f9] to-[#ff80ab]" },
];

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [newBudget, setNewBudget] = useState<{ [key: string]: string }>({});
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    category: "Food",
  });

  async function fetchBudgets() {
    const res = await fetch(API_BUDGET, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setBudgets(await res.json());
  }

  async function fetchExpenses() {
    const res = await fetch(API_EXPENSE, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setExpenses(await res.json());
  }

  async function handleAddBudget(e: React.FormEvent, category: string) {
    e.preventDefault();
    try {
      const res = await fetch(API_BUDGET, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          category,
          budgetAmount: Number(newBudget[category]),
          month: new Date().toISOString().slice(0, 7),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Budget updated");
      fetchBudgets();
    } catch {
      toast.error("Error updating budget");
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(API_EXPENSE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: newExpense.name,
          amount: Number(newExpense.amount),
          category: newExpense.category,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Expense added");
      setNewExpense({ name: "", amount: "", category: "Food" });
      fetchBudgets();
      fetchExpenses();
    } catch {
      toast.error("Error adding expense");
    }
  }

  async function handleDeleteExpense(id: string) {
    try {
      const res = await fetch(`${API_EXPENSE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Expense deleted");
      fetchBudgets();
      fetchExpenses();
    } catch {
      toast.error("Error deleting expense");
    }
  }

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, []);

  const getExpensesForCategory = (category: string) =>
    expenses.filter((e) => e.category === category);

  // --- New Monthly Summary Calculations ---
  const totalBudget =  budgets
  .filter(b => b.budgetAmount > 0) // Only count non-zero budgets
    .reduce((sum, b) => sum + (b.budgetAmount || 0), 0 || 0); // Default to 1 if no budgets
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  const overallPercent = totalBudget
    ? Math.min((totalSpent / totalBudget) * 100, 100)
    : 0;

  let overallColor =
    overallPercent < 80
      ? "bg-green-500"
      : overallPercent < 100
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="min-h-screen bg-[#0e0e11] p-8 text-white">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#9b5cff] to-[#e65cff] bg-clip-text text-transparent mb-10">
        Budget Planner
      </h1>

      {/* === Monthly Overview Box === */}
      <div className="bg-[#141418]/70 border border-white/10 p-6 rounded-2xl mb-12 shadow-[0_0_25px_rgba(155,92,255,0.15)] hover:shadow-[0_0_35px_rgba(155,92,255,0.25)] transition-all duration-300">
        <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-[#9b5cff] to-[#e65cff] bg-clip-text text-transparent">
          Monthly Overview
        </h2>
        <div className="flex flex-wrap gap-8 items-center justify-between mb-4">
          <p className="text-lg">
            <span className="text-gray-400">Total Budget:</span>{" "}
            <span className="text-[#9b5cff] font-semibold">
              ₹{totalBudget.toLocaleString()}
            </span>
          </p>
          <p className="text-lg">
            <span className="text-gray-400">Total Spent:</span>{" "}
            <span className="text-[#e65cff] font-semibold">
              ₹{totalSpent.toLocaleString()}
            </span>
          </p>
        </div>
        <div className="w-full bg-[#1a1a20] rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${overallColor} transition-all duration-700`}
            style={{ width: `${overallPercent}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {overallPercent.toFixed(1)}% of total budget used this month
        </p>
      </div>

      {/* === Add Expense Section === */}
      <div className="bg-[#141418]/60 p-6 rounded-2xl border border-white/10 mb-16">
        <h2 className="text-xl font-bold mb-4 text-gray-200">Add New Expense</h2>
        <form onSubmit={handleAddExpense} className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Expense name"
            value={newExpense.name}
            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
            required
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10 flex-1 min-w-[180px]"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            required
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10 w-36"
          />
          <select
            value={newExpense.category}
            onChange={(e) =>
              setNewExpense({ ...newExpense, category: e.target.value })
            }
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10"
          >
            {categories.map((cat) => (
              <option key={cat.name}>{cat.name}</option>
            ))}
          </select>
          <Button
            type="submit"
            className="bg-gradient-to-r from-[#9b5cff] to-[#e65cff] text-white"
          >
            Add Expense
          </Button>
        </form>
      </div>

      {/* === Category Budget Boxes === */}
      <div className="grid md:grid-cols-2 gap-8">
        {categories.map(({ name, color }) => {
          const budget = budgets.find((b) => b.category === name);
          const spent = budget?.spentAmount || 0;
          const total = budget?.budgetAmount || 0;
          const percent = total ? Math.min((spent / total) * 100, 100) : 0;

          const progressColor =
            percent < 80
              ? "bg-green-500"
              : percent < 100
              ? "bg-yellow-500"
              : "bg-red-500";

          return (
            <div
              key={name}
              className="bg-[#141418]/60 border border-white/10 p-6 rounded-2xl shadow-[0_0_20px_rgba(155,92,255,0.1)]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-lg font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
                >
                  {name}
                </h3>
                <form
                  onSubmit={(e) => handleAddBudget(e, name)}
                  className="flex gap-2 items-center"
                >
                  <input
                    type="number"
                    placeholder="₹"
                    className="w-24 p-2 rounded-lg bg-[#1a1a20] text-white border border-white/10"
                    value={newBudget[name] || ""}
                    onChange={(e) =>
                      setNewBudget({
                        ...newBudget,
                        [name]: e.target.value,
                      })
                    }
                  />
                  <Button
                    type="submit"
                    className={`bg-gradient-to-r ${color} text-white`}
                  >
                    Set
                  </Button>
                </form>
              </div>

              <div className="w-full bg-[#1a1a20] rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className={`h-full ${progressColor}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                ₹{spent} spent of ₹{total}
              </p>

              <div className="space-y-2">
                {getExpensesForCategory(name).map((exp) => (
                  <div
                    key={exp._id}
                    className="flex justify-between items-center text-sm bg-[#1a1a20] p-2 rounded-lg"
                  >
                    <span>{exp.name}</span>
                    <div className="flex items-center gap-2">
                      <span>₹{exp.amount}</span>
                      <button
                        onClick={() => handleDeleteExpense(exp._id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
