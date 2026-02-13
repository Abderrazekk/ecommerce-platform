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
  Wallet,
} from "lucide-react";
import StarRating from "../common/StarRating";
import DOMPurify from "dompurify";

const ProductInfo = ({
  product,
  wishlistChecked,
  wishlistLoading,
  selectedColor,
  setSelectedColor,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleWishlist = async () => {
    if (!product) return;

    const isInWishlist = wishlistChecked[product._id];

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
      toast.error(error?.message || "Failed to update wishlist");
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        shippingFee: product.shippingFee || 0,
        image: product.images?.[0]?.url || "",
        quantity,
      }),
    );
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (!product) return;

    setIsBuyNowLoading(true);

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        shippingFee: product.shippingFee || 0,
        image: product.images?.[0]?.url || "",
        quantity,
      }),
    );

    toast.success("Added to cart! Redirecting to checkout...");

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
      setTimeout(() => setCopySuccess(false), 2000);
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
        setTimeout(() => setCopySuccess(false), 2000);
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

  // Color selector render
  const renderColorSelector = () => {
    if (!product.colors || product.colors.length === 0) return null;

    return (
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-700">Colors : </h3>
        <div className="flex flex-wrap items-center gap-2">
          {product.colors.map((color) => (
            <button
              key={color.hex + color.name}
              onClick={() => setSelectedColor(color)}
              className={`
              w-8 h-8 rounded-full border-2 transition-all
              ${
                selectedColor?.hex === color.hex
                  ? "border-gray-900 scale-110 ring-offset-2"
                  : "border-gray-300 hover:scale-105"
              }
            `}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Product Name + Rating */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 leading-tight tracking-tight">
          {product.name}
        </h1>
        {/* Right side: wishlist & share icons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`relative p-2.5 rounded-full border transition-all duration-200 ${
              wishlistChecked[product?._id]
                ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50"
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
              className={`p-2.5 rounded-full border transition-all duration-200 ${
                copySuccess
                  ? "bg-green-50 border-green-200 text-green-600"
                  : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
              title="Share product"
            >
              {copySuccess ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Share2 className="h-5 w-5" />
              )}
            </button>

            {showShareTooltip && !copySuccess && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-40 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl z-50 animate-fade-in">
                Click to copy link
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Color Selector + Wishlist & Share */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left side: color selector (if exists) */}
        <div className="flex-1">{renderColorSelector()}</div>

        <div className="flex-shrink-0">
          {product.averageRating > 0 ? (
            <div className="flex items-center space-x-2">
              <StarRating
                rating={product.averageRating}
                readOnly
                showNumber
                size="md"
              />
              <span className="text-sm text-gray-600 whitespace-nowrap">
                ({product.ratingsCount}{" "}
                {product.ratingsCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No reviews yet</div>
          )}
        </div>
      </div>

      {/* Row 3: Price */}
      <div className="flex items-baseline flex-wrap gap-3">
        {product.discountPrice ? (
          <>
            <span className="text-3xl lg:text-4xl font-light text-gray-900">
              {formatPrice(product.discountPrice)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(product.price)}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 bg-red-600 text-white rounded-full text-xs font-bold shadow-sm">
              Save {discountPercentage}%
            </span>
          </>
        ) : (
          <span className="text-3xl lg:text-4xl font-light text-gray-900">
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      {/* Row 4: Stock Status + Shipping */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Stock status */}
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
            product.stock > 10
              ? "bg-green-50 text-green-700 border border-green-200"
              : product.stock > 0
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse-slow"
                : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-1.5 ${
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
              ? `Low Stock (${product.stock} left)`
              : "Out of Stock"}
        </div>

        {/* Shipping fee */}
        {product.shippingFee > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Truck className="h-4 w-4" />
            <span>Shipping: {formatPrice(product.shippingFee)}</span>
          </div>
        )}
      </div>

      {/* AliExpress Delivery Notice (if applicable) */}
      {product.isAliExpress && (
        <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Globe className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-orange-800 mb-0.5">
                AliExpress Product – Delivery Info
              </h3>
              <p className="text-xs text-orange-700">
                Delivery: 10–20 days • Phone confirmation required within 24h.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Row 5: Description */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Description
        </h3>
        {product.description ? (
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(product.description),
            }}
          />
        ) : (
          <p className="text-sm text-gray-500 italic">No description</p>
        )}
      </div>

      {/* Tags (if any) */}
      {product.tags && product.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-50 text-gray-600 text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      {product.stock > 0 ? (
        <div className="space-y-6 pt-4 border-t border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <span className="text-xs text-gray-500">
                Max: {product.stock}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                  <span className="text-lg font-medium">−</span>
                </button>
                <span className="px-6 py-2.5 border-x border-gray-300 text-lg min-w-[80px] text-center font-medium bg-white">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-4 py-2.5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                  <span className="text-lg font-medium">+</span>
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-800 font-bold">Total</div>
                </div>
                <span className="text-2xl lg:text-3xl font-light text-gray-900">
                  {formatPrice(
                    (product.discountPrice || product.price) * quantity,
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-button hover:shadow-button-hover hover:-translate-y-0.5"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isBuyNowLoading}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 shadow-button hover:shadow-button-hover hover:-translate-y-0.5"
                >
                  {isBuyNowLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>

              {/* Quick Quantity Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setQuantity(Math.min(product.stock, 3))}
                  className="py-2.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Add 3
                </button>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, 5))}
                  className="py-2.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Add 5
                </button>
                <button
                  onClick={() => setQuantity(product.stock)}
                  className="py-2.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Add All
                </button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {[
              {
                icon: Wallet,
                label: "Cash on Delivery",
                desc: "Pay when your order arrives",
              },

              {
                icon: RefreshCw,
                label: "3-Day Returns",
                desc: "Easy process",
              },
              {
                icon: Globe,
                label: "Tunisia-wide Delivery",
                desc: "All over Tunisia",
              },
              {
                icon: Truck,
                label: "Fast Shipping",
                desc: "2-3 business days",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <feature.icon className="h-4 w-4 text-gray-600 group-hover:text-gray-900" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">
                    {feature.label}
                  </div>
                  <div className="text-xs text-gray-500">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-red-50/80 border border-red-200 rounded-xl p-6 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Check className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h4 className="text-base font-medium text-red-700 mb-2">
            Out of Stock
          </h4>
          <p className="text-sm text-red-600 mb-4">
            This product is currently unavailable
          </p>
          <button className="w-full py-2.5 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
            Notify When Available
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
