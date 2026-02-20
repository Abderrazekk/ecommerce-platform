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
  Anime: "anime",
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
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 px-2 transition-colors duration-200 group"
      >
        <span className="font-medium text-gray-900 text-sm flex items-center gap-2">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="pb-4 px-2 space-y-2">{children}</div>}
    </div>
  );

  const MobileFilterDrawer = () => (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMobileFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileFilterOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 h-full w-full max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileFilterOpen
            ? "translate-x-0"
            : "ltr:translate-x-full rtl:-translate-x-full"
        } ltr:right-0 rtl:left-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary-600" />
            {t("filters.title")}
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="h-[calc(100vh-130px)] overflow-y-auto p-4">
          {renderFilterSection(
            t("filters.sections.categories"),
            isCategoryOpen,
            setIsCategoryOpen,
            <div className="space-y-1">
              {categoryOptions.map((option) => (
                <label
                  key={option.value || "all"}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="category-mobile"
                    value={option.value}
                    checked={selectedCategory === option.value}
                    onChange={() => {
                      setSelectedCategory(option.value);
                      setCurrentPage(1);
                    }}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>,
          )}

          {renderFilterSection(
            t("filters.sections.priceRange"),
            isPriceOpen,
            setIsPriceOpen,
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    {t("filters.price.min")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      {t("filters.currency")}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    {t("filters.price.max")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      {t("filters.currency")}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
              {/* Simple range visual */}
              <div className="pt-2">
                <div className="relative h-1 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-full bg-primary-500 rounded-full"
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

          {renderFilterSection(
            t("filters.sections.brands"),
            isBrandOpen,
            setIsBrandOpen,
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="brand-mobile"
                  value=""
                  checked={selectedBrand === ""}
                  onChange={() => {
                    setSelectedBrand("");
                    setCurrentPage(1);
                  }}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  {t("products.allBrands")}
                </span>
              </label>
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="brand-mobile"
                    value={brand}
                    checked={selectedBrand === brand}
                    onChange={() => {
                      setSelectedBrand(brand);
                      setCurrentPage(1);
                    }}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 truncate">
                    {brand}
                  </span>
                </label>
              ))}
            </div>,
          )}

          {renderFilterSection(
            t("filters.sections.features"),
            isFeaturesOpen,
            setIsFeaturesOpen,
            <div className="space-y-1">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  {t("features.inStock")}
                </span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={discountedOnly}
                  onChange={(e) => setDiscountedOnly(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-orange-500" />
                  {t("features.onSale")}
                </span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  {t("features.featured")}
                </span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={aliExpressOnly}
                  onChange={(e) => setAliExpressOnly(e.target.checked)}
                  className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-orange-500" />
                  {t("features.aliexpress")}
                </span>
              </label>
            </div>,
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <div className="flex gap-3">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("filters.resetFilters")}
            </button>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              {t("filters.applyFilters")}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-width container for desktop */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <MobileFilterDrawer />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("header.title")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {t("header.subtitle")}
          </p>
        </div>

        {/* AliExpress warning */}
        {selectedCategory === ALIEXPRESS_CATEGORY_VALUE && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
            <div className="flex gap-3">
              <Globe className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{t("aliexpress.warning.title")}</p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-orange-700">
                  <li>{t("aliexpress.warning.deliveryTime")}</li>
                  <li>{t("aliexpress.warning.orderConfirmation")}</li>
                  <li>{t("aliexpress.warning.contactRequired")}</li>
                </ul>
                <p className="mt-2 font-medium">
                  {t("aliexpress.warning.note")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active filters */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">
                {t("filters.activeFilters", { count: activeFiltersCount })}:
              </span>
              {selectedCategory !== "" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-200">
                  {getCategoryLabel(selectedCategory)}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  {selectedBrand}
                  <button
                    onClick={() => setSelectedBrand("")}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(priceRange.min > 0 || priceRange.max < 10000) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                  {t("filterTags.price", {
                    min: priceRange.min,
                    max: priceRange.max,
                  })}
                  <button
                    onClick={() => setPriceRange({ min: 0, max: 10000 })}
                    className="hover:bg-emerald-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                  {t("filterTags.inStock")}
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {discountedOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200">
                  <Tag className="h-3 w-3" />
                  {t("filterTags.onSale")}
                  <button
                    onClick={() => setDiscountedOnly(false)}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {featuredOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                  <Star className="h-3 w-3" />
                  {t("filterTags.featured")}
                  <button
                    onClick={() => setFeaturedOnly(false)}
                    className="hover:bg-amber-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory === ALIEXPRESS_CATEGORY_VALUE && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-300">
                  <Globe className="h-3 w-3" />
                  {t("filterTags.aliexpress")}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {aliExpressOnly &&
                selectedCategory !== ALIEXPRESS_CATEGORY_VALUE && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-300">
                    <Globe className="h-3 w-3" />
                    {t("filterTags.aliexpressOnly")}
                    <button
                      onClick={() => setAliExpressOnly(false)}
                      className="hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              <button
                onClick={handleClearFilters}
                className="ml-auto flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                {t("filters.clearAll")}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary-600" />
                  {t("filters.title")}
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              {renderFilterSection(
                t("filters.sections.categories"),
                isCategoryOpen,
                setIsCategoryOpen,
                <div className="space-y-1">
                  {categoryOptions.map((option) => (
                    <label
                      key={option.value || "all"}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={option.value}
                        checked={selectedCategory === option.value}
                        onChange={() => {
                          setSelectedCategory(option.value);
                          setCurrentPage(1);
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>,
              )}

              {renderFilterSection(
                t("filters.sections.priceRange"),
                isPriceOpen,
                setIsPriceOpen,
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        {t("filters.price.min")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          {t("filters.currency")}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={priceRange.min}
                          onChange={(e) =>
                            handlePriceChange("min", e.target.value)
                          }
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        {t("filters.price.max")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          {t("filters.currency")}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={priceRange.max}
                          onChange={(e) =>
                            handlePriceChange("max", e.target.value)
                          }
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="relative h-1 bg-gray-200 rounded-full">
                      <div
                        className="absolute h-full bg-primary-500 rounded-full"
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

              {renderFilterSection(
                t("filters.sections.brands"),
                isBrandOpen,
                setIsBrandOpen,
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="brand"
                      value=""
                      checked={selectedBrand === ""}
                      onChange={() => {
                        setSelectedBrand("");
                        setCurrentPage(1);
                      }}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      {t("products.allBrands")}
                    </span>
                  </label>
                  {brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="brand"
                        value={brand}
                        checked={selectedBrand === brand}
                        onChange={() => {
                          setSelectedBrand(brand);
                          setCurrentPage(1);
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 truncate">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>,
              )}

              {renderFilterSection(
                t("filters.sections.features"),
                isFeaturesOpen,
                setIsFeaturesOpen,
                <div className="space-y-1">
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      {t("features.inStock")}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={discountedOnly}
                      onChange={(e) => setDiscountedOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-orange-500" />
                      {t("features.onSale")}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      {t("features.featured")}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={aliExpressOnly}
                      onChange={(e) => setAliExpressOnly(e.target.checked)}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-orange-500" />
                      {t("features.aliexpress")}
                    </span>
                  </label>
                </div>,
              )}

              <button
                onClick={handleClearFilters}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                {t("filters.resetFilters")}
              </button>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Mobile filter button and sort */}
            <div className="lg:hidden bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center border border-gray-200">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white text-primary-600 text-xs rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              {/* Optional sort dropdown could be added here */}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              </div>
            ) : (
              <>
                {filteredProducts().length > 0 ? (
                  <>
                    {/* Product grid - responsive with more columns on ultra-wide screens */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 mb-8">
                      {filteredProducts().map((product) => (
                        <div
                          key={product._id}
                          className="transform transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1"
                        >
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            {t("pagination.previous")}
                          </button>

                          <div className="flex items-center gap-1">
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
                                      className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                                        currentPage === pageNum
                                          ? "bg-primary-600 text-white"
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
                            {pagination.totalPages > 5 &&
                              currentPage < pagination.totalPages - 2 && (
                                <>
                                  <span className="px-1 text-gray-400">
                                    ...
                                  </span>
                                  <button
                                    onClick={() => {
                                      setCurrentPage(pagination.totalPages);
                                      scrollToTop();
                                    }}
                                    className="w-8 h-8 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300"
                                  >
                                    {pagination.totalPages}
                                  </button>
                                </>
                              )}
                          </div>

                          <button
                            onClick={goToNextPage}
                            disabled={currentPage === pagination.totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                          >
                            {t("pagination.next")}
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-center text-xs text-gray-500 mt-2">
                          {t("pagination.page", {
                            current: currentPage,
                            total: pagination.totalPages,
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t("products.noProducts")}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {t("products.noProductsMessage")}
                      </p>
                      <button
                        onClick={handleClearFilters}
                        className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
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
