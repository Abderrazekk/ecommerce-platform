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
import AnalyticsChart from "../admin/AnalyticsChart";
import { formatPrice } from "../../utils/formatPrice";

const StatusPieChart = ({ data = [], title = "Orders by Status" }) => {
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
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border-2 border-gray-100 rounded-2xl shadow-xl">
          <p className="font-bold text-gray-900 mb-3 text-base tracking-tight">
            {data.name}
          </p>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-500 text-sm font-medium">Orders:</span>
              <span className="font-bold text-gray-900 text-lg">
                {data.value}
              </span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-500 text-sm font-medium">Share:</span>
              <span className="font-bold text-lg" style={{ color: data.color }}>
                {((data.value / totalOrders) * 100).toFixed(1)}%
              </span>
            </div>
            {data.revenue > 0 && (
              <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 gap-6">
                <span className="text-gray-500 text-sm font-medium">
                  Revenue:
                </span>
                <span className="font-bold text-emerald-600 text-base">
                  {formatPrice(data.revenue)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AnalyticsChart
      title={title}
      description="Elegant distribution of orders by current status"
      value={totalOrders}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-[400px] bg-gradient-to-br from-gray-50 to-white rounded-xl p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient
                    key={`gradient-${index}`}
                    id={`colorGradient${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={entry.color}
                      stopOpacity={0.9}
                    />
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
                tick={{ fontSize: 13, fontWeight: 500, fill: "#4b5563" }}
                angle={-20}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                tick={{ fontSize: 13, fontWeight: 500, fill: "#4b5563" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              />
              <Legend content={<CustomLegend />} />
              <Bar
                dataKey="value"
                name="Orders"
                radius={[12, 12, 0, 0]}
                barSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#colorGradient${index})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8 pt-6 border-t-2 border-gray-100">
          {chartData.map((status, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div
                className="text-3xl font-extrabold mb-2 tracking-tight"
                style={{ color: status.color }}
              >
                {status.value}
              </div>
              <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                {status.name}
              </div>
              <div className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600">
                {((status.value / totalOrders) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnalyticsChart>
  );
};

export default StatusPieChart;
