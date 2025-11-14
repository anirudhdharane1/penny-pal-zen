import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getToken } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_INCOME = "http://localhost:5000/api/incomes";

const sources = [
  { name: "Salary", color: "#3cc4ff", gradient: "from-[#0090ff] to-[#3cc4ff]" },
  { name: "Side Hustle", color: "#ffc107", gradient: "from-[#ff9800] to-[#ffc107]" },
  { name: "Business", color: "#fff176", gradient: "from-[#fbc02d] to-[#fff176]" },
  { name: "Rental Yield", color: "#4db6ac", gradient: "from-[#26a69a] to-[#4db6ac]" },
  { name: "Investments", color: "#00e676", gradient: "from-[#00c853] to-[#00e676]" },
];

// Generate consistent dummy data (fixed per source)
function generateFixedData(source: string, currentMonth: string) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 1; i--) {
    const d = new Date(now);
    d.setMonth(now.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }

  const dataMap: any = {
    Salary: [80000, 80000, 80000, 80000, 80000],
    "Side Hustle": [10000, 12000, 15000, 18000, 20000],
    Business: [40000, 42000, 45000, 47000, 48000],
    "Rental Yield": [12000, 12000, 12500, 13000, 13000],
    Investments: [5000, 7000, 7500, 8000, 8500],
  };

  const base = dataMap[source] || [10000, 12000, 13000, 15000, 16000];

  return months.map((m, i) => ({
    month: m,
    value: base[i],
  }));
}

export default function IncomePage() {
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [newIncome, setNewIncome] = useState<{ [key: string]: string }>({});
  const currentMonth = new Date().toISOString().slice(0, 7);

  async function fetchIncomes() {
    const res = await fetch(API_INCOME, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();

    // Fill with fixed dummy data if no record
    const enriched = sources.map((src) => {
      const found = data.find((d: any) => d.source === src.name);
      const dummy = generateFixedData(src.name, currentMonth);
      if (!found) {
        return { source: src.name, records: dummy };
      }
      // Merge dummy past with actual current month data
      const currentRec = found.records.find((r: any) => r.month === currentMonth);
      if (currentRec) dummy.push({ month: currentMonth, value: currentRec.amount });
      return { source: src.name, records: dummy };
    });
    setIncomeData(enriched);
  }

  async function handleAddIncome(e: React.FormEvent, source: string) {
    e.preventDefault();
    try {
      const res = await fetch(API_INCOME, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          source,
          amount: Number(newIncome[source]),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${source} updated`);
      fetchIncomes();
    } catch {
      toast.error("Error updating income");
    }
  }

  useEffect(() => {
    fetchIncomes();
  }, []);

  // ---- TOTAL INCOME CALCULATIONS ----
  const allMonths = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(now.getMonth() - i);
    allMonths.push(d.toISOString().slice(0, 7));
  }

  const monthlyTotals = allMonths.map((m) => {
    const total = incomeData.reduce((acc, src) => {
      const rec = src.records.find((r: any) => r.month === m);
      return acc + (rec ? rec.value : 0);
    }, 0);
    return { month: m, total };
  });

  const totalIncome =
    monthlyTotals.find((m) => m.month === currentMonth)?.total || 0;
  const lastMonthTotal =
    monthlyTotals.find(
      (m) => m.month === allMonths[allMonths.length - 2]
    )?.total || 0;

  const changePercent =
    lastMonthTotal === 0
      ? 100
      : ((totalIncome - lastMonthTotal) / lastMonthTotal) * 100;

  const chartData = incomeData.map((src) => {
    const current = src.records.find((r: any) => r.month === currentMonth);
    return { name: src.source, value: current ? current.value : 0 };
  });

  // ---------------------- UI ----------------------

  return (
    <div className="min-h-screen bg-[#0e0e11] text-white p-8">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#9b5cff] to-[#e65cff] bg-clip-text text-transparent mb-10">
        Income Overview
      </h1>

      {/* === TOP SECTION: TOTAL INCOME SUMMARY === */}
      <div className="bg-[#141418]/60 border border-white/10 rounded-3xl shadow-[0_0_30px_rgba(155,92,255,0.15)] p-8 flex flex-col md:flex-row items-center justify-around mb-12">
        {/* Column 1 — 5-Month Total Summary */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-xl text-gray-300 mb-3 font-semibold">
            Last 5 Months Total Income
          </h2>
          <div className="space-y-1 text-gray-300 text-sm">
            {monthlyTotals.slice(0, 5).map((m, i) => (
              <div
                key={i}
                className="flex justify-between w-40 border-b border-white/10 pb-1"
              >
                <span>{m.month}</span>
                <span className="font-semibold text-[#9b5cff]">
                  ₹{m.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 — Pie Chart */}
        <div className="w-[300px] h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                dataKey="value"
                stroke="none"
                paddingAngle={4}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={sources[index % sources.length].color}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const color = sources.find(
                      (s) => s.name === payload[0].name
                    )?.color;
                    return (
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          backgroundColor: "#000",
                          color: color || "#fff",
                        }}
                      >
                        <p className="text-sm font-semibold">
                          {payload[0].name}
                        </p>
                        <p className="text-lg font-bold">
                          ₹{payload[0].value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Column 3 — Total Income Info */}
        <div className="text-center md:text-left">
          <h2 className="text-xl text-gray-300 mb-1">Total Income</h2>
          <p className="text-5xl font-extrabold text-[#3cc4ff] mb-2">
            ₹{totalIncome.toLocaleString()}
          </p>
          <p
            className={`text-sm ${
              changePercent >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {changePercent >= 0 ? "+" : ""}
            {changePercent.toFixed(2)}% from last month
          </p>
        </div>
      </div>

      {/* === BOTTOM SECTION: INCOME CARDS === */}
      <div className="grid md:grid-cols-2 gap-8">
        {sources.map(({ name, color, gradient }) => {
          const srcData = incomeData.find((s) => s.source === name);
          const records = srcData ? srcData.records.slice(-6) : [];
          const currentVal =
            srcData?.records.find((r) => r.month === currentMonth)?.value || 0;
          const gradientId = `grad_${name.replace(/\s/g, "_")}`;

          return (
            <div
              key={name}
              className="bg-[#141418]/70 border border-white/10 rounded-2xl p-6 shadow-[0_0_25px_rgba(155,92,255,0.15)] hover:shadow-[0_0_35px_rgba(155,92,255,0.25)] transition-all duration-300"
            >
              <h3
                className={`text-lg font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}
              >
                {name}
              </h3>
              <p className="text-2xl font-bold mb-4">₹{currentVal}</p>

              {/* Line Graph with Gradient Area */}
              <div className="h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={records}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Area
                      type="linear"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2}
                      fill={`url(#${gradientId})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <form
                onSubmit={(e) => handleAddIncome(e, name)}
                className="flex gap-2 items-center"
              >
                <input
                  type="number"
                  placeholder="₹"
                  className="w-28 p-2 rounded-lg bg-[#1a1a20] text-white border border-white/10"
                  value={newIncome[name] || ""}
                  onChange={(e) =>
                    setNewIncome({
                      ...newIncome,
                      [name]: e.target.value,
                    })
                  }
                />
                <Button
                  type="submit"
                  className={`bg-gradient-to-r ${gradient} text-white`}
                >
                  Set
                </Button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
