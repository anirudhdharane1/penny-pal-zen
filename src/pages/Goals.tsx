import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getToken } from "@/lib/api";
import { Loader2, X } from "lucide-react";

const API_GOALS = "http://localhost:5000/api/goals";

export default function GoalsPage() {
  const [goals, setGoals] = useState<{ savingGoals: any[]; incomeGoals: any[] }>({
    savingGoals: [],
    incomeGoals: [],
  });
  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
    targetAmount: "",
    timelineMonths: "",
    type: "saving",
    priority: "1", // Changed to string
  });
  const [loading, setLoading] = useState(true);

  async function fetchGoals() {
    try {
      const res = await fetch(API_GOALS, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setGoals(data);
      setLoading(false);
    } catch {
      toast.error("Failed to load goals");
    }
  }

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(API_GOALS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: newGoal.name,
          description: newGoal.description,
          targetAmount: Number(newGoal.targetAmount),
          timelineMonths: Number(newGoal.timelineMonths),
          type: newGoal.type,
          priority: Number(newGoal.priority),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Goal added successfully");
      setNewGoal({
        name: "",
        description: "",
        targetAmount: "",
        timelineMonths: "",
        type: "saving",
        priority: "1", // Changed to string
      });
      fetchGoals();
    } catch {
      toast.error("Error adding goal");
    }
  }

  async function handleDeleteGoal(id: string) {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      const res = await fetch(`${API_GOALS}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Goal deleted successfully");
      fetchGoals();
    } catch {
      toast.error("Failed to delete goal");
    }
  }

  useEffect(() => {
    fetchGoals();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e0e11]">
        <Loader2 className="animate-spin text-[#9b5cff]" size={32} />
      </div>
    );

  const renderProgressBar = (goal: any) => {
    const percent = Math.min((goal.currentSaved / goal.targetAmount) * 100, 100);
    const isCompleted = goal.currentSaved >= goal.targetAmount;

    return (
      <div className="relative w-full bg-[#1a1a20] rounded-full h-3 mt-2 overflow-hidden">
        <div
          className={`h-full ${
            isCompleted
              ? "bg-green-500"
              : "bg-gradient-to-r from-[#9b5cff] to-[#e65cff]"
          } transition-all duration-700`}
          style={{ width: `${percent}%` }}
        ></div>
        {isCompleted && (
          <span className="absolute -top-6 right-0 text-green-400 text-xs font-semibold">
            ✅ Goal Achieved
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0e0e11] text-white p-8">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#9b5cff] to-[#e65cff] bg-clip-text text-transparent mb-10">
        Goals
      </h1>

      {/* Add Goal Form */}
      <div className="bg-[#141418]/60 border border-white/10 rounded-3xl shadow-[0_0_30px_rgba(155,92,255,0.15)] p-6 mb-10">
        <h2 className="text-xl font-bold mb-4 text-gray-200">Add New Goal</h2>
        <form
          onSubmit={handleAddGoal}
          className="grid md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <input
            type="text"
            placeholder="Goal name"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newGoal.description}
            onChange={(e) =>
              setNewGoal({ ...newGoal, description: e.target.value })
            }
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10"
          />
          <input
            type="number"
            placeholder="Target ₹"
            value={newGoal.targetAmount}
            onChange={(e) =>
              setNewGoal({ ...newGoal, targetAmount: e.target.value })
            }
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10"
            required
          />
          <input
            type="number"
            placeholder="Months"
            value={newGoal.timelineMonths}
            onChange={(e) =>
              setNewGoal({ ...newGoal, timelineMonths: e.target.value })
            }
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10"
            required
          />
          <select
            value={newGoal.type}
            onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10"
          >
            <option value="saving">Saving</option>
            <option value="income">Income</option>
          </select>
          <input
            type="number"
            placeholder="Priority"
            value={newGoal.priority}
            onChange={(e) =>
              setNewGoal({ ...newGoal, priority: e.target.value })
            }
            className="p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10"
            min="1"
          />
            <div className="col-span-full flex justify-center mt-4">
            <Button
                type="submit"
                className="bg-gradient-to-r from-[#9b5cff] to-[#e65cff] text-white px-8 py-2 rounded-xl shadow-[0_0_20px_rgba(155,92,255,0.3)] hover:shadow-[0_0_25px_rgba(155,92,255,0.5)] transition-all duration-300"
            >
                Add Goal
            </Button>
            </div>
        </form>
      </div>

      {/* Goals Display */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Saving Goals */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#9b5cff]">Saving Goals</h2>
          {goals.savingGoals.map((goal) => {
            const monthly = goal.targetAmount / goal.timelineMonths;
            return (
              <div
                key={goal._id}
                className="bg-[#141418]/70 border border-white/10 rounded-2xl p-6 mb-6 shadow-[0_0_25px_rgba(155,92,255,0.15)] hover:shadow-[0_0_35px_rgba(155,92,255,0.25)] transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-[#9b5cff] to-[#e65cff] text-white shadow-[0_0_8px_rgba(155,92,255,0.5)]">
                    #{goal.priority}
                </span>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-[#9b5cff] to-[#e65cff] bg-clip-text text-transparent">
                    {goal.name}
                </h3>
                </div>

                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  {goal.description || "No description"}
                </p>
                {renderProgressBar(goal)}
                <div className="mt-3 text-sm text-gray-300">
                  <p>Target: ₹{goal.targetAmount.toLocaleString()}</p>
                  <p>Saved: ₹{goal.currentSaved.toLocaleString()}</p>
                  <p>Monthly: ₹{monthly.toFixed(0)}</p>
                  <p>Timeline: {goal.timelineMonths} months</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Income Goals */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#00e676]">Income Goals</h2>
          {goals.incomeGoals.map((goal) => (
            <div
              key={goal._id}
              className="bg-[#141418]/70 border border-white/10 rounded-2xl p-6 mb-6 shadow-[0_0_25px_rgba(155,92,255,0.15)] hover:shadow-[0_0_35px_rgba(155,92,255,0.25)] transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-[#00e676] to-[#00b248] text-white shadow-[0_0_8px_rgba(0,230,118,0.4)]">
                    #{goal.priority}
                </span>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-[#00e676] to-[#00b248] bg-clip-text text-transparent">
                    {goal.name}
                </h3>
                </div>
                <button
                  onClick={() => handleDeleteGoal(goal._id)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                {goal.description || "No description"}
              </p>
              <div className="mt-3 text-sm text-gray-300">
                <p>Target: ₹{goal.targetAmount.toLocaleString()}</p>
                <p>Timeline: {goal.timelineMonths} months</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
