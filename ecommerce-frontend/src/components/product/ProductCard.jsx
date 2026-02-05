import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/slices/cart.slice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/slices/wishlist.slice";
import { formatPrice } from "../../utils/formatPrice";
import { FaShoppingCart, FaEye, FaHeart } from "react-icons/fa";
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
        shippingFee: product.shippingFee || 0, // FIXED: Add shipping fee here
        image: product.images?.[0]?.url || "",
        quantity: 1,
      }),
    );
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

  const hasLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${product._id}`} className="block">
          {/* Main Image */}
          <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
            <img
              src={product.images?.[0]?.url || ""}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Hover Overlay */}
            <div
              className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
            ></div>

            {/* Quick Actions */}
            <div
              className={`absolute inset-x-4 top-4 flex justify-between transition-all duration-300 ${
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
            >
              {/* Wishlist */}
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                  wishlistChecked[product._id] || isWishlisted
                    ? "bg-white text-red-500"
                    : "bg-white/90 text-gray-700 hover:bg-white"
                }`}
              >
                <FaHeart
                  className={`w-4 h-4 ${wishlistChecked[product._id] || isWishlisted ? "fill-red-500" : ""}`}
                />
              </button>

              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="bg-primary-600 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* Quick View Button */}
            <div
              className={`absolute inset-x-4 bottom-4 transition-all duration-300 ${
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickView(true);
                }}
                className="w-full bg-white text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <FaEye className="w-4 h-4" />
                Quick View
              </button>
            </div>

            {/* Out of Stock Overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/95 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-900 font-bold text-lg">
                    Out of Stock
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    Currently Unavailable
                  </div>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="mb-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {product.category}
          </div>
          {product.brand && (
            <div className="text-xs text-primary-600 font-medium mt-1">
              {product.brand}
            </div>
          )}
        </div>

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm font-normal text-gray-900 mb-3 line-clamp-2 leading-relaxed hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-medium text-gray-900">
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
          <div className="flex items-center gap-1 mb-2">
            <svg
              className="w-3 h-3 text-gray-500"
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
            <span className="text-xs text-gray-500">
              Shipping: {formatPrice(product.shippingFee)}
            </span>
          </div>
        )}

        {/* Stock Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-2 h-2 rounded-full ${
              product.stock === 0
                ? "bg-red-500"
                : product.stock <= 5
                  ? "bg-orange-500"
                  : "bg-primary-500"
            }`}
          />
          <span className="text-xs text-gray-600">
            {product.stock === 0
              ? "Out of stock"
              : product.stock <= 5
                ? `${product.stock} left`
                : "In stock"}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-black"
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowQuickView(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowQuickView(false)}
              className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Image */}
                <div className="lg:w-2/5">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={product.images?.[0]?.url || ""}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="lg:w-3/5">
                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                        {product.category}
                      </div>
                      <h2 className="text-2xl font-light text-gray-900 mb-2">
                        {product.name}
                      </h2>
                      {product.brand && (
                        <div className="text-sm text-gray-600 mb-4">
                          by {product.brand}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-light text-gray-900">
                        {formatPrice(product.discountPrice || product.price)}
                      </span>
                      {product.discountPrice && (
                        <>
                          <span className="text-xl text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-sm text-primary-600">
                            Save {discountPercentage}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Shipping Fee Display */}
                    {product.shippingFee > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
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
                        <span>
                          Shipping fee: {formatPrice(product.shippingFee)}
                        </span>
                      </div>
                    )}

                    {/* Stock */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          product.stock === 0
                            ? "bg-red-500"
                            : product.stock <= 5
                              ? "bg-orange-500"
                              : "bg-primary-500"
                        }`}
                      />
                      <span className="text-sm text-gray-600">
                        {product.stock === 0
                          ? "Currently unavailable"
                          : product.stock <= 5
                            ? `Only ${product.stock} items left in stock`
                            : "Available in stock"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-4">
                      <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className={`w-full py-4 rounded-lg text-base font-medium transition-all ${
                          product.stock === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-black"
                        }`}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>

                      <div className="flex gap-3">
                        <button
                          onClick={toggleWishlist}
                          disabled={wishlistLoading}
                          className={`w-1/2 py-4 rounded-lg text-base font-medium transition-all flex items-center justify-center gap-2 ${
                            wishlistChecked[product._id] || isWishlisted
                              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                              : "bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <FaHeart
                            className={`w-5 h-5 ${wishlistChecked[product._id] || isWishlisted ? "fill-red-500" : ""}`}
                          />
                          {wishlistChecked[product._id] || isWishlisted
                            ? "In Wishlist"
                            : "Add to Wishlist"}
                        </button>

                        <Link
                          to={`/product/${product._id}`}
                          onClick={() => setShowQuickView(false)}
                          className="w-1/2 py-4 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors text-base font-medium text-center block"
                        >
                          View Full Details
                        </Link>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="pt-6 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span>Easy Returns</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span>Quality Guarantee</span>
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
