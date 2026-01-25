import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cart.slice";
import { formatPrice } from "../../utils/formatPrice";
import { FaShoppingCart, FaHeart, FaEye } from "react-icons/fa";
import { Star, TruckIcon } from "lucide-react";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.images?.[0]?.url || "",
        quantity: 1,
      }),
    );
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
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
  const isFreeShipping = product.price >= 50; // Example threshold

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group relative border border-gray-100">
      <Link to={`/product/${product._id}`} className="block">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden bg-gray-50">
          <img
            src={product.images?.[0]?.url || ""}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Badges Container */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isFeatured && (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </div>
            )}
            {discountPercentage > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                -{discountPercentage}% OFF
              </div>
            )}
            {hasLowStock && (
              <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                Only {product.stock} left!
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-full shadow-lg transition-all ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 hover:bg-red-500 hover:text-white"
              }`}
              title="Add to Wishlist"
            >
              <FaHeart className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-primary-600 hover:text-white transition-all"
              title="Quick View"
            >
              <FaEye className="h-4 w-4" />
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white px-6 py-3 rounded-lg shadow-xl">
                <span className="text-gray-800 font-bold text-base">
                  Out of Stock
                </span>
              </div>
            </div>
          )}

          {/* Image Count Indicator */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium">
              1/{product.images.length}
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-xs">
          {product.brand && (
            <span className="text-gray-500 font-medium uppercase tracking-wide">
              {product.brand}
            </span>
          )}
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
            {product.tags.length > 2 && (
              <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md font-medium">
                +{product.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="pt-2 border-t border-gray-100">
          {product.discountPrice ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-sm text-gray-400 line-through font-medium">
                  {formatPrice(product.price)}
                </span>
              </div>
              <p className="text-xs text-green-600 font-medium">
                You save {formatPrice(product.price - product.discountPrice)}
              </p>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </p>
          )}
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs">
          <span
            className={`font-medium ${
              product.stock === 0
                ? "text-red-600"
                : product.stock <= 5
                  ? "text-orange-600"
                  : "text-green-600"
            }`}
          >
            {product.stock === 0
              ? "Out of stock"
              : product.stock <= 5
                ? `Only ${product.stock} left`
                : "In stock"}
          </span>
          {isFreeShipping && (
            <span className="flex items-center text-blue-600 font-medium">
              <TruckIcon className="h-3 w-3 mr-1" />
              Free Shipping
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
            product.stock === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          <FaShoppingCart className="h-4 w-4" />
          <span>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
