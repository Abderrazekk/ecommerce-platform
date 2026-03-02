import { Link, useNavigate } from "react-router-dom";
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
  FaBolt,
} from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistChecked, loading: wishlistLoading } = useSelector(
    (state) => state.wishlist,
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

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
    toast.success("Added to cart");
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product || product.stock === 0) return;

    setIsBuyNowLoading(true);
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
    toast.success("Redirecting to checkout...");

    setTimeout(() => {
      navigate("/checkout");
      setIsBuyNowLoading(false);
    }, 1000);
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast("Please login to add items to your wishlist");
      return;
    }

    const isInWishlist = wishlistChecked[product._id];

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id))
        .unwrap()
        .then(() => {
          setIsWishlisted(false);
        })
        .catch((error) => {
          console.error("Failed to remove from wishlist:", error);
          toast("Failed to remove from wishlist");
        });
    } else {
      dispatch(addToWishlist(product._id))
        .unwrap()
        .then(() => {
          setIsWishlisted(true);
        })
        .catch((error) => {
          console.error("Failed to add to wishlist:", error);
          toast("Failed to add to wishlist");
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

  const StarRatingDisplay = ({ rating, size = "sm" }) => {
    if (!rating || rating === 0) return null;

    const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

    return (
      <>
        {/* Mobile version: single star + rating */}
        <div className="flex items-center gap-1 md:hidden">
          <FaStar className={`${starSize} text-yellow-400 fill-yellow-400`} />
          <span
            className={`${
              size === "sm" ? "text-xs" : "text-sm"
            } text-gray-600 font-medium`}
          >
            {rating.toFixed(1)}
          </span>
        </div>

        {/* Desktop version: five stars + rating */}
        <div className="hidden md:flex items-center gap-1">
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
        </div>
      </>
    );
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-200 hover:border-primary-200 hover:-translate-y-1 flex flex-col h-full ${
        product.isAliExpress ? "border-orange-200 hover:border-orange-300" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50">
        <Link to={`/product/${product._id}`} className="block aspect-square">
          <img
            src={product.images?.[0]?.url || ""}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Subtle overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Hover badges (wishlist, discount, AliExpress) */}
          <div
            className={`absolute inset-0 p-2 flex flex-col justify-between pointer-events-none transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Top row: wishlist (left) and discount (right) */}
            <div className="flex justify-between items-start pointer-events-auto">
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`p-2 rounded-full backdrop-blur-sm transition-all shadow-md ${
                  wishlistChecked[product._id] || isWishlisted
                    ? "bg-white text-red-500 border border-red-200"
                    : "bg-white/90 text-gray-700 hover:bg-white border border-white/20"
                }`}
                aria-label="Add to wishlist"
              >
                <FaHeart
                  className={`w-4 h-4 ${
                    wishlistChecked[product._id] || isWishlisted
                      ? "fill-red-500"
                      : ""
                  }`}
                />
              </button>

              {discountPercentage > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg border border-red-400">
                  -{discountPercentage}%
                </div>
              )}
            </div>

            {/* Bottom row: AliExpress badge (left) */}
            {product.isAliExpress && (
              <div className="flex justify-start pointer-events-auto">
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg border border-orange-400">
                  <FaGlobe className="w-3 h-3" />
                  <span>AliExpress</span>
                </div>
              </div>
            )}
          </div>

          {/* Out of stock overlay (always on top) */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="text-center">
                <div className="text-gray-900 font-bold text-base mb-1">
                  Out of Stock
                </div>
                <div className="text-gray-500 text-xs">
                  Currently Unavailable
                </div>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex-1 space-y-2">
          {/* Brand & Rating */}
          <div className="flex items-center justify-between min-h-[24px]">
            {product.brand ? (
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide truncate max-w-[60%]">
                {product.brand}
              </span>
            ) : (
              <span className="invisible text-xs">Placeholder</span>
            )}
            {product.averageRating > 0 ? (
              <StarRatingDisplay rating={product.averageRating} size="sm" />
            ) : (
              <span className="invisible text-xs">Rating</span>
            )}
          </div>

          {/* Product Name */}
          <Link to={`/product/${product._id}`}>
            <h3 className="text-sm font-medium text-gray-900 leading-snug hover:text-primary-600 transition-colors line-clamp-2 min-h-[40px]">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex flex-col items-start min-h-[48px]">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-gray-400 line-through self-end">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 min-h-[24px]">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                product.stock === 0
                  ? "bg-red-500 animate-pulse"
                  : product.stock <= 5
                    ? "bg-orange-500"
                    : "bg-green-500"
              }`}
            />
            <span className="text-xs font-medium text-gray-600">
              {product.stock === 0
                ? "Out of stock"
                : product.stock <= 5
                  ? `Only ${product.stock} left — order soon!`
                  : "In stock"}
            </span>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
              product.stock === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-black hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
            }`}
          >
            <FaShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="truncate">Add to Cart</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0 || isBuyNowLoading}
            className={`w-full py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
              product.stock === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
            }`}
          >
            {isBuyNowLoading ? (
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <FaBolt className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            )}
            <span className="truncate">
              {isBuyNowLoading ? "Wait..." : "Buy Now"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
