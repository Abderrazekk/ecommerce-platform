import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnalytics,
  setPeriod,
  clearAnalytics,
} from "../../redux/slices/admin.slice";
import SummaryCard from "../../components/admin/SummaryCard";
import Loader from "../../components/common/Loader";
import RevenueChart from "../../components/charts/RevenueChart";
import StatusPieChart from "../../components/charts/StatusPieChart";
import TopProductsChart from "../../components/charts/TopProductsChart";
import CategoryChart from "../../components/charts/CategoryChart";
import {
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Package,
  DollarSign,
  BarChart3,
  Filter,
  Users,
  Clock,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/dateUtils";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { analytics, loading, period } = useSelector((state) => state.admin);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = () => {
    dispatch(fetchAnalytics(period));
  };

  const handlePeriodChange = (newPeriod) => {
    dispatch(setPeriod(newPeriod));
  };

  const refreshData = () => {
    dispatch(clearAnalytics());
    fetchData();
  };

  if (loading && !analytics) return <Loader fullScreen />;

  // Summary cards data
  const summaryCards = analytics?.summary
    ? [
        {
          title: "Total Users",
          value: analytics.summary.totalUsers,
          icon: "users",
          change: 12.5,
        },
        {
          title: "Total Products",
          value: analytics.summary.totalProducts,
          icon: "products",
          change: 8.2,
        },
        {
          title: "Total Orders",
          value: analytics.summary.totalOrders,
          icon: "orders",
          change: 18.7,
        },
        {
          title: "Total Revenue",
          value: analytics.summary.totalRevenue,
          icon: "revenue",
          type: "currency",
          change: 22.3,
        },
        {
          title: "Pending Orders",
          value: analytics.summary.pendingOrders,
          icon: "pending",
          change: -5.2,
        },
        {
          title: "Low Stock",
          value: analytics.summary.lowStockProducts,
          icon: "lowStock",
          change: 3.8,
        },
        {
          title: "Total Admins",
          value: analytics.summary.totalAdmins,
          icon: "admins",
          change: 0,
        },
        {
          title: "Conversion Rate",
          value:
            analytics.summary.totalUsers > 0
              ? (
                  (analytics.summary.totalOrders /
                    analytics.summary.totalUsers) *
                  100
                ).toFixed(1)
              : 0,
          icon: "conversion",
          type: "percentage",
          change: null,
        },
      ]
    : [];

  // Table data
  const recentOrders = analytics?.tables?.recentOrders || [];
  const lowStockProducts = analytics?.tables?.lowStockProducts || [];
  const topCustomers = analytics?.analytics?.topCustomers || [];

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      confirmed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      out_for_delivery: { color: "bg-purple-100 text-purple-800", icon: Truck },
      delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
    };
    const { color, icon: Icon } = config[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: Clock,
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-6 p-1 bg-white rounded-xl shadow-sm border border-gray-200">
          <Filter className="h-4 w-4 text-gray-400 ml-2" />
          {["today", "week", "month", "year", "all"].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === p
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading && !analytics
          ? Array(8)
              .fill(0)
              .map((_, i) => <SummaryCard key={i} loading={true} />)
          : summaryCards.map((card, index) => (
              <SummaryCard key={index} {...card} />
            ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart
          data={analytics?.analytics?.revenueOverTime || []}
          period={period}
          onPeriodChange={handlePeriodChange}
          height={320}
        />
        <StatusPieChart
          data={analytics?.analytics?.ordersByStatus || []}
          height={320}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TopProductsChart
          data={analytics?.analytics?.topProducts || []}
          height={320}
        />
        <CategoryChart
          data={analytics?.analytics?.salesByCategory || []}
          height={320}
        />
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders - takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h3>
              <button
                onClick={() => (window.location.href = "/admin/orders")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Order ID</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">
                      #{order._id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.user?.name || "Guest"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          (window.location.href = `/admin/orders/${order._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock + Top Customers */}
        <div className="space-y-6">
          {/* Low Stock Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  Low Stock Alert
                </h3>
                <button
                  onClick={() =>
                    (window.location.href = "/admin/products?filter=low-stock")
                  }
                  className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-4">
              {lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 4).map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-amber-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-700">
                          {product.stock}
                        </p>
                        <p className="text-xs text-gray-500">units</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">All products in stock</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Customers */}
          {topCustomers.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  Top Customers
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {topCustomers.slice(0, 3).map((customer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(customer.totalSpent)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.orderCount} orders
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => (window.location.href = "/admin/users")}
                  className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  View All Customers →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/30 to-yellow-100/30 rounded-full blur-3xl -z-0"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Performance Metrics
              </h3>
              <p className="text-sm text-gray-500">
                Key performance indicators at a glance
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Order Conversion Rate */}
            <div className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +12%
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {analytics?.summary?.totalOrders &&
                  analytics?.summary?.totalUsers
                    ? (
                        (analytics.summary.totalOrders /
                          analytics.summary.totalUsers) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Order Conversion
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Users to customers ratio
                </p>
              </div>
            </div>

            {/* Best Selling Product */}
            <div className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Top
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {analytics?.analytics?.topProducts?.[0]?.quantity || "0"}
                </p>
                <p className="text-sm font-medium text-gray-600">Units Sold</p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  Best performing product
                </p>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    AOV
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {analytics?.summary?.totalOrders &&
                  analytics?.summary?.totalRevenue
                    ? formatPrice(
                        analytics.summary.totalRevenue /
                          analytics.summary.totalOrders,
                      )
                    : "$0.00"}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Per transaction average
                </p>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-amber-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-3 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    Alert
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {analytics?.summary?.lowStockProducts || "0"}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Need Restocking
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Products running low
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
