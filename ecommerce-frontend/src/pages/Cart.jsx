// Cart.jsx – Premium green‑themed UI with primary color palette
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearCart, debugCart } from "../redux/slices/cart.slice";
import CartItem from "../components/cart/CartItem";
import { formatPrice } from "../utils/formatPrice";
import { ShoppingBag, Trash2, Truck, Bug, ChevronRight } from "lucide-react";

const Cart = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 100;

  // Debug effect - run once when component mounts
  useEffect(() => {
    console.log("🔍 Cart Component Mounted");
    console.log("Cart Items:", cartItems);
    console.log(
      "Cart Items details:",
      cartItems.map((item) => ({
        name: item.name,
        shippingFee: item.shippingFee,
        productId: item.product,
      })),
    );
  }, []);

  // Calculate using discounted price if available
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.discountPrice || item.price;
    return total + itemPrice * item.quantity;
  }, 0);

  // Debug: Check shipping fees
  const shippingFees = cartItems.map((item) => item.shippingFee || 0);
  console.log("📊 Shipping fees in cart:", shippingFees);

  // Find highest shipping fee among products
  const highestShippingFee =
    cartItems.length > 0
      ? Math.max(...cartItems.map((item) => item.shippingFee || 0))
      : 0;

  console.log("📦 Highest shipping fee calculated:", highestShippingFee);

  // Calculate shipping (free if subtotal > 100 TND)
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : highestShippingFee;
  const isFreeShipping = subtotal > FREE_SHIPPING_THRESHOLD;
  const total = subtotal + shipping;

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());
    }
  };

  const handleDebugCart = () => {
    dispatch(debugCart());
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-12 max-w-lg mx-auto animate-fade-in">
            <div className="bg-primary-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-primary-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Add items to get started
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-button hover:shadow-button-hover text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
            >
              Continue Shopping
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 lg:py-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section with title and debug */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Shopping Cart
            </h1>
          </div>
        </div>

        {/* Debug Shipping Info – subtle card, always present */}
        <div className="mb-10 p-5 bg-white border border-gray-100 rounded-2xl shadow-card text-sm">
          <div className="flex items-center gap-2 text-primary-600">
            <Truck className="h-4 w-4" />
            <span className="font-medium">Shipping calculation</span>
            <span className="text-xs text-gray-400 ml-auto bg-gray-50 px-2 py-1 rounded-full">
              {highestShippingFee > 0
                ? `Highest fee: ${formatPrice(highestShippingFee)}`
                : "No shipping fees found"}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-2 text-xs text-gray-600">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="truncate max-w-[130px] text-gray-700">
                  {item.name}:
                </span>
                <span className="font-mono bg-gray-50 px-2 py-0.5 rounded-md">
                  {formatPrice(item.shippingFee || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main grid: 2/3 – items, 1/3 – summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items - Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header with item count and clear cart */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {cartItems.length}
                </span>
                Items in your cart
              </h2>
              <button
                onClick={handleClearCart}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-red-600 transition-colors bg-gray-50 px-4 py-2 rounded-full hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Clear Cart
              </button>
            </div>

            {/* Cart items as premium product cards */}
            <div className="space-y-5">
              {cartItems.map((item) => (
                <div
                  key={item.product}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 sm:p-6"
                >
                  <CartItem item={item} />
                </div>
              ))}
            </div>

            {/* Continue shopping link – subtle */}
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary - Right column (sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-card-hover border border-gray-100 p-7 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-7 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
                Order Summary
              </h2>

              <div className="space-y-6">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
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
                        <span className="font-semibold text-gray-900 text-lg">
                          {formatPrice(shipping)}
                        </span>
                        {highestShippingFee > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            based on highest product fee
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Free shipping progress */}
                {!isFreeShipping && subtotal < FREE_SHIPPING_THRESHOLD && (
                  <div className="mt-4 bg-gray-50 rounded-2xl p-5">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-600">Add</span>
                      <span className="font-bold text-primary-600">
                        {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
                      </span>
                      <span className="text-gray-600">
                        more for free shipping
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                            100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{formatPrice(subtotal)}</span>
                      <span>{formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                    </div>
                  </div>
                )}

                {/* Free shipping congratulations */}
                {isFreeShipping && (
                  <div className="bg-gradient-to-br from-primary-50 to-emerald-50 border border-primary-200 rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-primary-100 rounded-full p-2 shadow-sm">
                      <Truck className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-primary-800">
                        Free shipping applied!
                      </p>
                      <p className="text-sm text-primary-600 mt-1">
                        Your order qualifies for FREE shipping.
                      </p>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-gray-200 pt-6 mt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-medium text-gray-900">
                      Total
                    </span>
                    <span className="text-3xl font-extrabold text-gray-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => navigate("/checkout")}
                className="mt-8 w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 px-6 rounded-2xl shadow-button hover:shadow-button-hover transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
              >
                Proceed to Checkout
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
