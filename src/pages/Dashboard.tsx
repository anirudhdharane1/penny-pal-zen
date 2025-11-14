import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, ChartPie, TrendingDown, Wallet, Target, DollarSign, Edit2, Check, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getToken } from "@/lib/api";
import { toast } from "sonner";

const API_INCOME_TOTAL = "http://localhost:5000/api/incomes/total";
const API_EXPENSE_TOTAL = "http://localhost:5000/api/budgets/total-spent";
const API_INCOME_ALL = "http://localhost:5000/api/incomes";
const API_BUDGET_ALL = "http://localhost:5000/api/budgets";
const API_USER = "http://localhost:5000/api/users/me";
const API_UPDATE_USER = "http://localhost:5000/api/users/update";
const API_GOALS = "http://localhost:5000/api/goals";

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [totalMonthlyGoalContribution, setTotalMonthlyGoalContribution] = useState(0);

  // Color mapping to match Income page
  const getIncomeColor = (source: string) => {
    const colorMap: any = {
      Salary: "#3cc4ff",
      "Side Hustle": "#ffc107",
      Business: "#fff176",
      "Rental Yield": "#4db6ac",
      Investments: "#00e676",
    };
    return colorMap[source] || "#8884d8";
  };

  // Color mapping to match Budget page
  const getCategoryColor = (category: string) => {
    const colorMap: any = {
      Food: "#9b5cff",
      Rent: "#3cc4ff",
      Bills: "#ffc107",
      EMI: "#ff5252",
      Travel: "#00e676",
      Miscellaneous: "#ff80ab",
    };
    return colorMap[category] || "#FF6B6B";
  };

  // Get first name only
  const getFirstName = (fullName: string) => {
    return fullName?.split(" ")[0] || "User";
  };

  const fetchUserData = async () => {
    try {
      const token = getToken();
      const userRes = await fetch(API_USER, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setProfile(userData);
      setNewGoalAmount(userData.monthlySavingGoal?.toString() || "0");
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleUpdateGoal = async () => {
    try {
      const token = getToken();
      const res = await fetch(API_UPDATE_USER, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          monthlySavingGoal: Number(newGoalAmount),
        }),
      });

      if (!res.ok) throw new Error();

      const updatedUser = await res.json();
      setProfile(updatedUser);
      setIsEditingGoal(false);
      toast.success("Monthly savings goal updated!");
    } catch {
      toast.error("Failed to update savings goal");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const currentMonth = new Date().toISOString().slice(0, 7);

        // Fetch user profile, financial data, and goals
        const [userRes, incomeRes, expenseRes, allIncomeRes, allBudgetRes, goalsRes] = await Promise.all([
          fetch(API_USER, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_INCOME_TOTAL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_EXPENSE_TOTAL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_INCOME_ALL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_BUDGET_ALL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_GOALS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const userData = await userRes.json();
        const incomeData = await incomeRes.json();
        const expenseData = await expenseRes.json();
        const incomeList = await allIncomeRes.json();
        const budgetList = await allBudgetRes.json();
        const goalsData = await goalsRes.json();

        setProfile(userData);
        setNewGoalAmount(userData.monthlySavingGoal?.toString() || "0");
        setTotalIncome(incomeData.totalIncome || 0);
        setTotalExpenses(expenseData.totalExpenses || 0);

        // Calculate total monthly goal contributions from all saving goals
        const savingGoals = goalsData.savingGoals || [];
        const totalMonthlyContribution = savingGoals.reduce((sum: number, goal: any) => {
          const monthlyContribution = goal.targetAmount / goal.timelineMonths;
          return sum + monthlyContribution;
        }, 0);
        setTotalMonthlyGoalContribution(totalMonthlyContribution);

        // Transform income data for bar chart
        const incomeChartData = incomeList
          .map((inc: any) => {
            const currentRecord = inc.records?.find((r: any) => r.month === currentMonth);
            const amount = currentRecord?.amount || 0;
            return {
              source: inc.source,
              amount: amount,
              color: getIncomeColor(inc.source),
            };
          })
          .filter((inc: any) => inc.amount > 0);

        setIncomes(incomeChartData);

        // Transform budget data for pie chart
        const expenseChartData = budgetList
          .filter((b: any) => b.spentAmount > 0 && b.month === currentMonth)
          .map((b: any) => ({
            category: b.category,
            amount: b.spentAmount,
            color: getCategoryColor(b.category),
          }));

        setExpenses(expenseChartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const netSavings = totalIncome - totalExpenses;
  const savingsPercentage = totalMonthlyGoalContribution > 0 
    ? ((netSavings / totalMonthlyGoalContribution) * 100).toFixed(1) 
    : 0;

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, gradient }: any) => (
    <Card className={`p-6 bg-gradient-to-br ${gradient} border-0 text-white`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <h3 className="text-3xl font-bold">₹{value.toLocaleString()}</h3>
        </div>
        <div className="p-3 bg-white/20 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-2">
          {trend === "up" ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm">{trendValue}</span>
        </div>
      )}
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {getFirstName(profile?.name)}!
          </h1>
          <p className="text-muted-foreground">
            Here's your financial overview for this month
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Income"
            value={totalIncome}
            icon={DollarSign}
            gradient="from-income to-income/80"
          />
          <StatCard
            title="Total Expenses"
            value={totalExpenses}
            icon={ChartPie}
            gradient="from-warning to-warning/80"
          />
          <StatCard
            title="Net Savings"
            value={netSavings}
            icon={Wallet}
            trend={netSavings >= totalMonthlyGoalContribution ? "down" : "up"}
            trendValue={`${savingsPercentage}% of goal`}
            gradient="from-success to-success/80"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Expense Distribution</h3>
            {expenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [
                      `₹${value.toLocaleString()}`,
                      props.payload.category
                    ]}
                    contentStyle={{
                      backgroundColor: "#2a2a2e",
                      border: "1px solid #3a3a3e",
                      borderRadius: "8px",
                      color: "#9b5cff",
                    }}
                    labelStyle={{ color: "#9b5cff" }}
                    itemStyle={{ color: "#9b5cff" }}
                  />
                  <Legend 
                    formatter={(value: any, entry: any) => entry.payload.category}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expense data available
              </div>
            )}
          </Card>

          {/* Income Sources */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Income Sources</h3>
            {incomes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="source" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value: any) => `₹${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: "#2a2a2e",
                      border: "1px solid #3a3a3e",
                      borderRadius: "8px",
                      color: "#9b5cff",
                    }}
                    labelStyle={{ color: "#9b5cff" }}
                    itemStyle={{ color: "#9b5cff" }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {incomes.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No income data available
              </div>
            )}
          </Card>
        </div>

        {/* Savings Goal Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Monthly Savings Goals</h3>
              <p className="text-muted-foreground text-sm">
                Total monthly target from all saving goals: ₹{totalMonthlyGoalContribution.toLocaleString()}
              </p>
            </div>
            <Target className="w-8 h-8 text-success" />
          </div>
          <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-success to-success/80 transition-all duration-500"
              style={{
                width: `${Math.min(
                  ((netSavings / (totalMonthlyGoalContribution || 1)) * 100),
                  100
                )}%`,
              }}
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-lg font-semibold text-success">
              ₹{netSavings.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              {" "}
              / ₹{totalMonthlyGoalContribution.toLocaleString()}
            </span>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

