import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
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

const CATEGORY_ENUM_TO_KEY = {
  "Electronics & Gadgets": "electronics",
  "Fashion & Apparel": "fashion",
  "Beauty & Personal Care": "beauty",
  "Home & Kitchen": "home",
  "Fitness & Outdoors": "fitness",
  "Baby & Kids": "baby",
  Pets: "pets",
  "Automotive & Tools": "automotive",
  "Lifestyle & Hobbies": "lifestyle",
};

const ALIEXPRESS_CATEGORY_VALUE = "aliexpress";

const Shop = () => {
  const { t } = useTranslation("shop");
  const dispatch = useDispatch();
  const location = useLocation();

  const { products, loading, pagination, brands } = useSelector(
    (state) => state.products,
  );

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [aliExpressOnly, setAliExpressOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(true);

  const categoryOptions = [
    { value: "", label: t("categories.all") },
    ...Object.entries(CATEGORY_ENUM_TO_KEY).map(([enumVal, key]) => ({
      value: enumVal,
      label: t(`categories.${key}`),
    })),
    { value: ALIEXPRESS_CATEGORY_VALUE, label: t("categories.aliexpress") },
  ];

  // Read URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    const searchParam = params.get("search");
    const brandParam = params.get("brand");
    const pageParam = params.get("page");

    if (categoryParam) {
      if (
        Object.keys(CATEGORY_ENUM_TO_KEY).includes(categoryParam) ||
        categoryParam === ALIEXPRESS_CATEGORY_VALUE
      ) {
        setSelectedCategory(categoryParam);
      } else {
        setSelectedCategory("");
      }
    } else {
      setSelectedCategory("");
    }

    if (searchParam) setSearchTerm(searchParam);
    if (brandParam) setSelectedBrand(brandParam);
    if (pageParam) setCurrentPage(parseInt(pageParam, 10) || 1);

    // Store onSale flag in local state if needed, but we'll pass it directly to fetchProducts
  }, [location.search]);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    let category = selectedCategory;
    let isAliExpress = "";

    if (selectedCategory === ALIEXPRESS_CATEGORY_VALUE) {
      isAliExpress = "true";
      category = "";
    }

    // Get onSale from URL
    const params = new URLSearchParams(location.search);
    const onSaleParam = params.get("onSale");

    dispatch(
      fetchProducts({
        page: currentPage,
        limit: 15,
        category: category,
        search: searchTerm,
        brand: selectedBrand,
        isAliExpress,
        isOnSale: onSaleParam === "true" ? "true" : undefined, // <-- string "true"
      }),
    );
  }, [
    dispatch,
    currentPage,
    selectedCategory,
    searchTerm,
    selectedBrand,
    location.search,
  ]);

  const filteredProducts = useCallback(() => {
    let filtered = [...products];

    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max,
    );

    if (inStockOnly) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    if (discountedOnly) {
      filtered = filtered.filter((product) => product.discountPrice);
    }

    if (featuredOnly) {
      filtered = filtered.filter((product) => product.isFeatured);
    }

    if (aliExpressOnly) {
      filtered = filtered.filter((product) => product.isAliExpress);
    }

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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setSearchTerm("");
    setPriceRange({ min: 0, max: 10000 });
    setSortBy("newest");
    setInStockOnly(false);
    setDiscountedOnly(false);
    setFeaturedOnly(false);
    setAliExpressOnly(false);
    setCurrentPage(1);
    setIsMobileFilterOpen(false);
  };

  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: parseInt(value) || 0,
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const getCategoryLabel = (catValue) => {
    if (catValue === "") return t("categories.all");
    if (catValue === ALIEXPRESS_CATEGORY_VALUE)
      return t("categories.aliexpress");
    const key = CATEGORY_ENUM_TO_KEY[catValue];
    return key ? t(`categories.${key}`) : catValue;
  };

  const activeFiltersCount =
    (selectedCategory !== "" ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (discountedOnly ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (aliExpressOnly ? 1 : 0) +
    (priceRange.min > 0 || priceRange.max < 10000 ? 1 : 0);

  const renderFilterSection = (title, isOpen, setIsOpen, children) => (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded-xl px-3 transition-all duration-300 group"
      >
        <span className="font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:scale-150 transition-transform"></div>
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500 transition-transform duration-300" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-300" />
        )}
      </button>
      {isOpen && <div className="pb-4 px-3 animate-fadeIn">{children}</div>}
    </div>
  );

  const MobileFilterDrawer = () => (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMobileFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileFilterOpen(false)}
      />

      {/* Drawer – RTL aware */}
      <div
        className={`fixed top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileFilterOpen
            ? "translate-x-0"
            : "ltr:translate-x-full rtl:-translate-x-full"
        } ltr:right-0 rtl:left-0`}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-6 w-6 text-primary-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("filters.title")}
                </h2>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-gray-600">
                    {activeFiltersCount} active filter
                    {activeFiltersCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="h-[calc(100vh-140px)] overflow-y-auto px-6 py-4">
          {renderFilterSection(
            t("filters.sections.categories"),
            isCategoryOpen,
            setIsCategoryOpen,
            <div className="space-y-2">
              {categoryOptions.map((option) => (
                <div
                  key={option.value || "all"}
                  className="flex items-center group"
                >
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      id={`cat-mobile-${option.value || "all"}`}
                      name="category-mobile"
                      checked={selectedCategory === option.value}
                      onChange={() => {
                        setSelectedCategory(option.value);
                        setCurrentPage(1);
                      }}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor={`cat-mobile-${option.value || "all"}`}
                      className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200"
                    >
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>,
          )}

          {renderFilterSection(
            t("filters.sections.priceRange"),
            isPriceOpen,
            setIsPriceOpen,
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    {t("filters.price.min")}
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {t("filters.currency")}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className="w-full ps-8 pe-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 bg-white transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    {t("filters.price.max")}
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {t("filters.currency")}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className="w-full ps-8 pe-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 bg-white transition-all duration-300"
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
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
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
                      id="brand-all-mobile"
                      name="brand-mobile"
                      checked={selectedBrand === ""}
                      onChange={() => {
                        setSelectedBrand("");
                        setCurrentPage(1);
                      }}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="brand-all-mobile"
                      className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200"
                    >
                      {t("products.allBrands")}
                    </label>
                  </div>
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center group">
                      <input
                        type="radio"
                        id={`brand-mobile-${brand}`}
                        name="brand-mobile"
                        checked={selectedBrand === brand}
                        onChange={() => {
                          setSelectedBrand(brand);
                          setCurrentPage(1);
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                      />
                      <label
                        htmlFor={`brand-mobile-${brand}`}
                        className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200 truncate"
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

          {renderFilterSection(
            t("filters.sections.features"),
            isFeaturesOpen,
            setIsFeaturesOpen,
            <div className="space-y-3">
              <div className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
                <input
                  type="checkbox"
                  id="in-stock-mobile"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                />
                <label
                  htmlFor="in-stock-mobile"
                  className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                >
                  {t("features.inStock")}
                </label>
              </div>

              <div className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
                <input
                  type="checkbox"
                  id="discounted-mobile"
                  checked={discountedOnly}
                  onChange={(e) => setDiscountedOnly(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                />
                <label
                  htmlFor="discounted-mobile"
                  className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-orange-500" />
                    {t("features.onSale")}
                  </span>
                </label>
              </div>

              <div className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
                <input
                  type="checkbox"
                  id="featured-mobile"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                />
                <label
                  htmlFor="featured-mobile"
                  className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                >
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    {t("features.featured")}
                  </span>
                </label>
              </div>

              <div className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
                <input
                  type="checkbox"
                  id="ali-express-mobile"
                  checked={aliExpressOnly}
                  onChange={(e) => setAliExpressOnly(e.target.checked)}
                  className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-1 transition-all duration-200"
                />
                <label
                  htmlFor="ali-express-mobile"
                  className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-500" />
                    {t("features.aliexpress")}
                  </span>
                </label>
              </div>

              <div className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
                <input
                  type="checkbox"
                  id="free-shipping-mobile"
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                />
                <label
                  htmlFor="free-shipping-mobile"
                  className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-500" />
                    {t("features.freeShipping")}
                  </span>
                </label>
              </div>
            </div>,
          )}
        </div>

        {/* Drawer Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={handleClearFilters}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl transition-all duration-300 hover:shadow-sm border border-gray-300"
            >
              <RefreshCw className="h-4 w-4" />
              {t("filters.resetFilters")}
            </button>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              {t("filters.applyFilters")}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <MobileFilterDrawer />

        {/* Page Title & Subtitle - visible on all screens */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">SHOP</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Browse our collection of amazing products
          </p>
        </div>

        {selectedCategory === ALIEXPRESS_CATEGORY_VALUE && (
          <div className="mb-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shadow-sm">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-orange-800 mb-3">
                    {t("aliexpress.warning.title")}
                  </h3>
                  <div className="space-y-3 text-orange-700">
                    <p className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-semibold">
                        {t("aliexpress.warning.deliveryTime").split(":")[0]}:
                      </span>
                      {t("aliexpress.warning.deliveryTime").split(":")[1]}
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-semibold">
                        {
                          t("aliexpress.warning.orderConfirmation").split(
                            ":",
                          )[0]
                        }
                        :
                      </span>
                      {t("aliexpress.warning.orderConfirmation").split(":")[1]}
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-semibold">
                        {t("aliexpress.warning.contactRequired").split(":")[0]}:
                      </span>
                      {t("aliexpress.warning.contactRequired").split(":")[1]}
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-gradient-to-r from-orange-100/50 to-amber-100/50 rounded-lg border border-orange-200/50">
                    <p className="text-sm text-orange-800 font-medium">
                      {t("aliexpress.warning.note")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-5">
          {activeFiltersCount > 0 && (
            <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-full border border-gray-200">
                  <Filter className="h-3.5 w-3.5" />
                  <span>
                    {t("filters.activeFilters", { count: activeFiltersCount })}
                  </span>
                </div>

                {selectedCategory !== "" && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 rounded-full text-sm font-semibold border border-primary-200">
                    {getCategoryLabel(selectedCategory)}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="hover:bg-primary-200/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {selectedBrand && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200">
                    <Zap className="h-3.5 w-3.5" />
                    {selectedBrand}
                    <button
                      onClick={() => setSelectedBrand("")}
                      className="hover:bg-blue-200/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {(priceRange.min > 0 || priceRange.max < 10000) && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 rounded-full text-sm font-semibold border border-emerald-200">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {t("filterTags.price", {
                      min: priceRange.min,
                      max: priceRange.max,
                    })}
                    <button
                      onClick={() => setPriceRange({ min: 0, max: 10000 })}
                      className="hover:bg-emerald-200/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">
                    {t("filterTags.inStock")}
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="hover:bg-green-200/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {discountedOnly && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-100 text-orange-800 rounded-full text-sm font-semibold border border-orange-200">
                    <Tag className="h-3.5 w-3.5" />
                    {t("filterTags.onSale")}
                    <button
                      onClick={() => setDiscountedOnly(false)}
                      className="hover:bg-orange-200/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {featuredOnly && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-800 rounded-full text-sm font-semibold border border-amber-200">
                    <Star className="h-3.5 w-3.5" />
                    {t("filterTags.featured")}
                    <button
                      onClick={() => setFeaturedOnly(false)}
                      className="hover:bg-amber-200/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {selectedCategory === ALIEXPRESS_CATEGORY_VALUE && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-100 text-orange-800 rounded-full text-sm font-semibold border border-orange-300">
                    <Globe className="h-3.5 w-3.5" />
                    {t("filterTags.aliexpress")}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="hover:bg-orange-200/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}

                {aliExpressOnly &&
                  selectedCategory !== ALIEXPRESS_CATEGORY_VALUE && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-100 text-orange-800 rounded-full text-sm font-semibold border border-orange-300">
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
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-full transition-all duration-300 hover:shadow-sm border border-gray-300"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("filters.clearAll")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:w-80 xl:w-96">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
                    <SlidersHorizontal className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {t("filters.title")}
                  </h2>
                </div>
                {activeFiltersCount > 0 && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full shadow-sm">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              {renderFilterSection(
                t("filters.sections.categories"),
                isCategoryOpen,
                setIsCategoryOpen,
                <div className="space-y-2">
                  {categoryOptions.map((option) => (
                    <div
                      key={option.value || "all"}
                      className="flex items-center group"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          id={`cat-${option.value || "all"}`}
                          name="category"
                          checked={selectedCategory === option.value}
                          onChange={() => {
                            setSelectedCategory(option.value);
                            setCurrentPage(1);
                          }}
                          className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                        />
                        <label
                          htmlFor={`cat-${option.value || "all"}`}
                          className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200"
                        >
                          {option.label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>,
              )}

              {renderFilterSection(
                t("filters.sections.priceRange"),
                isPriceOpen,
                setIsPriceOpen,
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        {t("filters.price.min")}
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          {t("filters.currency")}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={priceRange.min}
                          onChange={(e) =>
                            handlePriceChange("min", e.target.value)
                          }
                          className="w-full ps-8 pe-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 bg-white transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        {t("filters.price.max")}
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          {t("filters.currency")}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={priceRange.max}
                          onChange={(e) =>
                            handlePriceChange("max", e.target.value)
                          }
                          className="w-full ps-8 pe-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 bg-white transition-all duration-300"
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
                    <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
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
                          className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                        />
                        <label
                          htmlFor="brand-all"
                          className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200"
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
                            className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                          />
                          <label
                            htmlFor={`brand-${brand}`}
                            className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200 truncate"
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

              {renderFilterSection(
                t("filters.sections.features"),
                isFeaturesOpen,
                setIsFeaturesOpen,
                <div className="space-y-3">
                  <div className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
                    <input
                      type="checkbox"
                      id="in-stock"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="in-stock"
                      className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      {t("features.inStock")}
                    </label>
                  </div>

                  <div className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
                    <input
                      type="checkbox"
                      id="discounted"
                      checked={discountedOnly}
                      onChange={(e) => setDiscountedOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="discounted"
                      className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-orange-500" />
                        {t("features.onSale")}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="featured"
                      className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        {t("features.featured")}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
                    <input
                      type="checkbox"
                      id="ali-express"
                      checked={aliExpressOnly}
                      onChange={(e) => setAliExpressOnly(e.target.checked)}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="ali-express"
                      className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-orange-500" />
                        {t("features.aliexpress")}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
                    <input
                      type="checkbox"
                      id="free-shipping"
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 transition-all duration-200"
                    />
                    <label
                      htmlFor="free-shipping"
                      className="ms-3 text-sm text-gray-700 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      <span className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-500" />
                        {t("features.freeShipping")}
                      </span>
                    </label>
                  </div>
                </div>,
              )}

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleClearFilters}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl transition-all duration-300 hover:shadow-sm border border-gray-300 group"
                >
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  {t("filters.resetFilters")}
                </button>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-white text-primary-600 text-xs font-bold rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary-400 animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                {filteredProducts().length > 0 ? (
                  <>
                    {/* Auto‑fit grid with minimum card widths */}
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2 sm:gap-4 lg:gap-6 mb-8">
                      {filteredProducts().map((product) => (
                        <div
                          key={product._id}
                          className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                        >
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>

                    {pagination.totalPages > 1 && (
                      <div className="hidden lg:block">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-4">
                          <div className="flex items-center justify-center gap-6">
                            <button
                              onClick={goToPrevPage}
                              disabled={currentPage === 1}
                              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group border border-gray-300"
                            >
                              <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                              <span className="font-semibold">
                                {t("pagination.previous")}
                              </span>
                            </button>

                            <div className="flex items-center gap-2">
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
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 font-semibold ${
                                          currentPage === pageNum
                                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                                            : "text-gray-700 hover:bg-gray-100 border border-gray-300"
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
                                    {currentPage <
                                      pagination.totalPages - 2 && (
                                      <span className="px-2 text-gray-400">
                                        ...
                                      </span>
                                    )}
                                    <button
                                      onClick={() => {
                                        setCurrentPage(pagination.totalPages);
                                        scrollToTop();
                                      }}
                                      className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300 font-semibold border border-gray-300"
                                    >
                                      {pagination.totalPages}
                                    </button>
                                  </>
                                )}
                            </div>

                            <button
                              onClick={goToNextPage}
                              disabled={currentPage === pagination.totalPages}
                              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group border border-gray-300"
                            >
                              <span className="font-semibold">
                                {t("pagination.next")}
                              </span>
                              <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {pagination.totalPages > 1 && (
                      <div className="lg:hidden">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-4">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-sm text-gray-600 font-medium">
                              {t("pagination.page", {
                                current: currentPage,
                                total: pagination.totalPages,
                              })}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100 rounded-xl hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-1.5 border border-gray-300"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                {t("pagination.previous")}
                              </button>
                              <div className="flex items-center space-x-1">
                                {Array.from(
                                  {
                                    length: Math.min(3, pagination.totalPages),
                                  },
                                  (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 3) {
                                      pageNum = i + 1;
                                    } else if (currentPage <= 2) {
                                      pageNum = i + 1;
                                    } else if (
                                      currentPage >=
                                      pagination.totalPages - 1
                                    ) {
                                      pageNum = pagination.totalPages - 2 + i;
                                    } else {
                                      pageNum = currentPage - 1 + i;
                                    }

                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => {
                                          setCurrentPage(pageNum);
                                          scrollToTop();
                                        }}
                                        className={`w-8 h-8 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                          currentPage === pageNum
                                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm"
                                            : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  },
                                )}

                                {pagination.totalPages > 3 &&
                                  currentPage < pagination.totalPages - 1 && (
                                    <>
                                      {currentPage <
                                        pagination.totalPages - 2 && (
                                        <span className="px-1 text-gray-400 text-sm">
                                          ...
                                        </span>
                                      )}
                                      <button
                                        onClick={() => {
                                          setCurrentPage(pagination.totalPages);
                                          scrollToTop();
                                        }}
                                        className="w-8 h-8 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300 border border-gray-300"
                                      >
                                        {pagination.totalPages}
                                      </button>
                                    </>
                                  )}
                              </div>
                              <button
                                onClick={goToNextPage}
                                disabled={currentPage === pagination.totalPages}
                                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100 rounded-xl hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-1.5 border border-gray-300"
                              >
                                {t("pagination.next")}
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200">
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
                        className="px-8 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
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
