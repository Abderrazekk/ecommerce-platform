import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
  addToWishlist,
} from "../redux/slices/wishlist.slice";
import { addToCart } from "../redux/slices/cart.slice";
import { fetchFeaturedProducts } from "../redux/slices/product.slice";
import { formatPrice } from "../utils/formatPrice";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";
import {
  Heart,
  Trash2,
  ShoppingCart,
  ChevronRight,
  Package,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Star,
  Eye,
  X,
  CheckCircle,
  Plus,
  Filter,
  Search,
  Share2,
  Download,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { wishlistItems, itemCount, loading, error } = useSelector(
    (state) => state.wishlist,
  );
  const { featuredProducts } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  // Local state
  const [selectedItems, setSelectedItems] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [sortBy, setSortBy] = useState("recent"); // recent, name, price-low, price-high
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);

  // Fetch wishlist and featured products
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoadingFeatured(true);
      await dispatch(fetchFeaturedProducts());
      setIsLoadingFeatured(false);
    };
    fetchFeatured();
  }, [dispatch]);

  // Apply filters and sorting
  useEffect(() => {
    let items = [...wishlistItems];

    // Apply search filter
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.product?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.product?.brand
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.product?.category
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "name":
        items.sort((a, b) => a.product?.name?.localeCompare(b.product?.name));
        break;
      case "price-low":
        items.sort((a, b) => {
          const priceA = a.product?.discountPrice || a.product?.price || 0;
          const priceB = b.product?.discountPrice || b.product?.price || 0;
          return priceA - priceB;
        });
        break;
      case "price-high":
        items.sort((a, b) => {
          const priceA = a.product?.discountPrice || a.product?.price || 0;
          const priceB = b.product?.discountPrice || b.product?.price || 0;
          return priceB - priceA;
        });
        break;
      case "recent":
      default:
        items.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
        break;
    }

    setFilteredItems(items);
  }, [wishlistItems, searchQuery, sortBy]);

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      setSelectedItems((prev) => prev.filter((id) => id !== productId));
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  // Add item to cart
  const handleAddToCart = (item) => {
    if (!item.product) return;

    dispatch(
      addToCart({
        product: item.product._id,
        name: item.product.name,
        price: item.product.discountPrice || item.product.price,
        image: item.product.images?.[0]?.url || "",
        quantity: 1,
      }),
    );
    toast.success("Added to cart!");
  };

  // Add all to cart
  const handleAddAllToCart = () => {
    const inStockItems = wishlistItems.filter(
      (item) => item.product && item.product.stock > 0,
    );

    if (inStockItems.length === 0) {
      toast.error("No items in stock to add to cart");
      return;
    }

    inStockItems.forEach((item) => {
      dispatch(
        addToCart({
          product: item.product._id,
          name: item.product.name,
          price: item.product.discountPrice || item.product.price,
          image: item.product.images?.[0]?.url || "",
          quantity: 1,
        }),
      );
    });

    toast.success(`${inStockItems.length} item(s) added to cart!`);
  };

  // Clear wishlist
  const handleClearWishlist = async () => {
    try {
      await dispatch(clearWishlist()).unwrap();
      setSelectedItems([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
    }
  };

  // Toggle item selection
  const toggleSelectItem = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  // Remove selected items
  const removeSelectedItems = async () => {
    if (selectedItems.length === 0) return;

    const promises = selectedItems.map((productId) =>
      dispatch(removeFromWishlist(productId)),
    );

    try {
      await Promise.all(promises);
      setSelectedItems([]);
      toast.success(`${selectedItems.length} item(s) removed`);
    } catch (error) {
      console.error("Failed to remove selected items:", error);
    }
  };

  // Select all items
  const selectAllItems = () => {
    const allIds = wishlistItems
      .map((item) => item.product?._id)
      .filter(Boolean);
    setSelectedItems(allIds);
  };

  // Deselect all items
  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  // Move item between wishlist and cart
  const handleMoveToCart = async (item) => {
    if (!item.product) return;

    // Add to cart
    handleAddToCart(item);

    // Remove from wishlist
    try {
      await dispatch(removeFromWishlist(item.product._id)).unwrap();
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  // Share wishlist
  const handleShareWishlist = () => {
    const productNames = wishlistItems
      .slice(0, 5)
      .map((item) => item.product?.name)
      .filter(Boolean)
      .join(", ");

    const shareText = `Check out my wishlist with ${itemCount} items including: ${productNames}...`;

    if (navigator.share) {
      navigator.share({
        title: "My Wishlist",
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Wishlist copied to clipboard!");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-6 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-12 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Heart className="h-16 w-16 text-rose-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-8">
            Please sign in to view and manage your wishlist.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-lg"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty wishlist state
  if (itemCount === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-12 group"
          >
            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="ml-2 font-medium">Back</span>
          </button>

          {/* Empty State */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-12 text-center">
              <div className="relative mx-auto w-64 h-64 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-10 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full flex items-center justify-center">
                  <Heart className="h-24 w-24 text-rose-500" />
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Your Wishlist is Empty
              </h1>

              <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg">
                Save items you love for later. Click the heart icon on any
                product to add it here.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                  <div className="text-3xl font-bold text-blue-600">
                    {cartItems.length}
                  </div>
                  <div className="text-sm text-blue-700 font-medium mt-2">
                    Items in Cart
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600">
                    {featuredProducts?.length || 0}
                  </div>
                  <div className="text-sm text-green-700 font-medium mt-2">
                    Featured Items
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                  <div className="text-3xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-purple-700 font-medium mt-2">
                    Wishlist Items
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => navigate("/shop")}
                  className="px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-lg flex items-center justify-center"
                >
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  Start Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors mr-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    My Wishlist
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {itemCount} item{itemCount !== 1 ? "s" : ""} • Last updated
                    today
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in wishlist..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {selectedItems.length > 0 && (
                <>
                  <button
                    onClick={removeSelectedItems}
                    className="px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center shadow-lg"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Remove ({selectedItems.length})
                  </button>
                  <button
                    onClick={deselectAllItems}
                    className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                  >
                    Deselect All
                  </button>
                </>
              )}

              <button
                onClick={handleAddAllToCart}
                className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center shadow-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add All to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Stats */}
            <div className="text-center p-4 border-r border-gray-100">
              <div className="text-3xl font-bold text-rose-600">
                {itemCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Items</div>
            </div>
            <div className="text-center p-4 border-r border-gray-100">
              <div className="text-3xl font-bold text-emerald-600">
                {wishlistItems.filter((item) => item.product?.stock > 0).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">In Stock</div>
            </div>
            <div className="text-center p-4 border-r border-gray-100">
              <div className="text-3xl font-bold text-amber-600">
                {
                  wishlistItems.filter(
                    (item) =>
                      item.product?.discountPrice &&
                      item.product?.discountPrice < item.product?.price,
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">On Sale</div>
            </div>

            {/* Sort */}
            <div className="text-center p-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="recent">Recently Added</option>
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <div className="text-sm text-gray-600 mt-2">Sort By</div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={selectAllItems}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} of {itemCount} selected
                  </span>
                </div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products List */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No matching items found
            </h3>
            <p className="text-gray-600 mb-8">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const discountPercentage = product.discountPrice
                ? Math.round(
                    ((product.price - product.discountPrice) / product.price) *
                      100,
                  )
                : 0;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex"
                >
                  {/* Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product._id)}
                      onChange={() => toggleSelectItem(product._id)}
                      className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </div>

                  {/* Image */}
                  <Link
                    to={`/product/${product._id}`}
                    className="relative block overflow-hidden w-1/3"
                  >
                    <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={product.images?.[0]?.url || ""}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />

                      {/* Overlays */}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                          <div className="text-center p-4">
                            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <div className="text-gray-900 font-semibold">
                              Out of Stock
                            </div>
                          </div>
                        </div>
                      )}

                      {discountPercentage > 0 && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                          {discountPercentage}% OFF
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="p-6 w-2/3">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {product.brand && (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {product.brand}
                            </span>
                          )}
                          <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded">
                            {product.category}
                          </span>
                        </div>

                        <Link to={`/product/${product._id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-rose-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(product._id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && (
                          <>
                            <span className="text-lg text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-sm font-medium text-emerald-600">
                              Save{" "}
                              {formatPrice(
                                product.price - product.discountPrice,
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2 mb-6">
                      <div
                        className={`w-2 h-2 rounded-full ${product.stock === 0 ? "bg-red-500" : product.stock <= 5 ? "bg-amber-500" : "bg-emerald-500"}`}
                      />
                      <span className="text-sm text-gray-600">
                        {product.stock === 0
                          ? "Out of stock"
                          : product.stock <= 5
                            ? `Only ${product.stock} left`
                            : "In stock"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={product.stock === 0}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                          product.stock === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90 shadow-lg"
                        }`}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {product.stock === 0 ? "Out of Stock" : "Move to Cart"}
                      </button>

                      <Link
                        to={`/product/${product._id}`}
                        className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  You might also like
                </h2>
                <p className="text-gray-600 mt-2">Based on your wishlist</p>
              </div>
              <Link
                to="/shop"
                className="text-rose-600 hover:text-rose-700 font-medium flex items-center group"
              >
                View all
                <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {isLoadingFeatured ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 4).map((product) => (
                  <div key={product._id} className="group">
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                      <Link to={`/product/${product._id}`} className="block">
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={product.images?.[0]?.url || ""}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </Link>

                      <div className="p-4">
                        <div className="text-xs text-gray-500 uppercase mb-2">
                          {product.category}
                        </div>
                        <Link to={`/product/${product._id}`}>
                          <h4 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">
                            {product.name}
                          </h4>
                        </Link>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">
                            {formatPrice(
                              product.discountPrice || product.price,
                            )}
                          </span>
                          <button
                            onClick={() => dispatch(addToWishlist(product._id))}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Heart className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Summary */}
        {wishlistItems.length > 0 && (
          <div className="mt-12">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Wishlist Summary
                  </h3>
                  <p className="text-gray-600">
                    You have {itemCount} items saved. Total value:{" "}
                    <span className="font-bold text-gray-900">
                      {formatPrice(
                        wishlistItems.reduce((total, item) => {
                          const price =
                            item.product?.discountPrice ||
                            item.product?.price ||
                            0;
                          return total + price;
                        }, 0),
                      )}
                    </span>
                  </p>
                </div>
                <div className="flex gap-4 mt-6 lg:mt-0">
                  <button
                    onClick={() => navigate("/shop")}
                    className="px-6 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-red-100 to-rose-100 rounded-full mr-4">
                <AlertCircle className="h-8 w-8 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Clear Entire Wishlist
                </h3>
                <p className="text-gray-600 mt-1">
                  Are you sure? This will remove all {itemCount} items.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearWishlist}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white hover:opacity-90 rounded-xl font-medium transition-all duration-300 shadow-lg"
              >
                Clear All Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Container */}
      <div className="fixed bottom-6 right-6 z-40 space-y-3">
        {selectedItems.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center animate-slide-up">
            <CheckCircle className="h-5 w-5 mr-3" />
            <span className="font-medium">
              {selectedItems.length} items selected
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
