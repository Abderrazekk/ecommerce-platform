import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
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
  Sparkles,
  Zap,
  TrendingUp,
  Globe,
  Clock,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Shop = () => {
  const { t } = useTranslation("shop");
  const dispatch = useDispatch();
  const { products, loading, pagination, brands } = useSelector(
    (state) => state.products,
  );

  const [selectedCategory, setSelectedCategory] = useState(t("categories.all"));
  const [selectedBrand, setSelectedBrand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [aliExpressOnly, setAliExpressOnly] = useState(false);

  // Filter panel states
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(true);

  // Initialize categories with translations
  const categories = [
    t("categories.all"),
    t("categories.electronics"),
    t("categories.fashion"),
    t("categories.beauty"),
    t("categories.home"),
    t("categories.fitness"),
    t("categories.baby"),
    t("categories.pets"),
    t("categories.automotive"),
    t("categories.lifestyle"),
    t("categories.aliexpress"),
  ];

  useEffect(() => {
    dispatch(setCategories(categories));
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    const category =
      selectedCategory === t("categories.all") ? "" : selectedCategory;
    const brand = selectedBrand || "";

    // Handle AliExpress filter
    let isAliExpress = "";
    if (selectedCategory === t("categories.aliexpress")) {
      isAliExpress = "true";
    }

    dispatch(
      fetchProducts({
        page: currentPage,
        category:
          selectedCategory === t("categories.aliexpress") ? "" : category,
        search: searchTerm,
        brand,
        isAliExpress,
      }),
    );
  }, [dispatch, currentPage, selectedCategory, searchTerm, selectedBrand, t]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory(t("categories.all"));
    setSelectedBrand("");
    setSearchTerm("");
    setPriceRange({ min: 0, max: 10000 });
    setSortBy("newest");
    setInStockOnly(false);
    setDiscountedOnly(false);
    setFeaturedOnly(false);
    setAliExpressOnly(false);
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

    // Apply AliExpress filter locally
    if (aliExpressOnly) {
      filtered = filtered.filter((product) => product.isAliExpress);
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
  }, [
    products,
    priceRange,
    inStockOnly,
    discountedOnly,
    featuredOnly,
    aliExpressOnly,
    sortBy,
  ]);

  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: parseInt(value) || 0,
    }));
  };

  const renderFilterSection = (title, isOpen, setIsOpen, children) => (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded-lg px-2 transition-all duration-200"
      >
        <span className="font-semibold text-gray-800 flex items-center gap-2">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500 transition-transform duration-200" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
        )}
      </button>
      {isOpen && <div className="pb-4 px-2 animate-fadeIn">{children}</div>}
    </div>
  );

  const activeFiltersCount =
    (selectedCategory !== t("categories.all") ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (discountedOnly ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (aliExpressOnly ? 1 : 0) +
    (priceRange.min > 0 || priceRange.max < 10000 ? 1 : 0);

  // Scroll to top when page changes
  const scrollToTop = () => {
    window.scrollTo({
      top: 600,
      behavior: "smooth",
    });
  };

  const goToNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
      scrollToTop();
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      scrollToTop();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      {/* Full width container */}
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-8 2xl:px-16">
        {/* AliExpress Warning Banner */}
        {selectedCategory === t("categories.aliexpress") && (
          <div className="mb-6 animate-fadeIn mx-2 sm:mx-4">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-r-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-orange-100 rounded-xl">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    {t("aliexpress.warning.title")}
                  </h3>
                  <div className="space-y-2 text-orange-700">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {t("aliexpress.warning.deliveryTime").split(":")[0]}:
                      </span>
                      {t("aliexpress.warning.deliveryTime").split(":")[1]}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">
                        {
                          t("aliexpress.warning.orderConfirmation").split(
                            ":",
                          )[0]
                        }
                        :
                      </span>
                      {t("aliexpress.warning.orderConfirmation").split(":")[1]}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">
                        {t("aliexpress.warning.contactRequired").split(":")[0]}:
                      </span>
                      {t("aliexpress.warning.contactRequired").split(":")[1]}
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-orange-100/50 rounded-lg">
                    <p className="text-sm text-orange-800 font-medium">
                      {t("aliexpress.warning.note")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header with Search */}
        <div className="mb-12 mx-2 sm:mx-4">
          <div className="relative mb-8">
            <div className="p-8 rounded-3xl border border-gray-100 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-4xl font-bold text-gray-900">
                      {t("header.title")}
                    </h1>
                  </div>
                  <p className="text-gray-600 text-lg">
                    {t("header.subtitle", { count: pagination.total })}
                  </p>
                </div>

                <form
                  onSubmit={handleSearch}
                  className="w-full lg:w-1/2 xl:w-2/5"
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder={t("search.placeholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-white"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Active Filters Bar */}
          {activeFiltersCount > 0 && (
            <div className="mb-8 p-5 bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Filter className="h-3.5 w-3.5" />
                  <span>
                    {t("filters.activeFilters", { count: activeFiltersCount })}
                  </span>
                </div>

                {selectedCategory !== t("categories.all") && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 rounded-full text-sm font-medium shadow-sm">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory(t("categories.all"))}
                      className="hover:bg-primary-200/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {selectedBrand && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium shadow-sm">
                    <Zap className="h-3.5 w-3.5" />
                    {selectedBrand}
                    <button
                      onClick={() => setSelectedBrand("")}
                      className="hover:bg-blue-100/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {(priceRange.min > 0 || priceRange.max < 10000) && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium shadow-sm">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {t("filterTags.price", {
                      min: priceRange.min,
                      max: priceRange.max,
                    })}
                    <button
                      onClick={() => setPriceRange({ min: 0, max: 10000 })}
                      className="hover:bg-emerald-100/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium shadow-sm">
                    {t("filterTags.inStock")}
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="hover:bg-green-100/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {discountedOnly && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium shadow-sm">
                    <Tag className="h-3.5 w-3.5" />
                    {t("filterTags.onSale")}
                    <button
                      onClick={() => setDiscountedOnly(false)}
                      className="hover:bg-orange-100/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {featuredOnly && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium shadow-sm">
                    <Star className="h-3.5 w-3.5" />
                    {t("filterTags.featured")}
                    <button
                      onClick={() => setFeaturedOnly(false)}
                      className="hover:bg-amber-100/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {selectedCategory === t("categories.aliexpress") && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-100 text-orange-800 rounded-full text-sm font-medium shadow-sm">
                    <Globe className="h-3.5 w-3.5" />
                    {t("filterTags.aliexpress")}
                    <button
                      onClick={() => setSelectedCategory(t("categories.all"))}
                      className="hover:bg-orange-200/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {aliExpressOnly &&
                  selectedCategory !== t("categories.aliexpress") && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-100 text-orange-800 rounded-full text-sm font-medium shadow-sm">
                      <Globe className="h-3.5 w-3.5" />
                      {t("filterTags.aliexpressOnly")}
                      <button
                        onClick={() => setAliExpressOnly(false)}
                        className="hover:bg-orange-200/50 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}

                <button
                  onClick={handleClearFilters}
                  className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 hover:shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("filters.clearAll")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mx-2 sm:mx-4">
          {/* Sidebar Filters */}
          <div className="lg:w-72 xl:w-80 2xl:w-96">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg">
                    <SlidersHorizontal className="h-5 w-5 text-primary-600" />
                  </div>
                  {t("filters.title")}
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full shadow-sm">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              {/* Categories Filter */}
              {renderFilterSection(
                t("filters.sections.categories"),
                isCategoryOpen,
                setIsCategoryOpen,
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center group">
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          id={`cat-${category}`}
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => {
                            setSelectedCategory(category);
                            setCurrentPage(1);
                          }}
                          className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1 transition-all duration-200"
                        />
                        <label
                          htmlFor={`cat-${category}`}
                          className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200"
                        >
                          {category}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>,
              )}

              {/* Price Range Filter */}
              {renderFilterSection(
                t("filters.sections.priceRange"),
                isPriceOpen,
                setIsPriceOpen,
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t("filters.price.min")}
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {t("filters.currency")}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={priceRange.min}
                          onChange={(e) =>
                            handlePriceChange("min", e.target.value)
                          }
                          className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-white/50 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t("filters.price.max")}
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {t("filters.currency")}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={priceRange.max}
                          onChange={(e) =>
                            handlePriceChange("max", e.target.value)
                          }
                          className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-white/50 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="relative h-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                        style={{
                          left: `${(priceRange.min / 10000) * 100}%`,
                          right: `${100 - (priceRange.max / 10000) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>
                        {t("filters.currency")} {priceRange.min}
                      </span>
                      <span>
                        {t("filters.currency")} {priceRange.max}
                      </span>
                    </div>
                  </div>
                </div>,
              )}

              {/* Brands Filter */}
              {renderFilterSection(
                t("filters.sections.brands"),
                isBrandOpen,
                setIsBrandOpen,
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {loading ? (
                    <div className="text-center py-4">
                      <Loader />
                    </div>
                  ) : brands.length > 0 ? (
                    <>
                      <div className="flex items-center group">
                        <input
                          type="radio"
                          id="brand-all"
                          name="brand"
                          checked={selectedBrand === ""}
                          onChange={() => {
                            setSelectedBrand("");
                            setCurrentPage(1);
                          }}
                          className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1 transition-all duration-200"
                        />
                        <label
                          htmlFor="brand-all"
                          className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200"
                        >
                          {t("products.allBrands")}
                        </label>
                      </div>
                      {brands.map((brand) => (
                        <div key={brand} className="flex items-center group">
                          <input
                            type="radio"
                            id={`brand-${brand}`}
                            name="brand"
                            checked={selectedBrand === brand}
                            onChange={() => {
                              setSelectedBrand(brand);
                              setCurrentPage(1);
                            }}
                            className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1 transition-all duration-200"
                          />
                          <label
                            htmlFor={`brand-${brand}`}
                            className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200 truncate"
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      {t("products.noBrands")}
                    </p>
                  )}
                </div>,
              )}

              {/* Additional Features Filter */}
              {renderFilterSection(
                t("filters.sections.features"),
                isFeaturesOpen,
                setIsFeaturesOpen,
                <div className="space-y-3">
                  <div className="flex items-center group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                    <input
                      type="checkbox"
                      id="in-stock"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="in-stock"
                      className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      {t("features.inStock")}
                    </label>
                  </div>

                  <div className="flex items-center group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                    <input
                      type="checkbox"
                      id="discounted"
                      checked={discountedOnly}
                      onChange={(e) => setDiscountedOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="discounted"
                      className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-orange-500" />
                        {t("features.onSale")}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="featured"
                      className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        {t("features.featured")}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                    <input
                      type="checkbox"
                      id="ali-express"
                      checked={aliExpressOnly}
                      onChange={(e) => setAliExpressOnly(e.target.checked)}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="ali-express"
                      className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-orange-500" />
                        {t("features.aliexpress")}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                    <input
                      type="checkbox"
                      id="free-shipping"
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="free-shipping"
                      className="ml-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      <span className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-500" />
                        {t("features.freeShipping")}
                      </span>
                    </label>
                  </div>
                </div>,
              )}

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleClearFilters}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:shadow-sm group"
                >
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  {t("filters.resetFilters")}
                </button>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Sort and Results Info */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-gray-600">
                    {t("products.showing", {
                      showing: filteredProducts().length,
                      total: pagination.total,
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 font-medium">
                      {t("sort.label")}
                    </label>
                    <div className="relative group">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-white/50 appearance-none pr-8 transition-all duration-200 hover:border-gray-300"
                      >
                        <option value="newest">{t("sort.newest")}</option>
                        <option value="price-low">{t("sort.priceLow")}</option>
                        <option value="price-high">
                          {t("sort.priceHigh")}
                        </option>
                        <option value="name">{t("sort.name")}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary-400 animate-pulse-slow" />
                </div>
              </div>
            ) : (
              <>
                {filteredProducts().length > 0 ? (
                  <>
                    {/* Navigation buttons when total products > 15 */}
                    {pagination.total > 15 && pagination.totalPages > 1 && (
                      <div className="flex justify-between items-center mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-4 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {t("pagination.page", {
                              current: currentPage,
                              total: pagination.totalPages,
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-gray-100 disabled:hover:to-gray-50 group"
                          >
                            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">
                              {t("pagination.previous")}
                            </span>
                          </button>

                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: Math.min(3, pagination.totalPages) },
                              (_, i) => {
                                let pageNum;
                                if (pagination.totalPages <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage === 1) {
                                  pageNum = i + 1;
                                } else if (
                                  currentPage === pagination.totalPages
                                ) {
                                  pageNum = pagination.totalPages - 2 + i;
                                } else {
                                  pageNum = currentPage - 1 + i;
                                }

                                if (
                                  pageNum > 0 &&
                                  pageNum <= pagination.totalPages
                                ) {
                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => {
                                        setCurrentPage(pageNum);
                                        scrollToTop();
                                      }}
                                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                                        currentPage === pageNum
                                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm"
                                          : "text-gray-700 hover:bg-gray-100"
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                }
                                return null;
                              },
                            )}

                            {pagination.totalPages > 3 &&
                              currentPage < pagination.totalPages - 1 && (
                                <>
                                  {currentPage < pagination.totalPages - 2 && (
                                    <span className="px-2 text-gray-400">
                                      ...
                                    </span>
                                  )}
                                  <button
                                    onClick={() => {
                                      setCurrentPage(pagination.totalPages);
                                      scrollToTop();
                                    }}
                                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                                  >
                                    {pagination.totalPages}
                                  </button>
                                </>
                              )}
                          </div>

                          <button
                            onClick={goToNextPage}
                            disabled={currentPage === pagination.totalPages}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-gray-100 disabled:hover:to-gray-50 group"
                          >
                            <span className="font-medium">
                              {t("pagination.next")}
                            </span>
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
                      {filteredProducts().map((product) => (
                        <div
                          key={product._id}
                          className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                        >
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>

                    {/* Bottom navigation buttons for mobile/tablet */}
                    {pagination.total > 15 && pagination.totalPages > 1 && (
                      <div className="lg:hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-5 w-5" />
                            <span>{t("pagination.previous")}</span>
                          </button>

                          <div className="text-sm text-gray-600">
                            {t("pagination.page", {
                              current: currentPage,
                              total: pagination.totalPages,
                            })}
                          </div>

                          <button
                            onClick={goToNextPage}
                            disabled={currentPage === pagination.totalPages}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <span>{t("pagination.next")}</span>
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pagination for small screens */}
                    {pagination.totalPages > 1 && pagination.total <= 15 && (
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-sm text-gray-600">
                            {t("pagination.page", {
                              current: currentPage,
                              total: pagination.totalPages,
                            })}{" "}
                            • {t("products.total", { count: pagination.total })}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setCurrentPage(currentPage - 1);
                                scrollToTop();
                              }}
                              disabled={currentPage === 1}
                              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                            >
                              {t("pagination.previous")}
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
                                      onClick={() => {
                                        setCurrentPage(pageNum);
                                        scrollToTop();
                                      }}
                                      className={`w-10 h-10 text-sm font-medium rounded-xl transition-all duration-200 ${
                                        currentPage === pageNum
                                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm"
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
                                      onClick={() => {
                                        setCurrentPage(pagination.totalPages);
                                        scrollToTop();
                                      }}
                                      className="w-10 h-10 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                                    >
                                      {pagination.totalPages}
                                    </button>
                                  </>
                                )}
                            </div>

                            <button
                              onClick={() => {
                                setCurrentPage(currentPage + 1);
                                scrollToTop();
                              }}
                              disabled={currentPage === pagination.totalPages}
                              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                            >
                              {t("pagination.next")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                        <Search className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {t("products.noProducts")}
                      </h3>
                      <p className="text-gray-600 mb-8">
                        {t("products.noProductsMessage")}
                      </p>
                      <button
                        onClick={handleClearFilters}
                        className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                      >
                        {t("filters.clearAll")}
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
