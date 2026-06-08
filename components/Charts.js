"use client";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

// Register the Chart.js pieces we use once for the whole app.
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

// A pleasant, calm palette (indigo / emerald / amber / rose ...).
const PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#14b8a6",
];

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "#64748b" } },
  },
};

function EmptyState({ label }) {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-slate-400">
      {label || "No data to display yet."}
    </div>
  );
}

// Pie chart of expenses grouped by category.
export function CategoryPie({ data }) {
  const labels = Object.keys(data || {});
  if (labels.length === 0) return <EmptyState label="No expenses yet." />;

  const values = labels.map((k) => data[k]);
  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.6)",
      },
    ],
  };

  return (
    <div className="h-[280px]">
      <Pie data={chartData} options={baseOptions} />
    </div>
  );
}

// Bar chart comparing income vs expense per label (e.g. months).
export function IncomeExpenseBar({ labels, income, expense }) {
  if (!labels || labels.length === 0) return <EmptyState />;

  const chartData = {
    labels,
    datasets: [
      {
        label: "Income",
        data: income,
        backgroundColor: "#10b981",
        borderRadius: 6,
      },
      {
        label: "Expense",
        data: expense,
        backgroundColor: "#ef4444",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    ...baseOptions,
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.15)" } },
    },
  };

  return (
    <div className="h-[280px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Line chart of the running balance over time.
export function BalanceLine({ labels, values }) {
  if (!labels || labels.length === 0) return <EmptyState />;

  const chartData = {
    labels,
    datasets: [
      {
        label: "Balance",
        data: values,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.15)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    ...baseOptions,
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.15)" } },
    },
  };

  return (
    <div className="h-[280px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
