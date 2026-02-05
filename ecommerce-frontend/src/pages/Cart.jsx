import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearCart, debugCart } from "../redux/slices/cart.slice";
import CartItem from "../components/cart/CartItem";
import { formatPrice } from "../utils/formatPrice";
import { ShoppingBag, Trash2, Truck, Bug } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some products to your cart to see them here.
          </p>
          <Link to="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={handleDebugCart}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm flex items-center gap-1"
            title="Debug cart"
          >
            <Bug className="h-4 w-4" />
            Debug
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Items (
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                </h2>
                <button
                  onClick={handleClearCart}
                  className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Clear Cart
                </button>
              </div>

              {/* Shipping Fee Debug Info */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-700">
                      Shipping Calculation
                    </span>
                  </div>
                  <span className="text-sm text-blue-600">
                    {highestShippingFee > 0
                      ? `Highest fee: ${formatPrice(highestShippingFee)}`
                      : "No shipping fees found"}
                  </span>
                </div>
                <div className="mt-2 text-sm text-blue-600">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name}:</span>
                      <span>{formatPrice(item.shippingFee || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <CartItem key={item.product} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Shipping</span>
                  </div>
                  <div className="text-right">
                    {isFreeShipping ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      <div>
                        <span className="font-semibold">
                          {formatPrice(shipping)}
                        </span>
                        {highestShippingFee > 0 && (
                          <div className="text-xs text-gray-500">
                            (Based on {formatPrice(highestShippingFee)})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Free shipping progress bar */}
                {!isFreeShipping && subtotal < FREE_SHIPPING_THRESHOLD && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-600 mb-1">
                      Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more
                      for FREE shipping!
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(subtotal / FREE_SHIPPING_THRESHOLD) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatPrice(subtotal)}</span>
                      <span>{formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                    </div>
                  </div>
                )}

                {isFreeShipping && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                    <div className="font-medium">🎉 Congratulations!</div>
                    <div className="mt-1">
                      You've earned free shipping on this order!
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full btn-primary py-3 text-lg font-medium"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/shop"
                className="block w-full text-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
