import { useState, useEffect } from "react";
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

const iconMap = {
  users: {
    Icon: Users,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  products: {
    Icon: Package,
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
  },
  orders: {
    Icon: ShoppingCart,
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  revenue: {
    Icon: DollarSign,
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-600 dark:text-amber-400",
  },
  pending: {
    Icon: Clock,
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
  },
  lowStock: {
    Icon: AlertCircle,
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
  },
  admins: {
    Icon: UserCog,
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  growth: {
    Icon: TrendingUp,
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-600 dark:text-teal-400",
  },
  stock: {
    Icon: Box,
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  conversion: {
    Icon: UserCheck,
    bg: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-600 dark:text-violet-400",
  },
  activity: {
    Icon: Activity,
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-600 dark:text-pink-400",
  },
};

const SummaryCard = ({
  title,
  value,
  icon,
  change,
  type = "default",
  loading = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const { Icon, bg, text } = iconMap[icon] || iconMap.products;

  // Animate counter
  useEffect(() => {
    if (loading || value === undefined || value === null) return;
    let start = 0;
    const end = value;
    const duration = 1000;
    const stepTime = 15;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, loading]);

  const formatValue = (val) => {
    if (type === "revenue" || type === "currency") return formatPrice(val);
    if (type === "percentage") return `${val}%`;
    return val?.toLocaleString() || "0";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const numericValue = typeof displayValue === "number" ? displayValue : value;

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatValue(numericValue)}
          </p>
          {change !== undefined && change !== null && (
            <div className="flex items-center mt-3">
              <span
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                  change > 0
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                    : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30"
                }`}
              >
                {change > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="text-gray-400 dark:text-gray-500 ml-2 text-xs">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`h-6 w-6 ${text}`} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
