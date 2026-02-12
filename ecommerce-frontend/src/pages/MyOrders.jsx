// MyOrders.jsx – Premium green‑themed order management
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../redux/slices/order.slice";
import { formatPrice } from "../utils/formatPrice";
import Loader from "../components/common/Loader";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Home,
  Calendar,
  Hash,
  ChevronRight,
  MapPin,
  Phone as PhoneIcon,
} from "lucide-react";

const MyOrders = () => {
  const dispatch = useDispatch();
  const { myOrders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "out_for_delivery":
        return <Truck className="h-5 w-5 text-primary-600" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-primary-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "out_for_delivery":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "confirmed":
        return "bg-primary-100 text-primary-800 border-primary-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Track, manage, and review your orders
          </p>
        </div>

        {myOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-card-hover border border-gray-100 p-12 text-center max-w-2xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-full p-6 inline-flex mx-auto mb-6">
              <Package className="h-16 w-16 text-primary-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Ready to start shopping? Explore our collection.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-button hover:shadow-button-hover text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
            >
              Shop Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {myOrders.map((order) => (
              <div
                key={order._id}
                className="group bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-all duration-300"
              >
                {/* Order Header – premium, with status and total */}
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-7 py-6 sm:px-9 sm:py-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-gray-700 bg-gray-100 px-4 py-2 rounded-full">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span className="font-mono text-sm font-bold">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border shadow-sm ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1.5">
                            {order.status.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-500">Total amount</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items – elegant product listing */}
                <div className="px-7 py-6 sm:px-9 sm:py-8">
                  <div className="space-y-6 divide-y divide-gray-100">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-5 pt-5 first:pt-0">
                        <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            <span className="text-gray-600 flex items-center gap-1">
                              <span className="font-medium">Quantity:</span> {item.quantity}
                            </span>
                            <span className="text-gray-600 flex items-center gap-1">
                              <span className="font-medium">Unit price:</span> {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer – delivery & price summary */}
                <div className="border-t border-gray-100 bg-gray-50/50 px-7 py-6 sm:px-9 sm:py-7">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Delivery Address with icon */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                          <Home className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                          Delivery Address
                        </h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span>{order.deliveryAddress}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <span>{order.phone}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary – elegant, right-aligned */}
                    <div className="flex flex-col items-end justify-center">
                      <div className="space-y-2 w-full max-w-xs bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subtotal:</span>
                          <span className="font-medium text-gray-900">
                            {formatPrice(order.productsTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Shipping:</span>
                          <span className="font-medium text-gray-900">
                            {order.freeShipping ? (
                              <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                FREE
                              </span>
                            ) : (
                              formatPrice(order.shippingFee)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-3 mt-1">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-gray-900 text-xl">
                            {formatPrice(order.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;