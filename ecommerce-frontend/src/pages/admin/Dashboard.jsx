import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnalytics,
  exportAnalytics,
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
  Users,
  DollarSign,
  UserCog,
  Clock,
  BarChart3,
  Download,
  Filter,
} from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/dateUtils";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { analytics, loading, period, lastUpdated } = useSelector(
    (state) => state.admin,
  );
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = () => {
    dispatch(fetchAnalytics(period));
  };

  const handleExport = (format, type) => {
    dispatch(
      exportAnalytics({
        format,
        type,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      }),
    );
  };

  const handlePeriodChange = (newPeriod) => {
    dispatch(setPeriod(newPeriod));
  };

  const refreshData = () => {
    dispatch(clearAnalytics());
    fetchData();
  };

  if (loading && !analytics) return <Loader fullScreen />;

  const summaryCards = analytics?.summary
    ? [
        {
          title: "Total Users",
          value: analytics.summary.totalUsers,
          icon: "users",
          type: "primary",
          change: 12.5,
        },
        {
          title: "Total Products",
          value: analytics.summary.totalProducts,
          icon: "products",
          type: "success",
          change: 8.2,
        },
        {
          title: "Total Orders",
          value: analytics.summary.totalOrders,
          icon: "orders",
          type: "warning",
          change: 18.7,
        },
        {
          title: "Total Revenue",
          value: analytics.summary.totalRevenue,
          icon: "revenue",
          type: "success",
          change: 22.3,
        },
        {
          title: "Pending Orders",
          value: analytics.summary.pendingOrders,
          icon: "pending",
          type: "warning",
          change: -5.2,
        },
        {
          title: "Low Stock",
          value: analytics.summary.lowStockProducts,
          icon: "lowStock",
          type: "danger",
          change: 3.8,
        },
        {
          title: "Total Admins",
          value: analytics.summary.totalAdmins,
          icon: "admins",
          type: "purple",
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
          type: "purple",
          isPercentage: true,
        },
      ]
    : [];

  const recentOrdersColumns = [
    {
      key: "_id",
      label: "Order ID",
      width: "15%",
      render: (value) => (
        <span className="font-mono text-sm">#{value.substring(0, 8)}</span>
      ),
    },
    {
      key: "user.name",
      label: "Customer",
      width: "25%",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value || "Guest"}</p>
          <p className="text-xs text-gray-500">{row.user?.email || ""}</p>
        </div>
      ),
    },
    {
      key: "totalPrice",
      label: "Amount",
      width: "15%",
      format: "price",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      width: "15%",
      render: (value) => {
        const statusConfig = {
          pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
          confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
          out_for_delivery: {
            color: "bg-purple-100 text-purple-800",
            label: "Out for Delivery",
          },
          delivered: {
            color: "bg-green-100 text-green-800",
            label: "Delivered",
          },
          cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
        };

        const config = statusConfig[value] || {
          color: "bg-gray-100 text-gray-800",
          label: value,
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      width: "15%",
      format: "date",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      width: "15%",
      render: (_, row) => (
        <button
          onClick={() => (window.location.href = `/admin/orders/${row._id}`)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
        </button>
      ),
    },
  ];

  const lowStockColumns = [
    {
      key: "name",
      label: "Product Name",
      width: "30%",
      render: (value, row) => (
        <div className="flex items-center">
          {row.images?.[0]?.url && (
            <img
              src={row.images[0].url}
              alt={value}
              className="w-10 h-10 rounded mr-3 object-cover"
            />
          )}
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-gray-500">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      width: "15%",
      render: (value) => (
        <span
          className={`font-medium ${value < 5 ? "text-red-600" : "text-yellow-600"}`}
        >
          {value} units
        </span>
      ),
      sortable: true,
    },
    {
      key: "price",
      label: "Price",
      width: "15%",
      format: "price",
      sortable: true,
    },
    {
      key: "category",
      label: "Category",
      width: "20%",
    },
    {
      key: "actions",
      label: "Actions",
      width: "20%",
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() =>
              (window.location.href = `/admin/products/edit/${row._id}`)
            }
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            Edit
          </button>
          <button
            onClick={() =>
              (window.location.href = `/admin/products/restock/${row._id}`)
            }
            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
          >
            Restock
          </button>
        </div>
      ),
    },
  ];

  const newUsersColumns = [
    {
      key: "name",
      label: "Name",
      width: "30%",
    },
    {
      key: "email",
      label: "Email",
      width: "40%",
    },
    {
      key: "createdAt",
      label: "Joined",
      width: "20%",
      format: "date",
    },
    {
      key: "actions",
      label: "Actions",
      width: "10%",
      render: () => (
        <button className="text-blue-600 hover:text-blue-800 text-sm">
          View
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive analytics and insights for your e-commerce platform
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 mt-4">
          <Filter className="h-4 w-4 text-gray-500" />
          {["today", "week", "month", "year", "all"].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-3 py-1 rounded-lg text-sm ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading && !analytics
          ? Array(8)
              .fill(0)
              .map((_, i) => <SummaryCard key={i} loading={true} />)
          : summaryCards.map((card, index) => (
              <SummaryCard key={index} {...card} />
            ))}
      </div>

      {/* Charts Section */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RevenueChart
              data={analytics?.analytics?.revenueOverTime || []}
              period={period}
              onPeriodChange={handlePeriodChange}
            />

            <StatusPieChart data={analytics?.analytics?.ordersByStatus || []} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TopProductsChart data={analytics?.analytics?.topProducts || []} />

            <CategoryChart data={analytics?.analytics?.salesByCategory || []} />
          </div>
        </>
      )}

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          {/* Low Stock Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Low Stock Alert
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Items requiring attention
                  </p>
                </div>
                <div className="bg-amber-100 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {analytics?.tables?.lowStockProducts
                  ?.slice(0, 5)
                  .map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-amber-700" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-amber-700 text-sm">
                          {product.stock}
                        </p>
                        <p className="text-xs text-gray-500">units</p>
                      </div>
                    </div>
                  ))}

                {analytics?.tables?.lowStockProducts?.length === 0 && (
                  <div className="text-center py-8">
                    <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      All products in stock
                    </p>
                  </div>
                )}
              </div>

              {analytics?.tables?.lowStockProducts?.length > 0 && (
                <button
                  onClick={() =>
                    (window.location.href = "/admin/products?filter=low-stock")
                  }
                  className="w-full mt-4 py-2.5 text-sm text-amber-700 hover:text-amber-800 font-medium bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  View All ({analytics.tables.lowStockProducts.length}) →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers Section */}
      {analytics?.analytics?.topCustomers &&
        analytics.analytics.topCustomers.length > 0 && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Customers
                </h3>
                <p className="text-sm text-gray-500">
                  Most valuable customers by total spending
                </p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Orders
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Total Spent
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Avg Order
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Last Order
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.analytics.topCustomers
                    .slice(0, 5)
                    .map((customer, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">
                              {customer.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {customer.orderCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatPrice(customer.totalSpent)}
                        </td>
                        <td className="py-3 px-4">
                          {formatPrice(
                            customer.avgOrderValue ||
                              customer.totalSpent / customer.orderCount,
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {customer.lastOrder
                            ? formatDate(customer.lastOrder, "relative")
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() =>
                              (window.location.href = `/admin/users/${customer.userId}`)
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Performance Metrics */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 p-8 relative overflow-hidden">
        {/* Decorative elements */}
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
