import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Menu,
  Grid,
  List,
  Smartphone,
} from "lucide-react";

const Wishlist = () => {
  const { t } = useTranslation("wishlist");
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
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    toast.success(t("addedToCart"));
  };

  // Add all to cart
  const handleAddAllToCart = () => {
    const inStockItems = wishlistItems.filter(
      (item) => item.product && item.product.stock > 0,
    );

    if (inStockItems.length === 0) {
      toast.error(t("noStockItems"));
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

    toast.success(t("itemsAddedToCart", { count: inStockItems.length }));
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
      toast.success(t("itemsRemoved", { count: selectedItems.length }));
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

    const shareText = t("shareText", { count: itemCount, names: productNames });

    if (navigator.share) {
      navigator.share({
        title: t("shareTitle"),
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success(t("copiedToClipboard"));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-6 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 text-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <Heart className="h-10 w-10 sm:h-16 sm:w-16 text-rose-500" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t("signInRequired")}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            {t("signInMessage")}
          </p>
          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-lg text-sm sm:text-base"
            >
              {t("signInButton")}
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="w-full py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium text-sm sm:text-base"
            >
              {t("continueShopping")}
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          {/* Back Navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-8 sm:mb-12 group"
          >
            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="ml-2 font-medium text-sm sm:text-base">
              {t("back")}
            </span>
          </button>

          {/* Empty State */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 md:p-12 text-center">
              <div className="relative mx-auto w-48 h-48 sm:w-64 sm:h-64 mb-6 sm:mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-8 sm:inset-10 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full flex items-center justify-center">
                  <Heart className="h-16 w-16 sm:h-24 sm:w-24 text-rose-500" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t("emptyTitle")}
              </h1>

              <p className="text-gray-600 text-sm sm:text-base mb-8 sm:mb-10 max-w-md mx-auto">
                {t("emptyMessage")}
              </p>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
                <button
                  onClick={() => navigate("/shop")}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-lg flex items-center justify-center text-sm sm:text-base"
                >
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  {t("startShopping")}
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors mr-3"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {t("myWishlist")}
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1">
                    {t("itemCount", { count: itemCount })} • {t("lastUpdated")}
                  </p>
                </div>
              </div>

              {/* Search Bar & Mobile Controls */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                {/* Mobile View Toggle */}
                <div className="flex gap-2 sm:hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg ${viewMode === "list" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex flex-wrap gap-3">
              {selectedItems.length > 0 && (
                <>
                  <button
                    onClick={removeSelectedItems}
                    className="px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center shadow-lg text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("removeSelected", { count: selectedItems.length })}
                  </button>
                  <button
                    onClick={deselectAllItems}
                    className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 text-sm"
                  >
                    {t("deselectAll")}
                  </button>
                </>
              )}

              <button
                onClick={handleAddAllToCart}
                className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center shadow-lg text-sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t("addAllToCart")}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="sm:hidden mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddAllToCart}
              className="flex-1 px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center justify-center text-xs font-medium"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              {t("addAll")}
            </button>
            {selectedItems.length > 0 && (
              <button
                onClick={removeSelectedItems}
                className="flex-1 px-3 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:opacity-90 transition-all duration-300 flex items-center justify-center text-xs font-medium"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {t("removeMobile", { count: selectedItems.length })}
              </button>
            )}
          </div>
        </div>

        {/* Stats & Controls - Mobile Optimized */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {/* Stats */}
            <div className="text-center p-3 sm:p-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-rose-600">
                {itemCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                {t("totalItems")}
              </div>
            </div>
            <div className="text-center p-3 sm:p-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">
                {wishlistItems.filter((item) => item.product?.stock > 0).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                {t("inStock")}
              </div>
            </div>
            <div className="text-center p-3 sm:p-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-600">
                {
                  wishlistItems.filter(
                    (item) =>
                      item.product?.discountPrice &&
                      item.product?.discountPrice < item.product?.price,
                  ).length
                }
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                {t("onSale")}
              </div>
            </div>

            {/* Sort - Mobile */}
            <div className="col-span-2 sm:col-span-1 text-center p-3 sm:p-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 flex items-center justify-center text-xs sm:text-sm"
              >
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                {t("sortFilter")}
              </button>
              {showMobileFilters && (
                <div className="absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-none focus:outline-none"
                  >
                    <option value="recent">{t("sort.recent")}</option>
                    <option value="name">{t("sort.name")}</option>
                    <option value="price-low">{t("sort.priceLow")}</option>
                    <option value="price-high">{t("sort.priceHigh")}</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Actions - Mobile */}
          {selectedItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={selectAllItems}
                    className="text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    {t("selectAll")}
                  </button>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {t("selectedCount", {
                      selected: selectedItems.length,
                      total: itemCount,
                    })}
                  </span>
                </div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center text-xs sm:text-sm"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  {t("clearAll")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products List - Mobile Optimized */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Search className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
              {t("noMatchesTitle")}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
              {t("noMatchesMessage")}
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-sm sm:text-base"
            >
              {t("clearSearch")}
            </button>
          </div>
        ) : (
          <div
            className={`space-y-3 sm:space-y-4 ${viewMode === "grid" ? "grid grid-cols-2 gap-3 sm:hidden" : ""}`}
          >
            {filteredItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const discountPercentage = product.discountPrice
                ? Math.round(
                    ((product.price - product.discountPrice) / product.price) *
                      100,
                  )
                : 0;

              // Grid View for Mobile
              if (viewMode === "grid") {
                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <Link
                      to={`/product/${product._id}`}
                      className="relative block"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={product.images?.[0]?.url || ""}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {discountPercentage > 0 && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {t("discount", { percent: discountPercentage })}
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-3">
                      <div className="text-xs text-gray-500 truncate mb-1">
                        {product.category}
                      </div>
                      <Link to={`/product/${product._id}`}>
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {formatPrice(product.discountPrice || product.price)}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleRemoveItem(product._id)}
                            className="p-1 text-gray-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={product.stock === 0}
                        className={`w-full py-1.5 rounded-lg font-medium text-xs flex items-center justify-center ${
                          product.stock === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90"
                        }`}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {product.stock === 0
                          ? t("outOfStockShort")
                          : t("addShort")}
                      </button>
                    </div>
                  </div>
                );
              }

              // List View (Default)
              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
                >
                  {/* Checkbox */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product._id)}
                      onChange={() => toggleSelectItem(product._id)}
                      className="h-4 w-4 sm:h-5 sm:w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </div>

                  {/* Image - Mobile Stacked */}
                  <Link
                    to={`/product/${product._id}`}
                    className="relative block overflow-hidden w-full sm:w-1/3 h-48 sm:h-auto"
                  >
                    <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={product.images?.[0]?.url || ""}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Overlays */}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                          <div className="text-center p-4">
                            <Package className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                            <div className="text-gray-900 font-semibold text-sm">
                              {t("outOfStock")}
                            </div>
                          </div>
                        </div>
                      )}

                      {discountPercentage > 0 && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {t("discount", { percent: discountPercentage })}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Details - Mobile Stacked */}
                  <div className="p-4 sm:p-6 w-full">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="flex-1 mr-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {product.brand && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {product.brand}
                            </span>
                          )}
                          <span className="text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            {product.category}
                          </span>
                        </div>

                        <Link to={`/product/${product._id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-rose-600 transition-colors line-clamp-2 text-sm sm:text-base">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(product._id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors sm:p-2"
                        title={t("removeTooltip")}
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                          {formatPrice(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && (
                          <>
                            <span className="text-sm sm:text-base text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-emerald-600">
                              {t("save", {
                                amount: formatPrice(
                                  product.price - product.discountPrice,
                                ),
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-1.5 mb-4 sm:mb-6">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${product.stock === 0 ? "bg-red-500" : product.stock <= 5 ? "bg-amber-500" : "bg-emerald-500"}`}
                      />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {product.stock === 0
                          ? t("stock.out")
                          : product.stock <= 5
                            ? t("stock.low", { count: product.stock })
                            : t("stock.in")}
                      </span>
                    </div>

                    {/* Actions - Mobile Stacked */}
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={product.stock === 0}
                        className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 flex items-center justify-center text-xs sm:text-sm ${
                          product.stock === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90"
                        }`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        {product.stock === 0
                          ? t("outOfStock")
                          : t("moveToCart")}
                      </button>

                      <Link
                        to={`/product/${product._id}`}
                        className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Featured Products - Mobile Optimized */}
        {featuredProducts && featuredProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 md:pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {t("featuredTitle")}
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {t("featuredSubtitle")}
                </p>
              </div>
              <Link
                to="/shop"
                className="text-rose-600 hover:text-rose-700 font-medium flex items-center text-sm sm:text-base group"
              >
                {t("viewAll")}
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {isLoadingFeatured ? (
              <div className="flex justify-center py-8 sm:py-12">
                <Loader />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {featuredProducts.slice(0, 4).map((product) => (
                  <div key={product._id} className="group">
                    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                      <Link to={`/product/${product._id}`} className="block">
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={product.images?.[0]?.url || ""}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </Link>

                      <div className="p-3 sm:p-4">
                        <div className="text-xs text-gray-500 uppercase mb-1 sm:mb-2 truncate">
                          {product.category}
                        </div>
                        <Link to={`/product/${product._id}`}>
                          <h4 className="font-medium text-gray-900 line-clamp-2 mb-1.5 sm:mb-2 text-sm sm:text-base group-hover:text-rose-600 transition-colors">
                            {product.name}
                          </h4>
                        </Link>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm sm:text-base">
                            {formatPrice(
                              product.discountPrice || product.price,
                            )}
                          </span>
                          <button
                            onClick={() => dispatch(addToWishlist(product._id))}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
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

        {/* Wishlist Summary - Mobile Optimized */}
        {wishlistItems.length > 0 && (
          <div className="mt-6 sm:mt-8 md:mt-12">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                    {t("summaryTitle")}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {t("summaryText", {
                      count: itemCount,
                      total: formatPrice(
                        wishlistItems.reduce((total, item) => {
                          const price =
                            item.product?.discountPrice ||
                            item.product?.price ||
                            0;
                          return total + price;
                        }, 0),
                      ),
                    })}
                  </p>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => navigate("/shop")}
                    className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg text-sm sm:text-base"
                  >
                    {t("continueShopping")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal - Mobile Optimized */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 transform transition-all duration-300 scale-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-red-100 to-rose-100 rounded-full mr-3 sm:mr-4">
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {t("confirmClearTitle")}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                  {t("confirmClearMessage", { count: itemCount })}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleClearWishlist}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white hover:opacity-90 rounded-xl font-medium transition-all duration-300 shadow-lg text-sm sm:text-base"
              >
                {t("confirmClearButton")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        {selectedItems.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center animate-slide-up text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>
              {t("selectedFloating", { count: selectedItems.length })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
