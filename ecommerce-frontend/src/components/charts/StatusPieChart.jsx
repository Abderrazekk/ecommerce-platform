import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Cell,
} from "recharts";
import ChartCard from "../admin/ChartCard";
import { formatPrice } from "../../utils/formatPrice";

const StatusPieChart = ({
  data = [],
  title = "Orders by Status",
  height = 300,
}) => {
  const COLORS = {
    pending: "#F59E0B",
    confirmed: "#3B82F6",
    out_for_delivery: "#8B5CF6",
    delivered: "#10B981",
    cancelled: "#EF4444",
  };

  const STATUS_LABELS = {
    pending: "Pending",
    confirmed: "Confirmed",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const totalOrders = data.reduce((sum, item) => sum + (item.count || 0), 0);

  const chartData = data
    .map((item) => ({
      name: STATUS_LABELS[item.status] || item.status,
      value: item.count,
      revenue: item.revenue || 0,
      color: COLORS[item.status] || "#9CA3AF",
    }))
    .filter((item) => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
          <p className="font-bold text-gray-900 dark:text-white mb-2">
            {d.name}
          </p>
          <div className="space-y-1">
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Orders:</span> {d.value}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-medium">Share:</span>{" "}
              {((d.value / totalOrders) * 100).toFixed(1)}%
            </p>
            {d.revenue > 0 && (
              <p className="text-emerald-600 dark:text-emerald-400">
                <span className="font-medium">Revenue:</span>{" "}
                {formatPrice(d.revenue)}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <ChartCard
      title={title}
      description="Distribution of orders by current status"
      value={totalOrders}
    >
      <div className="h-full">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
          >
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient
                  key={`grad-${index}`}
                  id={`grad${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={entry.color} stopOpacity={0.9} />
                  <stop
                    offset="95%"
                    stopColor={entry.color}
                    stopOpacity={0.6}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#4b5563" }}
              angle={-20}
              textAnchor="end"
              height={70}
              axisLine={{ stroke: "#d1d5db" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#4b5563" }}
              axisLine={{ stroke: "#d1d5db" }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
            />
            <Legend content={<CustomLegend />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`url(#grad${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Status summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
          {chartData.map((status, idx) => (
            <div
              key={idx}
              className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div
                className="text-xl font-bold"
                style={{ color: status.color }}
              >
                {status.value}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {status.name}
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-500 mt-1">
                {((status.value / totalOrders) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};

export default StatusPieChart;
