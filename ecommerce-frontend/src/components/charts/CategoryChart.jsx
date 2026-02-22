import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";
import ChartCard from "../admin/ChartCard";

const CategoryChart = ({
  data = [],
  title = "Sales by Category",
  height = 300,
}) => {
  const [chartType, setChartType] = useState("bar");

  const chartData = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .map((item) => ({
      ...item,
      percentage: (
        (item.revenue / data.reduce((sum, i) => sum + i.revenue, 0)) *
        100
      ).toFixed(1),
    }));

  const totalRevenue = chartData.reduce(
    (sum, item) => sum + (item.revenue || 0),
    0,
  );
  const totalQuantity = chartData.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#64748b",
  ];

  const getColor = (index) => COLORS[index % COLORS.length];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const category = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
          <p className="font-medium mb-2 text-gray-900 dark:text-white">
            {category.category || category._id}
          </p>
          <div className="space-y-1">
            <p className="text-emerald-600 dark:text-emerald-400">
              <span className="font-medium">Revenue:</span>{" "}
              {category.revenue.toLocaleString("fr-TN")} TND
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              <span className="font-medium">Quantity:</span> {category.quantity}
            </p>
            <p className="text-purple-600 dark:text-purple-400">
              <span className="font-medium">Share:</span> {category.percentage}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard
      title={title}
      description="Revenue distribution across product categories"
      value={`${chartData.length} categories`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                chartType === "bar"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                chartType === "pie"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Pie
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={height}>
          {chartType === "bar" ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="category"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(v) =>
                  v.length > 10 ? v.substring(0, 10) + "..." : v
                }
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(v) => `${v.toLocaleString("fr-TN")} TND`}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(index)} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="revenue"
                nameKey="category"
                label={(entry) => `${entry.category}: ${entry.percentage}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(index)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl">
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              {totalRevenue.toLocaleString("fr-TN")} TND
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              Total Category Revenue
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl">
            <div className="text-lg font-semibold text-green-700 dark:text-green-400">
              {totalQuantity}
            </div>
            <div className="text-xs text-green-600 dark:text-green-300">
              Total Units Sold
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

export default CategoryChart;
