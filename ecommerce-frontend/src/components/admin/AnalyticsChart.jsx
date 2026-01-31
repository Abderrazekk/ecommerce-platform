import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AnalyticsChart = ({ 
  title, 
  description, 
  children, 
  value, 
  change, 
  period = 'month',
  onPeriodChange,
  className = ''
}) => {
  const periods = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' }
  ];

  return (
    <div className={`bg-white rounded-xl border p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {value !== undefined && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {change !== undefined && (
                <div className="flex items-center text-sm">
                  {change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(change)}%
                  </span>
                  <span className="text-gray-500 ml-1">vs last period</span>
                </div>
              )}
            </div>
          )}
          
          {onPeriodChange && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => onPeriodChange(p.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === p.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="h-80">
        {children}
      </div>
    </div>
  );
};

export default AnalyticsChart;