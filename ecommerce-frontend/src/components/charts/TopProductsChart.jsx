import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "../admin/ChartCard";

const formatTND = (amount) => {
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
  }).format(amount);
};

const TopProductsChart = ({
  data = [],
  title = "Top Products",
  height = 300,
}) => {
  const getColor = (index) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return colors[index % colors.length];
  };

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
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
          <div className="flex items-center mb-2">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-10 h-10 rounded mr-3 object-cover"
              />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.name}
              </p>
              {product.category && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {product.category}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-emerald-600 dark:text-emerald-400">
              <span className="font-medium">Revenue:</span>{" "}
              {formatTND(product.revenue)}
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              <span className="font-medium">Quantity:</span> {product.quantity}
            </p>
            <p className="text-purple-600 dark:text-purple-400">
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
    <ChartCard
      title={title}
      description="Top performing products by revenue"
      value={`Top ${chartData.length}`}
    >
      <div className="h-full">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={(v) => `${v.toLocaleString("fr-TN")} TND`}
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              stroke="#9ca3af"
              fontSize={12}
              width={100}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl text-center">
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              {chartData.length}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              Top Products
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl text-center">
            <div className="text-lg font-semibold text-green-700 dark:text-green-400">
              {formatTND(totalRevenue)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-300">
              Total Revenue
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl text-center">
            <div className="text-lg font-semibold text-purple-700 dark:text-purple-400">
              {totalQuantity}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-300">
              Units Sold
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

export default TopProductsChart;
