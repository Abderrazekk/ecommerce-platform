import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder, // NEW
} from "../../redux/slices/order.slice";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";
import { toast } from "react-hot-toast";
import {
  Package,
  Eye,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Search,
  X,
  CreditCard,
  Tag,
  ShoppingBag,
  Phone,
  MapPin,
  Home,
  Hash,
  ChevronDown,
  Filter,
  RefreshCw,
  FileText, // NEW icon for description
  Trash2, // NEW icon for delete
} from "lucide-react";

const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "out_for_delivery",
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
  },
];

const paymentStatusOptions = [
  { value: "all", label: "All Payments" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
];

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  // Local state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false); // NEW

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // Update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    if (window.confirm(`Update order status to "${newStatus}"?`)) {
      try {
        setStatusUpdateLoading(true);
        await dispatch(
          updateOrderStatus({ id: orderId, status: newStatus }),
        ).unwrap();
        toast.success("Order status updated!");
        dispatch(fetchAllOrders());
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } catch (error) {
        toast.error("Failed to update order status");
      } finally {
        setStatusUpdateLoading(false);
      }
    }
  };

  // NEW: Delete order
  const handleDeleteOrder = async (orderId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone.",
      )
    ) {
      try {
        setDeleteLoading(true);
        await dispatch(deleteOrder(orderId)).unwrap();
        toast.success("Order deleted successfully");
        if (selectedOrder?._id === orderId) {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }
      } catch (error) {
        toast.error("Failed to delete order");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Open modal with order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search term
      const matchesSearch =
        !searchTerm.trim() ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      // Payment filter
      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" && order.isPaid) ||
        (paymentFilter === "pending" && !order.isPaid);

      // Date range filter
      let matchesDate = true;
      if (dateRange.start || dateRange.end) {
        const orderDate = new Date(order.createdAt);
        if (dateRange.start) {
          matchesDate = orderDate >= new Date(dateRange.start);
        }
        if (dateRange.end) {
          matchesDate = matchesDate && orderDate <= new Date(dateRange.end);
        }
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter, dateRange]);

  // Icons for status badges
  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "out_for_delivery":
        return <Truck className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Orders
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} found
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchAllOrders())}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, customer, email, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
              {(statusFilter !== "all" ||
                paymentFilter !== "all" ||
                dateRange.start ||
                dateRange.end) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Order Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Payment Status
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {paymentStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="bg-gray-50 rounded-full p-4 inline-flex mx-auto mb-4">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ||
              statusFilter !== "all" ||
              paymentFilter !== "all" ||
              dateRange.start ||
              dateRange.end
                ? "Try adjusting your filters"
                : "No orders have been placed yet"}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 rounded-lg p-2">
                            <ShoppingBag className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-mono font-medium text-gray-900">
                              #{order._id.slice(-8).toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.items.length} item
                              {order.items.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 rounded-full p-1.5">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.user?.name || "Guest"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.user?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatPrice(order.totalPrice)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Subtotal: {formatPrice(order.productsTotal)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              order.isPaid
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.isPaid ? "Paid" : "Pending"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${
                            statusOptions.find((s) => s.value === order.status)
                              ?.color ||
                            "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {getStatusIcon(order.status)}
                          {statusOptions.find((s) => s.value === order.status)
                            ?.label || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {/* NEW: Delete button */}
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            disabled={deleteLoading}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete order"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order._id, e.target.value)
                            }
                            disabled={statusUpdateLoading}
                            className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal – Premium Design */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      Order #{selectedOrder._id.slice(-8).toUpperCase()}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${
                          statusOptions.find(
                            (s) => s.value === selectedOrder.status,
                          )?.color
                        }`}
                      >
                        {getStatusIcon(selectedOrder.status)}
                        {
                          statusOptions.find(
                            (s) => s.value === selectedOrder.status,
                          )?.label
                        }
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(selectedOrder.createdAt).toLocaleString(
                        "en-US",
                        {
                          dateStyle: "long",
                          timeStyle: "short",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8">
                {/* Two‑column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left column – Customer & Delivery */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Customer Card */}
                    <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        Customer Information
                      </h3>
                      <div className="flex items-start gap-4">
                        <div className="bg-white rounded-full p-3 shadow-sm border border-gray-200">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedOrder.user?.name || "Guest Customer"}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {selectedOrder.user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Card */}
                    <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-500" />
                        Delivery Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex gap-3">
                          <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                              Address
                            </p>
                            <p className="text-gray-800 text-sm mt-1">
                              {selectedOrder.deliveryAddress}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                              Contact
                            </p>
                            <p className="text-gray-800 text-sm mt-1">
                              {selectedOrder.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NEW: Order Description Card */}
                    {selectedOrder.description && (
                      <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          Order Notes
                        </h3>
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">
                          {selectedOrder.description}
                        </p>
                      </div>
                    )}

                    {/* Payment Card */}
                    <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        Payment Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(selectedOrder.productsTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-semibold text-gray-900">
                            {selectedOrder.freeShipping ? (
                              <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                                FREE
                              </span>
                            ) : (
                              formatPrice(selectedOrder.shippingFee)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-800 font-medium">
                            Total
                          </span>
                          <span className="text-xl font-bold text-gray-900">
                            {formatPrice(selectedOrder.totalPrice)}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                              selectedOrder.isPaid
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {selectedOrder.isPaid ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                            {selectedOrder.isPaid ? "Paid" : "Pending Payment"}
                          </span>
                          <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-700">
                            Cash on Delivery
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column – Status Update & Delete */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 sticky top-24">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        Update Status
                      </h3>
                      <div className="space-y-2.5">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleStatusUpdate(
                                selectedOrder._id,
                                option.value,
                              )
                            }
                            disabled={
                              selectedOrder.status === option.value ||
                              statusUpdateLoading
                            }
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                              selectedOrder.status === option.value
                                ? "bg-white border-blue-300 shadow-sm"
                                : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <span className="flex items-center gap-2">
                              {getStatusIcon(option.value)}
                              <span className="text-sm font-medium text-gray-700">
                                {option.label}
                              </span>
                            </span>
                            {selectedOrder.status === option.value && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* NEW: Delete button in modal */}
                      <div className="mt-6 pt-4 border-t border-blue-200">
                        <button
                          onClick={() => handleDeleteOrder(selectedOrder._id)}
                          disabled={deleteLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-5 w-5" />
                          {deleteLoading ? "Deleting..." : "Delete Order"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-gray-600" />
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="h-20 w-20 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Qty:</span>
                              <span className="font-medium text-gray-900">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Price:</span>
                              <span className="font-medium text-gray-900">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-1 mt-1">
                              <span className="text-gray-600">Total:</span>
                              <span className="text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-8 py-5 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
