// ecommerce-frontend/src/components/product/ProductCard.jsx
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/slices/cart.slice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/slices/wishlist.slice";
import { formatPrice } from "../../utils/formatPrice";
import {
  FaShoppingCart,
  FaEye,
  FaHeart,
  FaGlobe,
  FaStar,
} from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistChecked, loading: wishlistLoading } = useSelector(
    (state) => state.wishlist,
  );
  const [showQuickView, setShowQuickView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        shippingFee: product.shippingFee || 0,
        image: product.images?.[0]?.url || "",
        quantity: 1,
      }),
    );
    toast.success("Added to cart!");
  };

  // Toggle wishlist function
  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist");
      return;
    }

    const isInWishlist = wishlistChecked[product._id];

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id))
        .unwrap()
        .then(() => {
          toast.success("Removed from wishlist");
          setIsWishlisted(false);
        })
        .catch((error) => {
          console.error("Failed to remove from wishlist:", error);
          toast.error(error || "Failed to remove from wishlist");
        });
    } else {
      dispatch(addToWishlist(product._id))
        .unwrap()
        .then(() => {
          toast.success("Added to wishlist");
          setIsWishlisted(true);
        })
        .catch((error) => {
          console.error("Failed to add to wishlist:", error);
          toast.error(error || "Failed to add to wishlist");
        });
    }
  };

  if (!product.isVisible) {
    return null;
  }

  const discountPercentage = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

  // Star Rating Component for Product Card - UPDATED: Remove "No reviews yet" text
  const StarRatingDisplay = ({ rating, showCount = true, size = "sm" }) => {
    // If rating is 0 or undefined, return null (show nothing)
    if (!rating || rating === 0) return null;

    const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`${starSize} ${star <= Math.round(rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
                }`}
            />
          ))}
        </div>
        <span
          className={`${size === "sm" ? "text-xs" : "text-sm"} text-gray-600 ml-1 font-medium`}
        >
          {rating.toFixed(1)}
        </span>
        {showCount && product.ratingsCount > 0 && (
          <span
            className={`${size === "sm" ? "text-xs" : "text-sm"} text-gray-400 ml-1`}
          >
            ({product.ratingsCount})
          </span>
        )}
      </div>
    );
  };

  // AliExpress badge component
  const AliExpressBadge = () => (
    <div className="absolute top-4 left-4 z-10">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg border border-orange-400">
        <FaGlobe className="w-3 h-3" />
        <span>AliExpress</span>
      </div>
    </div>
  );

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-primary-100 hover:-translate-y-2 ${product.isAliExpress ? "border-orange-200 hover:border-orange-300" : ""
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${product._id}`} className="block">
          {/* Main Image */}
          <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={product.images?.[0]?.url || ""}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
                }`}
            ></div>

            {/* Quick Actions */}
            <div
              className={`absolute inset-x-4 top-4 flex justify-between transition-all duration-300 ${isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
                }`}
            >
              {/* Wishlist */}
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg ${wishlistChecked[product._id] || isWishlisted
                    ? "bg-white text-red-500 border border-red-200"
                    : "bg-white/90 text-gray-700 hover:bg-white border border-white/20"
                  }`}
              >
                <FaHeart
                  className={`w-4 h-4 ${wishlistChecked[product._id] || isWishlisted ? "fill-red-500" : ""
                    }`}
                />
              </button>

              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-red-400">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* AliExpress Badge */}
            {product.isAliExpress && <AliExpressBadge />}

            {/* Quick View Button */}
            <div
              className={`absolute inset-x-4 bottom-4 transition-all duration-300 ${isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
                }`}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickView(true);
                }}
                className="w-full bg-white text-gray-900 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border border-gray-100"
              >
                <FaEye className="w-4 h-4" />
                Quick View
              </button>
            </div>

            {/* Out of Stock Overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="text-gray-900 font-bold text-lg mb-2">
                    Out of Stock
                  </div>
                  <div className="text-gray-500 text-sm">
                    Currently Unavailable
                  </div>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-5">
        {/* Category & Brand */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              {product.category}
            </span>
            {product.isAliExpress && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
                <FaGlobe className="w-2.5 h-2.5" />
                <span>AliExpress</span>
              </div>
            )}
          </div>
          {product.brand && (
            <div className="text-xs text-primary-600 font-semibold">
              {product.brand}
            </div>
          )}
        </div>

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm font-normal text-gray-900 mb-3 line-clamp-2 leading-relaxed hover:text-primary-600 transition-colors min-h-[40px]">
            {product.name}
          </h3>
        </Link>

        {/* Star Rating - UPDATED: Only show if there are reviews */}
        {product.averageRating > 0 && (
          <div className="mb-3">
            <StarRatingDisplay
              rating={product.averageRating}
              showCount={true}
              size="sm"
            />
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Shipping Fee Display */}
        {product.shippingFee > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <svg
              className="w-3.5 h-3.5 text-gray-500"
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
            <span className="text-xs text-gray-500 font-medium">
              Shipping: {formatPrice(product.shippingFee)}
            </span>
          </div>
        )}

        {/* Stock Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-2 h-2 rounded-full ${product.stock === 0
                ? "bg-red-500 animate-pulse"
                : product.stock <= 5
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
          />
          <span className="text-xs text-gray-600 font-medium">
            {product.stock === 0
              ? "Out of stock"
              : product.stock <= 5
                ? `${product.stock} left - Hurry!`
                : "In stock"}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900 hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
        >
          <FaShoppingCart className="w-4 h-4" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowQuickView(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowQuickView(false)}
              className="absolute top-6 right-6 z-10 p-2.5 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Image */}
                <div className="lg:w-2/5">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
                    <img
                      src={product.images?.[0]?.url || ""}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="lg:w-3/5">
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                          {product.category}
                        </div>
                        {product.isAliExpress && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full border border-orange-400">
                            <FaGlobe className="w-3 h-3" />
                            <span>AliExpress</span>
                          </div>
                        )}
                      </div>
                      <h2 className="text-3xl font-light text-gray-900 mb-3">
                        {product.name}
                      </h2>
                      {product.brand && (
                        <div className="text-base text-gray-600 mb-3">
                          by <span className="font-semibold">{product.brand}</span>
                        </div>
                      )}

                      {/* Star Rating in Quick View - UPDATED: Only show if there are reviews */}
                      {product.averageRating > 0 && (
                        <div className="flex items-center mb-5">
                          <StarRatingDisplay
                            rating={product.averageRating}
                            showCount={true}
                            size="md"
                          />
                        </div>
                      )}
                    </div>

                    {/* AliExpress Delivery Notice in Quick View */}
                    {product.isAliExpress && (
                      <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                              <FaGlobe className="h-6 w-6 text-orange-600" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-orange-800 mb-2">
                              Important Delivery Information
                            </h4>
                            <ul className="space-y-2 text-sm text-orange-700">
                              <li className="flex items-center gap-2">
                                <span className="font-semibold">
                                  • Delivery Time:
                                </span>
                                10–20 days
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="font-semibold">
                                  • Order Confirmation:
                                </span>
                                Phone call required
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="font-semibold">• Contact:</span>
                                Ensure your phone is updated
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(product.discountPrice || product.price)}
                      </span>
                      {product.discountPrice && (
                        <>
                          <span className="text-xl text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-sm text-primary-600 font-bold bg-primary-50 px-3 py-1 rounded-full">
                            Save {discountPercentage}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Shipping Fee Display */}
                    {product.shippingFee > 0 && (
                      <div className="flex items-center gap-3 text-base text-gray-600">
                        <svg
                          className="w-5 h-5"
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
                        <span className="font-medium">
                          Shipping fee: {formatPrice(product.shippingFee)}
                        </span>
                      </div>
                    )}

                    {/* Stock */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${product.stock === 0
                            ? "bg-red-500 animate-pulse"
                            : product.stock <= 5
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                      />
                      <span className="text-base text-gray-600 font-medium">
                        {product.stock === 0
                          ? "Currently unavailable"
                          : product.stock <= 5
                            ? `Only ${product.stock} items left in stock - Order soon!`
                            : "Available in stock"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 pt-6">
                      <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className={`w-full py-4 rounded-xl text-base font-semibold transition-all ${product.stock === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900 hover:shadow-xl transform hover:-translate-y-1"
                          }`}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>

                      <div className="flex gap-4">
                        <button
                          onClick={toggleWishlist}
                          disabled={wishlistLoading}
                          className={`w-1/2 py-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-3 ${wishlistChecked[product._id] || isWishlisted
                              ? "bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100"
                              : "bg-gray-50 text-gray-700 border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
                            }`}
                        >
                          <FaHeart
                            className={`w-5 h-5 ${wishlistChecked[product._id] || isWishlisted ? "fill-red-500" : ""
                              }`}
                          />
                          {wishlistChecked[product._id] || isWishlisted
                            ? "In Wishlist"
                            : "Add to Wishlist"}
                        </button>

                        <Link
                          to={`/product/${product._id}`}
                          onClick={() => setShowQuickView(false)}
                          className="w-1/2 py-4 rounded-xl border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 text-base font-semibold text-center block hover:shadow-lg"
                        >
                          View Full Details
                        </Link>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="pt-8 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <span className="font-medium">Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <span className="font-medium">Easy Returns</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <span className="font-medium">Quality Guarantee</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <span className="font-medium">24/7 Support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;