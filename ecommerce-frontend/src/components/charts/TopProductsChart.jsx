import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AnalyticsChart from "../admin/AnalyticsChart";

const formatTND = (amount) => {
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
  }).format(amount);
};

const TopProductsChart = ({ data = [], title = "Top Products" }) => {
  // Generate colors based on index
  const getColor = (index) => {
    const colors = [
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
    return colors[index % colors.length];
  };

  // Sort data by revenue and limit to top 10
  const chartData = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      shortName:
        item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
      fill: getColor(index),
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
      const product = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <div className="flex items-center mb-2">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-10 h-10 rounded mr-3 object-cover"
              />
            )}
            <div>
              <p className="font-medium">{product.name}</p>
              {product.category && (
                <p className="text-sm text-gray-500">{product.category}</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-green-600">
              <span className="font-medium">Revenue:</span>{" "}
              {formatTND(product.revenue)}
            </p>
            <p className="text-blue-600">
              <span className="font-medium">Quantity Sold:</span>{" "}
              {product.quantity}
            </p>
            <p className="text-purple-600">
              <span className="font-medium">Avg Price:</span>{" "}
              {formatTND(product.revenue / product.quantity)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <AnalyticsChart
      title={title}
      description="Top performing products by revenue"
      value={chartData.length}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                horizontal={false}
              />
              <XAxis
                type="number"
                tickFormatter={(value) =>
                  `${value.toLocaleString("fr-TN")} TND`
                }
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                stroke="#9ca3af"
                fontSize={12}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-700">
              {chartData.length}
            </div>
            <div className="text-xs text-blue-500">Top Products</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-700">
              {formatTND(totalRevenue)}
            </div>
            <div className="text-xs text-green-500">Total Revenue</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-purple-700">
              {totalQuantity}
            </div>
            <div className="text-xs text-purple-500">Units Sold</div>
          </div>
        </div>
      </div>
    </AnalyticsChart>
  );
};

export default TopProductsChart;
