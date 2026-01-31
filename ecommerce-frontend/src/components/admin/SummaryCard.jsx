import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  UserCog,
  Clock,
  TrendingUp,
  TrendingDown,
  Box,
  UserCheck,
  Activity,
} from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

const SummaryCard = ({
  title,
  value,
  icon,
  change,
  type = "default",
  loading = false,
}) => {
  const iconConfig = {
    users: { Icon: Users, gradient: "from-blue-500 to-blue-600" },
    products: { Icon: Package, gradient: "from-purple-500 to-purple-600" },
    orders: { Icon: ShoppingCart, gradient: "from-emerald-500 to-emerald-600" },
    revenue: { Icon: DollarSign, gradient: "from-amber-500 to-amber-600" },
    pending: { Icon: Clock, gradient: "from-orange-500 to-orange-600" },
    lowStock: { Icon: AlertCircle, gradient: "from-red-500 to-red-600" },
    admins: { Icon: UserCog, gradient: "from-indigo-500 to-indigo-600" },
    growth: { Icon: TrendingUp, gradient: "from-teal-500 to-teal-600" },
    stock: { Icon: Box, gradient: "from-cyan-500 to-cyan-600" },
    conversion: { Icon: UserCheck, gradient: "from-violet-500 to-violet-600" },
    activity: { Icon: Activity, gradient: "from-pink-500 to-pink-600" },
  };

  const config = iconConfig[icon] || {
    Icon: Package,
    gradient: "from-gray-500 to-gray-600",
  };
  const Icon = config.Icon;

  const formatValue = (val) => {
    if (type === "revenue" || type === "currency") return formatPrice(val);
    if (type === "percentage") return `${val}%`;
    return val?.toLocaleString() || "0";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-9 bg-gray-300 rounded w-28"></div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatValue(value)}
          </p>
          {change !== undefined && change !== null && (
            <div className="flex items-center mt-3 text-sm">
              <span
                className={`flex items-center font-semibold px-2 py-1 rounded-lg ${
                  change > 0
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-red-700 bg-red-50"
                }`}
              >
                {change > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="text-gray-400 ml-2 text-xs">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`w-14 h-14 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
