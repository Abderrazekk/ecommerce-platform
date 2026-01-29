import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchWishlist, removeFromWishlist } from "../redux/slices/auth.slice";
import { addToCart } from "../redux/slices/cart.slice";
import { FaHeart, FaShoppingCart, FaArrowLeft, FaTrash, FaRegHeart } from "react-icons/fa";
import { formatPrice } from "../utils/formatPrice";
import { toast } from "react-hot-toast";

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, wishlist, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    dispatch(fetchWishlist());
  }, [isAuthenticated, navigate, dispatch]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.images?.[0]?.url || "",
        quantity: 1,
      })
    );
    toast.success("Added to cart!");
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach(product => {
      if (product.stock > 0) {
        dispatch(
          addToCart({
            product: product._id,
            name: product.name,
            price: product.discountPrice || product.price,
            image: product.images?.[0]?.url || "",
            quantity: 1,
          })
        );
      }
    });
    toast.success("All available items added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary-600 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-2">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            {wishlist.length > 0 && (
              <button
                onClick={handleMoveAllToCart}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FaShoppingCart />
                Add All to Cart
              </button>
            )}
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
              <FaRegHeart className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love for later. Add items to your wishlist and they'll appear here.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FaShoppingCart />
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Product
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Stock
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {wishlist.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.images?.[0]?.url || ""}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <Link
                              to={`/product/${product._id}`}
                              className="font-medium text-gray-900 hover:text-primary-600"
                            >
                              {product.name}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              {product.brand} • {product.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold">
                            {formatPrice(product.discountPrice || product.price)}
                          </span>
                          {product.discountPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.stock === 0
                              ? "bg-red-100 text-red-800"
                              : product.stock <= 5
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of Stock"
                            : product.stock <= 5
                            ? `Low Stock (${product.stock})`
                            : "In Stock"}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              product.stock === 0
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                            }`}
                          >
                            <FaShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(product._id)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Grid View */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
              {wishlist.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={product.images?.[0]?.url || ""}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <Link
                          to={`/product/${product._id}`}
                          className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {product.brand}
                        </p>
                        <div className="mt-2">
                          <span className="text-lg font-bold">
                            {formatPrice(product.discountPrice || product.price)}
                          </span>
                          {product.discountPrice && (
                            <span className="text-sm text-gray-400 line-through ml-2">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock === 0
                            ? "bg-red-100 text-red-800"
                            : product.stock <= 5
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {product.stock === 0
                          ? "Out of Stock"
                          : product.stock <= 5
                          ? `Low Stock`
                          : "In Stock"}
                      </span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className={`p-2 rounded-lg ${
                            product.stock === 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                          }`}
                        >
                          <FaShoppingCart className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;