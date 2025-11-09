import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Wallet, Target, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Fetch expenses (mock data for now)
      const mockExpenses = [
        { category: "Food", amount: 5000, color: "#FF6B6B" },
        { category: "Shopping", amount: 3000, color: "#4ECDC4" },
        { category: "Rent", amount: 10000, color: "#45B7D1" },
        { category: "Travel", amount: 2000, color: "#FFA07A" },
        { category: "Bills", amount: 1500, color: "#98D8C8" },
      ];
      setExpenses(mockExpenses);

      // Fetch incomes (mock data for now)
      const mockIncomes = [
        { source: "Salary", amount: 50000, color: "#6366F1" },
        { source: "Side Hustle", amount: 8000, color: "#8B5CF6" },
        { source: "Investments", amount: 2000, color: "#EC4899" },
      ];
      setIncomes(mockIncomes);
    };

    fetchData();
  }, []);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsPercentage = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

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
          <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.name || "User"}!</h1>
          <p className="text-muted-foreground">Here's your financial overview for this month</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Income"
            value={totalIncome}
            icon={DollarSign}
            trend="up"
            trendValue="+12% from last month"
            gradient="from-income to-income/80"
          />
          <StatCard
            title="Total Expenses"
            value={totalExpenses}
            icon={TrendingDown}
            trend="down"
            trendValue="-5% from last month"
            gradient="from-warning to-warning/80"
          />
          <StatCard
            title="Net Savings"
            value={netSavings}
            icon={Wallet}
            trend={netSavings >= (profile?.monthly_saving_goal || 0) ? "up" : "down"}
            trendValue={`${savingsPercentage}% of income`}
            gradient="from-success to-success/80"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Expense Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {expenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Income Sources */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Income Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomes}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="source" 
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="amount" fill="hsl(var(--income))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Savings Goal Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Monthly Savings Goal</h3>
              <p className="text-muted-foreground">Target: ₹{profile?.monthly_saving_goal?.toLocaleString() || 0}</p>
            </div>
            <Target className="w-8 h-8 text-success" />
          </div>
          <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-success to-success/80 transition-all duration-500"
              style={{
                width: `${Math.min(
                  ((netSavings / (profile?.monthly_saving_goal || 1)) * 100),
                  100
                )}%`,
              }}
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-lg font-semibold text-success">
              ₹{netSavings.toLocaleString()}
            </span>
            <span className="text-muted-foreground"> / ₹{profile?.monthly_saving_goal?.toLocaleString() || 0}</span>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
