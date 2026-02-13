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

  const StarRatingDisplay = ({ rating, showCount = true, size = "sm" }) => {
    if (!rating || rating === 0) return null;

    const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`${starSize} ${
                star <= Math.round(rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span
          className={`${
            size === "sm" ? "text-xs" : "text-sm"
          } text-gray-600 ml-1 font-medium`}
        >
          {rating.toFixed(1)}
        </span>
        {showCount && product.ratingsCount > 0 && (
          <span
            className={`${
              size === "sm" ? "text-xs" : "text-sm"
            } text-gray-400 ml-1`}
          >
            ({product.ratingsCount})
          </span>
        )}
      </div>
    );
  };

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
      className={`group relative bg-white rounded-xl overflow-hidden transition-all duration-500 hover:shadow-xl border border-gray-100 hover:border-primary-100 hover:-translate-y-1 ${
        product.isAliExpress ? "border-orange-200 hover:border-orange-300" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <Link to={`/product/${product._id}`} className="block">
          <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={product.images?.[0]?.url || ""}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            ></div>

            <div
              className={`absolute inset-x-4 top-4 flex justify-between transition-all duration-300 ${
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
            >
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${
                  wishlistChecked[product._id] || isWishlisted
                    ? "bg-white text-red-500 border border-red-200"
                    : "bg-white/90 text-gray-700 hover:bg-white border border-white/20"
                }`}
              >
                <FaHeart
                  className={`w-3.5 h-3.5 ${
                    wishlistChecked[product._id] || isWishlisted
                      ? "fill-red-500"
                      : ""
                  }`}
                />
              </button>

              {discountPercentage > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg border border-red-400">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>

            {product.isAliExpress && <AliExpressBadge />}

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="text-gray-900 font-bold text-base mb-1">
                    Out of Stock
                  </div>
                  <div className="text-gray-500 text-xs">
                    Currently Unavailable
                  </div>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-3">
        {/* Category */}
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            {product.category}
          </span>
          {product.isAliExpress && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 ml-2">
              <FaGlobe className="w-2.5 h-2.5" />
              <span>AliExpress</span>
            </div>
          )}
        </div>

        {/* Brand (left) and Rating (right) */}
        <div className="flex items-center justify-between mb-2">
          {product.brand && (
            <div className="text-xs text-primary-600 font-semibold">
              {product.brand}
            </div>
          )}
          {product.averageRating > 0 && (
            <div className="flex-shrink-0">
              <StarRatingDisplay
                rating={product.averageRating}
                showCount={true}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm font-normal text-gray-900 mb-2 line-clamp-2 leading-relaxed hover:text-primary-600 transition-colors min-h-[35px]">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock (left) and Shipping (right) */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                product.stock === 0
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

          {product.shippingFee > 0 && (
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3 h-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
              <span className="text-xs text-gray-500 font-medium">
                Shipping: {formatPrice(product.shippingFee)}
              </span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900 hover:shadow-md transform hover:-translate-y-0.5"
          }`}
        >
          <FaShoppingCart className="w-3.5 h-3.5" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
