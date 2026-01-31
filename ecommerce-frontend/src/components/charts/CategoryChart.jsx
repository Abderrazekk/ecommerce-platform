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
import AnalyticsChart from "../admin/AnalyticsChart";
import { useState } from "react";

const CategoryChart = ({ data = [], title = "Sales by Category" }) => {
  const [chartType, setChartType] = useState("bar");

  // Prepare data
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const category = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">
            {category.category || category._id}
          </p>
          <div className="space-y-1">
            <p className="text-green-600">
              <span className="font-medium">Revenue:</span>{" "}
              {category.revenue.toLocaleString("fr-TN")} TND
            </p>
            <p className="text-blue-600">
              <span className="font-medium">Quantity:</span> {category.quantity}
            </p>
            <p className="text-purple-600">
              <span className="font-medium">Orders:</span>{" "}
              {category.orderCount || "N/A"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Share:</span>{" "}
              {category.percentage ||
                ((category.revenue / totalRevenue) * 100).toFixed(1)}
              %
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced color palette
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
    "#14b8a6",
    "#f43f5e",
    "#a855f7",
    "#22c55e",
    "#eab308",
  ];

  const getColor = (index) => COLORS[index % COLORS.length];

  return (
    <AnalyticsChart
      title={title}
      description="Revenue distribution across product categories"
      value={chartData.length}
    >
      <div className="h-full flex flex-col">
        <div className="flex justify-end mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === "bar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === "pie"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pie Chart
            </button>
          </div>
        </div>

        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="category"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) =>
                    value.length > 10 ? value.substring(0, 10) + "..." : value
                  }
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) =>
                    `${value.toLocaleString("fr-TN")} TND`
                  }
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
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-700">
              {totalRevenue.toLocaleString("fr-TN")} TND
            </div>
            <div className="text-xs text-blue-600">Total Category Revenue</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-700">
              {totalQuantity}
            </div>
            <div className="text-xs text-green-600">Total Units Sold</div>
          </div>
        </div>
      </div>
    </AnalyticsChart>
  );
};

export default CategoryChart;
