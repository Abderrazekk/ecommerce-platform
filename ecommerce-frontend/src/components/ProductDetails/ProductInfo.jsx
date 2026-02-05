import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cart.slice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/slices/wishlist.slice";
import { formatPrice } from "../../utils/formatPrice";
import toast from "react-hot-toast";
import {
  Heart,
  Share2,
  CheckCircle,
  Truck,
  Shield,
  RefreshCw,
  Globe,
  Check,
  Star,
  ShoppingBag,
  Zap,
} from "lucide-react";

const ProductInfo = ({
  product,
  user,
  isAuthenticated,
  wishlistChecked,
  wishlistLoading,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist");
      navigate("/login");
      return;
    }

    const isInWishlist = wishlistChecked[product?._id];

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error(error || "Failed to update wishlist");
    }
  };

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addToCart({
          product: product._id,
          name: product.name,
          price: product.discountPrice || product.price,
          shippingFee: product.shippingFee || 0,
          image: product.images?.[0]?.url || "",
          quantity: quantity,
        }),
      );
      toast.success("Added to cart");
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    setIsBuyNowLoading(true);

    // Add product to cart
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        shippingFee: product.shippingFee || 0,
        image: product.images?.[0]?.url || "",
        quantity: quantity,
      }),
    );

    // Show success message
    toast.success("Added to cart! Redirecting to checkout...");

    // Redirect to checkout after a short delay
    setTimeout(() => {
      navigate("/checkout");
      setIsBuyNowLoading(false);
    }, 1000);
  };

  const getProductUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/product/${product._id}`;
  };

  const handleShare = async () => {
    const productUrl = getProductUrl();

    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: product?.name || "Check out this product",
          text: product?.description
            ? `${product.name}: ${product.description.substring(0, 100)}...`
            : "Check out this amazing product!",
          url: productUrl,
        });
      } catch (error) {
        copyToClipboard(productUrl);
      }
    } else {
      copyToClipboard(productUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } else {
        alert("Failed to copy link. Please copy the URL manually: " + text);
      }
    } catch (error) {
      console.error("Fallback copy failed:", error);
      alert("Failed to copy link. Please copy the URL manually: " + text);
    }

    document.body.removeChild(textArea);
  };

  const discountPercentage = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

  return (
    <div className="space-y-10">
      {/* Product Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          {product.brand && (
            <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
              {product.brand}
            </span>
          )}
          <span className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
            {product.category}
          </span>
          {product.isFeatured && (
            <span className="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-full">
              <Star className="h-3 w-3 mr-2" />
              Featured
            </span>
          )}
        </div>

        <h1 className="text-4xl font-normal text-gray-900 leading-tight tracking-tight">
          {product.name}
        </h1>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center ${
                wishlistChecked[product?._id]
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
              }`}
              title={
                wishlistChecked[product?._id]
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
            >
              <Heart
                className={`h-5 w-5 ${
                  wishlistChecked[product?._id] ? "fill-current" : ""
                }`}
              />
            </button>
            <div className="relative">
              <button
                onClick={handleShare}
                onMouseEnter={() => setShowShareTooltip(true)}
                onMouseLeave={() => setShowShareTooltip(false)}
                className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center ${
                  copySuccess
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
                }`}
                title="Share product"
              >
                {copySuccess ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
              </button>

              {/* Share Tooltip */}
              {showShareTooltip && !copySuccess && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl z-50 animate-fade-in">
                  Click to copy product link
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-4">
        <div className="flex items-baseline space-x-4">
          {product.discountPrice ? (
            <>
              <div className="space-y-1">
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl font-light text-gray-900">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="inline-flex items-center px-4 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                  Save {discountPercentage}% •{" "}
                  {formatPrice(product.price - product.discountPrice)}
                </div>
              </div>
            </>
          ) : (
            <span className="text-5xl font-light text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Shipping Fee Display */}
        {product.shippingFee > 0 && (
          <div className="flex items-center gap-2 text-gray-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              ></path>
            </svg>
            <span>Shipping fee: {formatPrice(product.shippingFee)}</span>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              product.stock > 10
                ? "bg-green-50 text-green-700"
                : product.stock > 0
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                product.stock > 10
                  ? "bg-green-500"
                  : product.stock > 0
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />
            {product.stock > 10
              ? "In Stock"
              : product.stock > 0
                ? "Low Stock"
                : "Out of Stock"}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Description
        </h3>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
        </div>
      </div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Product Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      {product.stock > 0 ? (
        <div className="space-y-8 pt-8 border-t border-gray-100">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <span className="text-sm text-gray-500">
                  Max: {product.stock}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl">−</span>
                  </button>
                  <span className="px-8 py-3 border-x border-gray-300 text-xl min-w-[100px] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl">+</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-600">Total</div>
                  <div className="text-sm text-gray-500">Including VAT</div>
                </div>
                <span className="text-3xl font-light text-gray-900">
                  {formatPrice(
                    (product.discountPrice || product.price) * quantity,
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons - Updated with Buy Now */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl text-lg font-medium transition-colors shadow-sm hover:shadow flex items-center justify-center gap-3"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Add to Cart
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={isBuyNowLoading}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-lg font-medium transition-colors shadow-sm hover:shadow flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isBuyNowLoading ? (
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>

              {/* Quick Quantity Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setQuantity(Math.min(product.stock, 3))}
                  className="py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Add 3
                </button>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, 5))}
                  className="py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Add 5
                </button>
                <button
                  onClick={() => setQuantity(product.stock)}
                  className="py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Add All
                </button>
              </div>

              {/* Buy Now Explanation */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      Buy Now Feature
                    </h4>
                    <p className="text-xs text-blue-700">
                      Click "Buy Now" to add this item to your cart and proceed
                      directly to checkout. This saves time if you're ready to
                      purchase immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
            {[
              {
                icon: Shield,
                label: "2-Year Warranty",
                desc: "Full coverage",
              },
              {
                icon: RefreshCw,
                label: "30-Day Returns",
                desc: "Easy process",
              },
              {
                icon: Globe,
                label: "Worldwide Delivery",
                desc: "International",
              },
              {
                icon: Truck,
                label: "Fast Shipping",
                desc: "2-3 business days",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="p-3 bg-gray-100 rounded-lg">
                  <feature.icon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {feature.label}
                  </div>
                  <div className="text-sm text-gray-500">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full">
              <Check className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h4 className="text-xl font-semibold text-red-700 mb-3">
            Out of Stock
          </h4>
          <p className="text-red-600 mb-6">
            This product is currently unavailable
          </p>
          <button className="w-full py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
            Notify When Available
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
