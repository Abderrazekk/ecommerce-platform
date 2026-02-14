// Checkout.jsx – Premium green‑themed with primary color palette
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
import {
  Package,
  MapPin,
  Phone,
  Truck,
  AlertCircle,
  CreditCard,
  Check,
  ChevronRight,
  Home,
  FileText, // NEW icon for description
} from "lucide-react";

const Checkout = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");
  // NEW: state for description
  const [description, setDescription] = useState("");
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

    // Description is optional, no validation needed

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

      // Create order - include description
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
        description: description.trim() || undefined, // send only if not empty
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
    <div className="min-h-screen bg-gray-50 py-12 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Complete your purchase in a few steps
          </p>
        </div>

        {/* Debug Warning Banner – subtle, expandable */}
        {highestShippingFee === 0 && cartItems.length > 0 && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 flex-1">
              <p className="font-semibold">Shipping Fee Warning</p>
              <p className="text-amber-700">
                No shipping fees found in cart items. This may indicate a data
                issue.
              </p>
              <details className="mt-2 text-xs text-amber-600">
                <summary className="cursor-pointer hover:text-amber-800 font-medium">
                  Debug details
                </summary>
                <div className="mt-2 bg-amber-100/50 p-3 rounded-xl">
                  <strong>Cart Items:</strong> {cartItems.length} items
                  <br />
                  <strong>Shipping Fees:</strong> {JSON.stringify(shippingFees)}
                </div>
              </details>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Two-column layout: shipping (2/3) + summary (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Shipping Information – left column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: Shipping Information */}
              <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-7 lg:p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl text-lg font-bold shadow-md">
                    1
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Shipping Information
                    </h2>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Full Name (disabled) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={user?.name || ""}
                          disabled
                          className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 text-gray-600 text-base focus:ring-0 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Email (disabled) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 text-gray-600 text-base focus:ring-0 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1.5" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className={`w-full px-4 py-3.5 border rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-shadow ${
                        errors.phone
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                      }`}
                      placeholder="+216 XX XXX XXX"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1.5" />
                      Shipping Address *
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      rows="4"
                      className={`w-full px-4 py-3.5 border rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-shadow resize-none ${
                        errors.shippingAddress
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                      }`}
                      placeholder="Street address, City, Postal code, Country"
                    />
                    {errors.shippingAddress && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.shippingAddress}
                      </p>
                    )}
                  </div>

                  {/* NEW: Optional Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-1.5" />
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-shadow resize-none"
                      placeholder="Any special instructions, color preferences, etc."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Add any notes for your order (optional)
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Payment – visual step */}
              <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-7 lg:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-600 rounded-2xl text-lg font-bold border border-gray-200">
                    2
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Payment Method
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Pay when you receive your order
                    </p>
                  </div>
                  <span className="ml-auto bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-xs font-medium border border-gray-200">
                    Cash on Delivery
                  </span>
                </div>
                <div className="pl-14">
                  <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary-600" />
                    <p className="text-sm text-primary-700">
                      You'll pay <strong>Cash on Delivery</strong> when your
                      order arrives.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary – right column (sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-card-hover border border-gray-100 p-7 lg:sticky lg:top-24">
                <div className="flex items-center gap-3 mb-7">
                  <div className="bg-gray-100 rounded-xl p-2">
                    <Package className="h-5 w-5 text-gray-700" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Order
                  </h2>
                </div>

                {/* Order items list – scrollable */}
                <div className="space-y-5 max-h-80 overflow-y-auto pr-1 -mr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.product}
                      className="flex gap-4 py-4 border-b border-gray-100 last:border-0"
                    >
                      <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Truck className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Shipping: {formatPrice(item.shippingFee || 0)}
                          </span>
                          {item.shippingFee === 0 && (
                            <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">
                              Missing
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-base font-bold text-gray-900 whitespace-nowrap">
                        {formatPrice(
                          (item.discountPrice || item.price) * item.quantity,
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-4 border-t border-gray-200 pt-6 mt-6">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-base">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Shipping</span>
                    </div>
                    <div className="text-right">
                      {isFreeShipping ? (
                        <span className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full text-sm">
                          FREE
                        </span>
                      ) : (
                        <>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(shipping)}
                          </span>
                          {highestShippingFee > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              (highest product fee)
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-3xl font-extrabold text-gray-900">
                        {formatPrice(total)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Including {formatPrice(shipping)} shipping fee
                    </p>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-8 w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-5 px-6 rounded-2xl shadow-button hover:shadow-button-hover transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Place Order
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* Order breakdown – subtle */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Order Summary
                  </h3>
                  <div className="text-xs text-gray-600 space-y-2 bg-gray-50 p-4 rounded-2xl">
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span className="font-medium">
                        {cartItems.reduce(
                          (acc, item) => acc + item.quantity,
                          0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products total:</span>
                      <span className="font-medium">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping fee:</span>
                      <span className="font-medium">
                        {formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                      <span className="font-semibold text-gray-900">
                        Order total:
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatPrice(total)}
                      </span>
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
