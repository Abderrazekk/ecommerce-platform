import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../redux/slices/order.slice";
import {
  clearCart,
  saveShippingAddress,
  savePhone,
} from "../redux/slices/cart.slice";
import { formatPrice } from "../utils/formatPrice";
import { Package, MapPin, Phone, Truck, AlertCircle } from "lucide-react";

const Checkout = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const FREE_SHIPPING_THRESHOLD = 100;

  // Debug effect
  useEffect(() => {
    console.log("🔍 Checkout Component - Cart Items:", cartItems);
    console.log(
      "🔍 Shipping Fees:",
      cartItems.map((item) => ({
        name: item.name,
        shippingFee: item.shippingFee,
      })),
    );
  }, [cartItems]);

  // Calculate using discounted price if available
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.discountPrice || item.price;
    return total + itemPrice * item.quantity;
  }, 0);

  // Find highest shipping fee among products
  const shippingFees = cartItems.map((item) => item.shippingFee || 0);
  const highestShippingFee =
    cartItems.length > 0 ? Math.max(...shippingFees) : 0;

  console.log("📦 Shipping calculation:", {
    shippingFees,
    highestShippingFee,
    subtotal,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  });

  // Calculate shipping (free if subtotal > 100 TND)
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : highestShippingFee;
  const isFreeShipping = subtotal > FREE_SHIPPING_THRESHOLD;
  const total = subtotal + shipping;

  const validateForm = () => {
    const newErrors = {};

    if (!shippingAddress.trim()) {
      newErrors.shippingAddress = "Shipping address is required";
    } else if (shippingAddress.trim().length < 10) {
      newErrors.shippingAddress = "Please enter a complete address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{8,15}$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Save shipping info
      dispatch(saveShippingAddress(shippingAddress));
      dispatch(savePhone(phone));

      // Create order - log what's being sent
      console.log(
        "📤 Creating order with items:",
        cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          shippingFee: item.shippingFee,
        })),
      );

      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
        deliveryAddress: shippingAddress,
        phone: phone,
      };

      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      navigate("/my-orders");
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Debug Info Banner */}
        {highestShippingFee === 0 && cartItems.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="font-medium text-yellow-800">
                  Shipping Fee Warning
                </h3>
                <p className="text-sm text-yellow-700">
                  No shipping fees found in cart items. This may indicate a data
                  issue.
                </p>
                <div className="mt-2 text-xs">
                  <strong>Cart Items:</strong> {cartItems.length} items
                  <br />
                  <strong>Shipping Fees:</strong> {JSON.stringify(shippingFees)}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="+216 XX XXX XXX"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address *
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      rows="4"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.shippingAddress
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Street address, City, Postal code, Country"
                    />
                    {errors.shippingAddress && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.shippingAddress}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      We'll deliver your order to this address
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.product}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="h-16 w-16 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover rounded"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} ×{" "}
                              {formatPrice(item.discountPrice || item.price)}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Truck className="h-3 w-3 mr-1" />
                              <span>
                                Shipping: {formatPrice(item.shippingFee || 0)}
                              </span>
                              {item.shippingFee === 0 && (
                                <span className="ml-2 text-red-500 text-xs">
                                  (Missing shipping fee)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="font-semibold text-right">
                        {formatPrice(
                          (item.discountPrice || item.price) * item.quantity,
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Shipping Fee</span>
                    </div>
                    <div className="text-right">
                      {isFreeShipping ? (
                        <div className="flex flex-col items-end">
                          <span className="text-green-600 font-medium">
                            FREE
                          </span>
                          <span className="text-xs text-gray-500">
                            (Order over {formatPrice(FREE_SHIPPING_THRESHOLD)})
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="font-medium">
                            {formatPrice(shipping)}
                          </span>
                          {highestShippingFee > 0 && (
                            <span className="text-xs text-gray-500">
                              Based on highest product shipping fee:{" "}
                              {formatPrice(highestShippingFee)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Placing Order...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </button>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Order Breakdown
                  </h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Number of items:</span>
                      <span>
                        {cartItems.reduce(
                          (acc, item) => acc + item.quantity,
                          0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products total:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping fee:</span>
                      <span>{formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-gray-900">
                      <span>Order total:</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
