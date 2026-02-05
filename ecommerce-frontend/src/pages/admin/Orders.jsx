import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllOrders,
  updateOrderStatus,
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
} from "lucide-react";

const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "out_for_delivery",
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "bg-green-100 text-green-800",
  },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (window.confirm(`Update order status to "${newStatus}"?`)) {
      try {
        setStatusUpdateLoading(true);
        await dispatch(
          updateOrderStatus({ id: orderId, status: newStatus }),
        ).unwrap();
        toast.success("Order status updated!");
        dispatch(fetchAllOrders());
      } catch (error) {
        toast.error("Failed to update order status");
      } finally {
        setStatusUpdateLoading(false);
      }
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "out_for_delivery":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800";
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter((order) => {
      return (
        order.user?.name?.toLowerCase().includes(term) ||
        order.user?.email?.toLowerCase().includes(term) ||
        order._id.toLowerCase().includes(term) ||
        order.status.toLowerCase().includes(term)
      );
    });
  }, [orders, searchTerm]);

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <p className="text-gray-600">{filteredOrders.length} orders found</p>
        </div>
        <button
          onClick={() => dispatch(fetchAllOrders())}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Package className="h-5 w-5" />
          Refresh Orders
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by customer, order ID, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipping
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{order._id.slice(-8).toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <ShoppingBag className="h-3 w-3" />
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
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
                  <div className="text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}{" "}
                    units
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatPrice(order.totalPrice)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Subtotal: {formatPrice(order.productsTotal)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 text-gray-400 mr-1" />
                    {order.freeShipping ? (
                      <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        FREE
                      </span>
                    ) : (
                      <span className="text-sm text-gray-900">
                        {formatPrice(order.shippingFee)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                    >
                      {statusOptions.find((s) => s.value === order.status)
                        ?.label || order.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order._id, e.target.value)
                      }
                      disabled={statusUpdateLoading}
                      className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 border border-gray-200 rounded-lg mt-6">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search query"
              : "No orders have been placed yet"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-sm text-gray-500">
                    Order #{selectedOrder._id}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Header */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Order Date
                      </h3>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-gray-900">
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Customer
                      </h3>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {selectedOrder.user?.name || "Guest"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedOrder.user?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Order Status
                      </h3>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-2 font-medium">
                          {
                            statusOptions.find(
                              (s) => s.value === selectedOrder.status,
                            )?.label
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b pb-3"
                      >
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover rounded"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </div>
                            <div className="text-sm text-gray-500">
                              Price: {formatPrice(item.price)} each
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <Truck className="h-3 w-3 mr-1" />
                            Shipping: {formatPrice(item.shippingFee || 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Payment Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Products Subtotal:</span>
                      <span className="font-medium">
                        {formatPrice(selectedOrder.productsTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Shipping Fee:</span>
                      </div>
                      <div>
                        {selectedOrder.freeShipping ? (
                          <div className="flex flex-col items-end">
                            <span className="text-green-600 font-medium">
                              FREE
                            </span>
                            <span className="text-xs text-gray-500">
                              (Order over 100 TND)
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">
                            {formatPrice(selectedOrder.shippingFee)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Amount:</span>
                        <span>{formatPrice(selectedOrder.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Delivery Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Shipping Address
                      </h4>
                      <p className="text-gray-700">
                        {selectedOrder.deliveryAddress}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Contact Phone
                      </h4>
                      <p className="text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Status
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${selectedOrder.isPaid ? "bg-green-500" : "bg-yellow-500"}`}
                      />
                      <div>
                        <div className="font-medium">
                          {selectedOrder.isPaid ? "Paid" : "Pending Payment"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedOrder.isPaid
                            ? "Payment completed successfully"
                            : "Awaiting payment"}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Cash on Delivery
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="font-semibold mb-3">Update Order Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleStatusUpdate(selectedOrder._id, option.value);
                          setIsModalOpen(false);
                        }}
                        disabled={
                          selectedOrder.status === option.value ||
                          statusUpdateLoading
                        }
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedOrder.status === option.value
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
