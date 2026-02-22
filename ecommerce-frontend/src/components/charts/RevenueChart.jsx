import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { formatPrice } from "../../utils/formatPrice";
import ChartCard from "../admin/ChartCard";

const RevenueChart = ({
  data = [],
  period,
  onPeriodChange,
  title = "Revenue Over Time",
  height = 300,
}) => {
  const formatDate = (date) => {
    try {
      const d = new Date(date);
      switch (period) {
        case "today":
          return d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        case "week":
          return d.toLocaleDateString([], { weekday: "short" });
        case "month":
          return `${d.getDate()}/${d.getMonth() + 1}`;
        case "year":
          return d.toLocaleDateString([], { month: "short" });
        default:
          return d.toLocaleDateString();
      }
    } catch {
      return date;
    }
  };

  const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const revenueChange =
    data.length > 1
      ? (
          ((data[data.length - 1]?.revenue - data[0]?.revenue) /
            data[0]?.revenue) *
          100
        ).toFixed(1)
      : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
          <p className="font-medium mb-2 text-gray-900 dark:text-white">
            {formatDate(label)}
          </p>
          <div className="space-y-1">
            <p className="text-emerald-600 dark:text-emerald-400">
              <span className="font-medium">Revenue:</span>{" "}
              {formatPrice(payload[0].value)}
            </p>
            {payload[0].payload.orders && (
              <p className="text-blue-600 dark:text-blue-400">
                <span className="font-medium">Orders:</span>{" "}
                {payload[0].payload.orders}
              </p>
            )}
            {payload[0].payload.avgOrderValue && (
              <p className="text-purple-600 dark:text-purple-400">
                <span className="font-medium">Avg Order:</span>{" "}
                {formatPrice(payload[0].payload.avgOrderValue)}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard
      title={title}
      description="Revenue and order trends over time"
      value={formatPrice(totalRevenue)}
      change={parseFloat(revenueChange)}
      period={period}
      onPeriodChange={onPeriodChange}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickFormatter={(value) => `$${value / 1000}k`}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.1}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="avgOrderValue"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default RevenueChart;
