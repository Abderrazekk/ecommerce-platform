import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cart.slice";
import { formatPrice } from "../../utils/formatPrice";
import { FaShoppingCart, FaHeart, FaEye } from "react-icons/fa";
import { Truck, Zap, Shield, CheckCircle } from "lucide-react";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      })
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
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const hasLowStock = product.stock > 0 && product.stock <= 5;
  const isFreeShipping = product.price >= 50;
  const rating = product.rating || 4.5;

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-primary-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <Link to={`/product/${product._id}`} className="block relative h-64">
          {/* Main Image */}
          <div className="relative h-full overflow-hidden">
            <img
              src={product.images?.[0]?.url || ""}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Secondary Image on Hover */}
            {product.images?.[1] && (
              <img
                src={product.images[1].url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100"
              />
            )}
          </div>

          {/* Top Left Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isFeatured && (
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Zap className="h-3 w-3" />
                <span>Featured</span>
              </div>
            )}
            {discountPercentage > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                -{discountPercentage}%
              </div>
            )}
          </div>

          {/* Top Right Actions */}
          <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <button
              onClick={handleWishlist}
              className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${
                isWishlisted
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-200"
                  : "bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500"
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
              className="p-2.5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-primary-50 hover:text-primary-600 transition-all duration-300"
              title="Quick View"
            >
              <FaEye className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Badges */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            {hasLowStock && (
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                ⚠️ Only {product.stock} left
              </div>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white px-6 py-3 rounded-xl shadow-2xl transform -rotate-3">
                <span className="text-gray-900 font-bold text-lg tracking-tight">
                  SOLD OUT
                </span>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Product Content */}
      <div className="p-5 space-y-4">
        {/* Brand & Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.brand && (
              <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                {product.brand}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-all line-clamp-2 leading-tight group-hover:translate-x-1 duration-300">
            {product.name}
          </h3>
        </Link>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {product.features?.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
              <CheckCircle className="h-3 w-3 text-primary-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Price Section */}
        <div className="pt-2 space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <>
                <span className="text-lg text-gray-400 line-through font-medium">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  Save {formatPrice(product.price - product.discountPrice)}
                </span>
              </>
            )}
          </div>
          
        </div>

        {/* Stock & Shipping */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${product.stock === 0 ? 'bg-red-500' : product.stock <= 5 ? 'bg-orange-500' : 'bg-green-500'}`} />
            <span className="text-xs font-medium">
              {product.stock === 0
                ? "Out of stock"
                : product.stock <= 5
                ? `Low stock (${product.stock})`
                : "In stock"}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 transform ${
            product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          }`}
        >
          <FaShoppingCart className="h-5 w-5" />
          <span className="text-sm">
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </span>
        </button>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-4xl mx-4">
            <h3>Quick View</h3>
            <button onClick={() => setShowQuickView(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;