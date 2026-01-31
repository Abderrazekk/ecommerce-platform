import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Area, Bar, BarChart 
} from 'recharts';
import { formatPrice } from '../../utils/formatPrice';
import AnalyticsChart from '../admin/AnalyticsChart';

const RevenueChart = ({ data = [], period = 'month', onPeriodChange, title = "Revenue Over Time" }) => {
  const formatDate = (date) => {
    try {
      const d = new Date(date);
      switch (period) {
        case 'today':
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case 'week':
          return d.toLocaleDateString([], { weekday: 'short' });
        case 'month':
          return `${d.getDate()}/${d.getMonth() + 1}`;
        case 'year':
          return d.toLocaleDateString([], { month: 'short' });
        default:
          return d.toLocaleDateString();
      }
    } catch (e) {
      return date;
    }
  };

  // Calculate totals
  const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrders = data.reduce((sum, item) => sum + (item.orders || 0), 0);
  
  // Calculate change from previous period (simplified)
  const revenueChange = data.length > 1 
    ? ((data[data.length - 1]?.revenue - data[0]?.revenue) / data[0]?.revenue * 100).toFixed(1)
    : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{formatDate(label)}</p>
          <div className="space-y-1">
            <p className="text-green-600">
              <span className="font-medium">Revenue:</span> {formatPrice(payload[0].value)}
            </p>
            {payload[0].payload.orders && (
              <p className="text-blue-600">
                <span className="font-medium">Orders:</span> {payload[0].payload.orders}
              </p>
            )}
            {payload[0].payload.avgOrderValue && (
              <p className="text-purple-600">
                <span className="font-medium">Avg Order:</span> {formatPrice(payload[0].payload.avgOrderValue)}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <AnalyticsChart
      title={title}
      description="Revenue and order trends over time"
      value={formatPrice(totalRevenue)}
      change={parseFloat(revenueChange)}
      period={period}
      onPeriodChange={onPeriodChange}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
            tickFormatter={(value) => `$${value / 1000}k`}
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
    </AnalyticsChart>
  );
};

export default RevenueChart;