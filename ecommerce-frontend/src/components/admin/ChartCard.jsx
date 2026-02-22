import { Filter } from "lucide-react";

const ChartCard = ({
  title,
  description,
  value,
  change,
  period,
  onPeriodChange,
  children,
  className = "",
}) => {
  const periods = ["today", "week", "month", "year", "all"];

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        {value !== undefined && (
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change !== undefined && (
              <p
                className={`text-xs font-medium ${
                  change > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {change > 0 ? "+" : ""}
                {change}% from last period
              </p>
            )}
          </div>
        )}
        {period && onPeriodChange && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Filter className="h-4 w-4 text-gray-400 ml-1" />
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === p
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart area */}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default ChartCard;