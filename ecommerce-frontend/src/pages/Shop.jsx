import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProducts,
  fetchBrands,
  setCategories,
} from "../redux/slices/product.slice";
import ProductCard from "../components/product/ProductCard";
import Loader from "../components/common/Loader";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RefreshCw,
  Tag,
  Star,
  Truck,
} from "lucide-react";

const Shop = () => {
  const dispatch = useDispatch();
  const { products, loading, pagination, brands } = useSelector(
    (state) => state.products,
  );

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Filter panel states
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(true);

  const categories = [
    "All Categories",
    "Electronics & Gadgets",
    "Fashion & Apparel",
    "Beauty & Personal Care",
    "Home & Kitchen",
    "Fitness & Outdoors",
    "Baby & Kids",
    "Pets",
    "Automotive & Tools",
    "Lifestyle & Hobbies",
  ];

  useEffect(() => {
    dispatch(setCategories(categories));
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    const category =
      selectedCategory === "All Categories" ? "" : selectedCategory;
    const brand = selectedBrand || "";

    dispatch(
      fetchProducts({
        page: currentPage,
        category,
        search: searchTerm,
        brand,
      }),
    );
  }, [dispatch, currentPage, selectedCategory, searchTerm, selectedBrand]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory("All Categories");
    setSelectedBrand("");
    setSearchTerm("");
    setPriceRange({ min: 0, max: 10000 });
    setSortBy("newest");
    setInStockOnly(false);
    setDiscountedOnly(false);
    setFeaturedOnly(false);
    setCurrentPage(1);
  };

  const filteredProducts = useCallback(() => {
    let filtered = [...products];

    // Apply price filter
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max,
    );

    // Apply in stock filter
    if (inStockOnly) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    // Apply discount filter
    if (discountedOnly) {
      filtered = filtered.filter((product) => product.discountPrice);
    }

    // Apply featured filter
    if (featuredOnly) {
      filtered = filtered.filter((product) => product.isFeatured);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case "price-high":
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [products, priceRange, inStockOnly, discountedOnly, featuredOnly, sortBy]);

  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: parseInt(value) || 0,
    }));
  };

  const renderFilterSection = (title, isOpen, setIsOpen, children) => (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-semibold text-gray-800">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );

  const activeFiltersCount =
    (selectedCategory !== "All Categories" ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (discountedOnly ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (priceRange.min > 0 || priceRange.max < 10000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
              <p className="text-gray-600 mt-2">
                {pagination.total} products available
              </p>
            </div>

            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products by name, brand, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Active Filters Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Filter className="h-4 w-4" />
                <span>Active Filters ({activeFiltersCount}):</span>
              </div>

              {selectedCategory !== "All Categories" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All Categories")}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand("")}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {(priceRange.min > 0 || priceRange.max < 10000) && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">
                  Price: ${priceRange.min} - ${priceRange.max}
                  <button onClick={() => setPriceRange({ min: 0, max: 10000 })}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {discountedOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm">
                  On Sale
                  <button onClick={() => setDiscountedOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {featuredOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  <Star className="h-3 w-3" />
                  Featured
                  <button onClick={() => setFeaturedOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearFilters}
                className="ml-auto flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              {/* Categories Filter */}
              {renderFilterSection(
                "Categories",
                isCategoryOpen,
                setIsCategoryOpen,
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="radio"
                        id={`cat-${category}`}
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => {
                          setSelectedCategory(category);
                          setCurrentPage(1);
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <label
                        htmlFor={`cat-${category}`}
                        className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>,
              )}

              {/* Price Range Filter */}
              {renderFilterSection(
                "Price Range",
                isPriceOpen,
                setIsPriceOpen,
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Min Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={priceRange.min}
                          onChange={(e) =>
                            handlePriceChange("min", e.target.value)
                          }
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Max Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={priceRange.max}
                          onChange={(e) =>
                            handlePriceChange("max", e.target.value)
                          }
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>${priceRange.min}</span>
                      <span>${priceRange.max}</span>
                    </div>
                  </div>
                </div>,
              )}

              {/* Brands Filter */}
              {renderFilterSection(
                "Brands",
                isBrandOpen,
                setIsBrandOpen,
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {loading ? (
                    <div className="text-center py-4">
                      <Loader />
                    </div>
                  ) : brands.length > 0 ? (
                    <>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="brand-all"
                          name="brand"
                          checked={selectedBrand === ""}
                          onChange={() => {
                            setSelectedBrand("");
                            setCurrentPage(1);
                          }}
                          className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <label
                          htmlFor="brand-all"
                          className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                        >
                          All Brands
                        </label>
                      </div>
                      {brands.map((brand) => (
                        <div key={brand} className="flex items-center">
                          <input
                            type="radio"
                            id={`brand-${brand}`}
                            name="brand"
                            checked={selectedBrand === brand}
                            onChange={() => {
                              setSelectedBrand(brand);
                              setCurrentPage(1);
                            }}
                            className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <label
                            htmlFor={`brand-${brand}`}
                            className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 truncate"
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No brands found
                    </p>
                  )}
                </div>,
              )}

              {/* Additional Features Filter */}
              {renderFilterSection(
                "Features",
                isFeaturesOpen,
                setIsFeaturesOpen,
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="in-stock"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label
                      htmlFor="in-stock"
                      className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                    >
                      In Stock Only
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="discounted"
                      checked={discountedOnly}
                      onChange={(e) => setDiscountedOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label
                      htmlFor="discounted"
                      className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                    >
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        On Sale Only
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label
                      htmlFor="featured"
                      className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                    >
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Featured Products
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="free-shipping"
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label
                      htmlFor="free-shipping"
                      className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                    >
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Free Shipping
                      </span>
                    </label>
                  </div>
                </div>,
              )}

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleClearFilters}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:w-3/4">
            {/* Sort and Results Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">
                      {filteredProducts().length}
                    </span>{" "}
                    of <span className="font-semibold">{pagination.total}</span>{" "}
                    products
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 font-medium">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Loader />
              </div>
            ) : (
              <>
                {filteredProducts().length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {filteredProducts().map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-sm text-gray-600">
                            Page {currentPage} of {pagination.totalPages} •{" "}
                            {pagination.total} total products
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Previous
                            </button>

                            <div className="flex items-center space-x-1">
                              {Array.from(
                                { length: Math.min(5, pagination.totalPages) },
                                (_, i) => {
                                  let pageNum;
                                  if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                  } else if (
                                    currentPage >=
                                    pagination.totalPages - 2
                                  ) {
                                    pageNum = pagination.totalPages - 4 + i;
                                  } else {
                                    pageNum = currentPage - 2 + i;
                                  }

                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => setCurrentPage(pageNum)}
                                      className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                                        currentPage === pageNum
                                          ? "bg-primary-600 text-white"
                                          : "text-gray-700 hover:bg-gray-100"
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                },
                              )}

                              {pagination.totalPages > 5 &&
                                currentPage < pagination.totalPages - 2 && (
                                  <>
                                    <span className="px-2 text-gray-400">
                                      ...
                                    </span>
                                    <button
                                      onClick={() =>
                                        setCurrentPage(pagination.totalPages)
                                      }
                                      className="w-10 h-10 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      {pagination.totalPages}
                                    </button>
                                  </>
                                )}
                            </div>

                            <button
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === pagination.totalPages}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your filters or search terms
                      </p>
                      <button
                        onClick={handleClearFilters}
                        className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
