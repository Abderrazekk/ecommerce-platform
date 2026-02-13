import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { logout } from "../../redux/slices/auth.slice";
import { clearCart } from "../../redux/slices/cart.slice";
import { fetchWishlist } from "../../redux/slices/wishlist.slice";
import productService from "../../services/product.service";
import {
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaSearch,
  FaHome,
  FaStore,
  FaInfoCircle,
  FaEnvelope,
  FaUserCog,
  FaBox,
  FaSignOutAlt,
  FaHeart,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaGlobe,
} from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [shopDropdown, setShopDropdown] = useState(false);
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const { t, i18n } = useTranslation("navbar");
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { itemCount: wishlistCount } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Refs for dropdowns
  const languageDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const desktopSearchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const shopDropdownRef = useRef(null);
  const shopTriggerRef = useRef(null);

  // Language configuration
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸", dir: "ltr" },
    { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
    { code: "ar", name: "العربية", flag: "🇹🇳", dir: "rtl" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageDropdown(false);

    // Force set direction immediately
    if (lng === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
      document.body.classList.add("rtl");
      document.body.classList.remove("ltr");
      localStorage.setItem("direction", "rtl");
    } else {
      document.documentElement.dir = "ltr";
      document.body.classList.add("ltr");
      document.body.classList.remove("rtl");
      localStorage.setItem("direction", "ltr");
    }

    // Force a small delay and check
    setTimeout(() => {
      const currentDir = document.documentElement.dir;
      if (lng === "ar" && currentDir !== "rtl") {
        document.documentElement.dir = "rtl";
        document.body.classList.add("rtl");
      }
    }, 100);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle language dropdown
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setLanguageDropdown(false);
      }

      // Handle shop dropdown
      if (
        shopTriggerRef.current &&
        !shopTriggerRef.current.contains(event.target) &&
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(event.target)
      ) {
        setShopDropdown(false);
      }

      // Handle search dropdowns
      const clickedDesktop = desktopSearchContainerRef.current?.contains(
        event.target,
      );
      const clickedMobile = mobileSearchContainerRef.current?.contains(
        event.target,
      );
      if (!clickedDesktop && !clickedMobile) {
        setIsSearchDropdownOpen(false);
        setActiveResultIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Synchronize wishlist on auth change and periodically
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
      const syncInterval = setInterval(() => {
        dispatch(fetchWishlist());
      }, 30000);
      return () => clearInterval(syncInterval);
    }
  }, [dispatch, isAuthenticated]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isSearchVisible && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  useEffect(() => {
    const query = searchQuery.trim();
    setSearchError("");

    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      setActiveResultIndex(-1);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const response = await productService.getProducts(1, 6, "", query, "");
        const products = response?.data?.products || [];
        setSearchResults(products);
        setIsSearchDropdownOpen(true);
      } catch (error) {
        setSearchError(error?.response?.data?.message || t("search.error"));
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, t]);

  // Shop categories
  const shopCategories = [
    {
      name: t("shopCategories.electronics.name"),
      path: `/shop?category=${encodeURIComponent("Electronics & Gadgets")}`,
      desc: t("shopCategories.electronics.description"),
    },
    {
      name: t("shopCategories.fashion.name"),
      path: `/shop?category=${encodeURIComponent("Fashion & Apparel")}`,
      desc: t("shopCategories.fashion.description"),
    },
    {
      name: t("shopCategories.beauty.name"),
      path: `/shop?category=${encodeURIComponent("Beauty & Personal Care")}`,
      desc: t("shopCategories.beauty.description"),
    },
    {
      name: t("shopCategories.homeKitchen.name"),
      path: `/shop?category=${encodeURIComponent("Home & Kitchen")}`,
      desc: t("shopCategories.homeKitchen.description"),
    },
    {
      name: t("shopCategories.fitness.name"),
      path: `/shop?category=${encodeURIComponent("Fitness & Outdoors")}`,
      desc: t("shopCategories.fitness.description"),
    },
    {
      name: t("shopCategories.babyKids.name"),
      path: `/shop?category=${encodeURIComponent("Baby & Kids")}`,
      desc: t("shopCategories.babyKids.description"),
    },
    {
      name: t("shopCategories.pets.name"),
      path: `/shop?category=${encodeURIComponent("Pets")}`,
      desc: t("shopCategories.pets.description"),
    },
    {
      name: t("shopCategories.automotive.name"),
      path: `/shop?category=${encodeURIComponent("Automotive & Tools")}`,
      desc: t("shopCategories.automotive.description"),
    },
    {
      name: t("shopCategories.lifestyle.name"),
      path: `/shop?category=${encodeURIComponent("Lifestyle & Hobbies")}`,
      desc: t("shopCategories.lifestyle.description"),
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
      setSearchQuery("");
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      setIsSearchVisible(false);
      setIsOpen(false);
    }
  };

  const handleResultSelect = (product) => {
    if (!product?._id) return;
    navigate(`/product/${product._id}`);
    setSearchQuery("");
    setSearchResults([]);
    setActiveResultIndex(-1);
    setIsSearchDropdownOpen(false);
    setIsSearchVisible(false);
    setIsOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (!searchResults.length) {
      if (event.key === "Escape") {
        setIsSearchDropdownOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveResultIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0,
      );
      setIsSearchDropdownOpen(true);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveResultIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1,
      );
      setIsSearchDropdownOpen(true);
    }

    if (event.key === "Enter" && activeResultIndex >= 0) {
      event.preventDefault();
      handleResultSelect(searchResults[activeResultIndex]);
    }

    if (event.key === "Escape") {
      setIsSearchDropdownOpen(false);
      setActiveResultIndex(-1);
    }
  };

  const menuItems = [
    { name: t("menu.home"), path: "/", icon: <FaHome className="h-4 w-4" /> },
  ];

  const adminMenuItems = [
    { name: t("admin.dashboard"), path: "/admin/dashboard" },
    { name: t("admin.hero"), path: "/admin/hero" },
    { name: t("admin.products"), path: "/admin/products" },
    { name: t("admin.orders"), path: "/admin/orders" },
    { name: t("admin.users"), path: "/admin/users" },
    { name: t("admin.sponsors"), path: "/admin/sponsors" },
  ];

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const activeResultId =
    activeResultIndex >= 0 && searchResults[activeResultIndex]
      ? `search-result-${searchResults[activeResultIndex]._id}`
      : undefined;

  const renderSearchDropdown = () => {
    if (!isSearchDropdownOpen || (!isSearching && !searchQuery.trim())) {
      return null;
    }

    return (
      <div
        className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-sm bg-white/95"
        role="listbox"
        id="navbar-search-results"
        aria-label="Search suggestions"
      >
        {isSearching && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 font-medium">
                {t("search.searching")}
              </span>
            </div>
          </div>
        )}
        {!isSearching && searchError && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 text-red-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium">{searchError}</span>
            </div>
          </div>
        )}
        {!isSearching && !searchError && searchResults.length === 0 && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 text-gray-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium">
                {t("search.noResults")}
              </span>
            </div>
          </div>
        )}
        {!isSearching &&
          !searchError &&
          searchResults.map((product, index) => (
            <button
              key={product._id}
              type="button"
              role="option"
              id={`search-result-${product._id}`}
              aria-selected={activeResultIndex === index}
              onClick={() => handleResultSelect(product)}
              className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all duration-200 border-b border-gray-100 last:border-0 ${
                activeResultIndex === index
                  ? "bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex items-center justify-center shadow-sm">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400">
                    {t("search.noImage")}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(product.brand || t("search.brand")) +
                    " · " +
                    (product.category || t("search.category"))}
                </p>
              </div>
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
                {t("search.view")}
              </span>
            </button>
          ))}
      </div>
    );
  };

  return (
    <>
      {/* Premium Top Header Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center py-2 space-y-2 md:space-y-0">
            {/* Left side - Contact Info - REMOVED CADRE */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm">
              <div className="flex items-center gap-2 group">
                <FaPhone className="h-4 w-4 text-primary-300 group-hover:text-primary-200 transition-colors" />
                <a
                  href="tel:+21655999444"
                  className="hover:text-primary-300 transition-colors text-sm font-medium"
                >
                  {t("header.phone")}
                </a>
              </div>
              <div className="flex items-center gap-2 group">
                <FaEnvelope className="h-4 w-4 text-primary-300 group-hover:text-primary-200 transition-colors" />
                <a
                  href="mailto:Contact@shoppina.com"
                  className="hover:text-primary-300 transition-colors text-sm font-medium"
                >
                  {t("header.email")}
                </a>
              </div>
            </div>

            {/* Right side - Social Media Only */}
            <div className="flex items-center space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61585767552922"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-300 transition-colors"
                aria-label={t("header.social.facebook")}
              >
                <FaFacebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/shoppina_tn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-300 transition-colors"
                aria-label={t("header.social.instagram")}
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@shoppina_tn?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-300 transition-colors"
                aria-label={t("header.social.tiktok")}
              >
                <FaTiktok className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Main Navigation */}
      <nav className="bg-white/95 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - REMOVED TEXT, ONLY LOGO IMAGE */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <img
                    src="/shoppina33.png"
                    alt="Shoppina Logo"
                    className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%2310b981'/%3E%3Ctext x='50' y='50' font-size='40' text-anchor='middle' dy='.3em' fill='white' font-family='Arial'%3ES%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Menu - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2 ml-10">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="px-5 py-3 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300 font-medium text-sm group"
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {item.name}
                    </span>
                  </div>
                </Link>
              ))}

              {/* Shop with Premium Dropdown - FIXED HOVER ISSUE */}
              <div
                className="relative"
                ref={shopTriggerRef}
                onMouseEnter={() => setShopDropdown(true)}
                onMouseLeave={(e) => {
                  // Check if mouse is leaving the trigger area and not entering the dropdown
                  const relatedTarget = e.relatedTarget;
                  if (
                    shopDropdownRef.current &&
                    !shopDropdownRef.current.contains(relatedTarget)
                  ) {
                    setShopDropdown(false);
                  }
                }}
              >
                <Link
                  to="/shop"
                  className="flex items-center px-5 py-3 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300 font-medium text-sm group"
                >
                  <FaStore className="h-4 w-4 mr-2" />
                  <span>{t("menu.shop")}</span>
                  <FaChevronDown
                    className={`ml-2 h-3 w-3 transition-transform duration-300 ${
                      shopDropdown ? "rotate-180" : ""
                    }`}
                  />
                </Link>

                {/* Premium Shop Dropdown Menu */}
                {shopDropdown && (
                  <div
                    ref={shopDropdownRef}
                    className="absolute left-0 mt-0 w-[800px] bg-white rounded-2xl shadow-2xl py-4 border border-gray-100 z-50 backdrop-blur-lg bg-white/95"
                    onMouseEnter={() => setShopDropdown(true)}
                    onMouseLeave={() => setShopDropdown(false)}
                    style={{ top: "100%" }}
                  >
                    <div className="px-8 pb-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {t("menu.shopCategories")}
                          </h3>
                          <p className="text-sm text-gray-500 mt-2">
                            {t("menu.browseCollection")}
                          </p>
                        </div>
                        <Link
                          to="/shop"
                          className="px-5 py-2.5 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl transition-all duration-300 border-2 border-primary-100"
                          onClick={() => setShopDropdown(false)}
                        >
                          {t("menu.viewAll")}
                        </Link>
                      </div>
                    </div>

                    <div className="px-8 pt-4">
                      {/* 3-column grid layout */}
                      <div className="grid grid-cols-3 gap-6">
                        {/* Column 1 */}
                        <div className="space-y-3">
                          {shopCategories.slice(0, 3).map((category) => (
                            <Link
                              key={category.name}
                              to={category.path}
                              className="block p-4 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-gray-50 to-white rounded-xl transition-all duration-300 group border border-gray-100 hover:border-primary-100 hover:shadow-lg"
                              onClick={() => setShopDropdown(false)}
                            >
                              <div className="font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                                {category.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {category.desc}
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-3">
                          {shopCategories.slice(3, 6).map((category) => (
                            <Link
                              key={category.name}
                              to={category.path}
                              className="block p-4 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-gray-50 to-white rounded-xl transition-all duration-300 group border border-gray-100 hover:border-primary-100 hover:shadow-lg"
                              onClick={() => setShopDropdown(false)}
                            >
                              <div className="font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                                {category.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {category.desc}
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Column 3 */}
                        <div className="space-y-3">
                          {shopCategories.slice(6, 9).map((category) => (
                            <Link
                              key={category.name}
                              to={category.path}
                              className="block p-4 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-gray-50 to-white rounded-xl transition-all duration-300 group border border-gray-100 hover:border-primary-100 hover:shadow-lg"
                              onClick={() => setShopDropdown(false)}
                            >
                              <div className="font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                                {category.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {category.desc}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Quick Links */}
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                          <Link
                            to="/shop?discount=true"
                            className="px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-primary-200"
                            onClick={() => setShopDropdown(false)}
                          >
                            {t("menu.quickLinks.onSale")}
                          </Link>
                          <Link
                            to="/shop?featured=true"
                            className="px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-primary-200"
                            onClick={() => setShopDropdown(false)}
                          >
                            {t("menu.quickLinks.featured")}
                          </Link>
                          <Link
                            to="/shop?new=true"
                            className="px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-primary-200"
                            onClick={() => setShopDropdown(false)}
                          >
                            {t("menu.quickLinks.newArrivals")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Desktop Search */}
            <div className="hidden md:flex flex-1 justify-center px-10">
              <form
                onSubmit={handleSearch}
                className="w-full max-w-xl"
                ref={desktopSearchContainerRef}
              >
                <div className="relative">
                  <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={desktopSearchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={t("search.placeholder")}
                    aria-label="Search products"
                    aria-expanded={isSearchDropdownOpen}
                    aria-controls="navbar-search-results"
                    aria-activedescendant={activeResultId}
                    className="w-full rounded-2xl border-2 border-gray-200 bg-white py-3 pl-12 pr-5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  {renderSearchDropdown()}
                </div>
              </form>
            </div>

            {/* Right side icons - Premium */}
            <div className="flex items-center space-x-4">
              {/* Search Icon - Mobile & Desktop */}
              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="md:hidden p-2.5 text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300"
                aria-label="Search"
              >
                <FaSearch className="h-5 w-5" />
              </button>

              {/* Language Switcher Icon - Hidden on mobile, shown on desktop */}
              <div
                className="hidden md:block relative"
                ref={languageDropdownRef}
              >
                <button
                  onClick={() => setLanguageDropdown(!languageDropdown)}
                  className="flex items-center space-x-1 px-3 py-2.5 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300"
                  aria-label="Change language"
                >
                  <FaGlobe className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {i18n.language === "en"
                      ? "EN"
                      : i18n.language === "fr"
                        ? "FR"
                        : "AR"}
                  </span>
                  <FaChevronDown
                    className={`h-3 w-3 transition-transform duration-300 ${
                      languageDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {languageDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 z-50 backdrop-blur-lg bg-white/95">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`flex items-center space-x-3 w-full px-4 py-3 text-sm hover:bg-gradient-to-r from-gray-50 to-white transition-all duration-300 ${
                          i18n.language === lang.code
                            ? "text-primary-600 bg-gradient-to-r from-primary-50 to-primary-100/50"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-semibold">{lang.name}</span>
                        {i18n.language === lang.code && (
                          <span className="ml-auto text-primary-600">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist Icon - Hidden on mobile, shown on desktop */}
              <Link
                to="/wishlist"
                className="hidden md:flex relative p-2.5 text-gray-600 hover:text-red-500 hover:bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl transition-all duration-300"
                onClick={() => {
                  if (isAuthenticated) {
                    dispatch(fetchWishlist());
                  }
                }}
              >
                <FaHeart className="h-5 w-5" />
                <span
                  className={`absolute -top-1.5 -right-1.5 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 shadow-lg ${
                    wishlistCount > 0
                      ? "bg-gradient-to-r from-red-500 to-pink-500 scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  }`}
                  key={`wishlist-badge-${wishlistCount}`}
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                  </span>
                )}
              </Link>

              {/* Premium Cart Icon - REMOVED CADRE */}
              <Link
                to="/cart"
                className="relative p-2.5 text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300"
              >
                <FaShoppingCart className="h-5 w-5" />
                <span
                  className={`absolute -top-1.5 -right-1.5 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 ${
                    cartItemCount > 0
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  }`}
                  key={`cart-badge-${cartItemCount}`}
                >
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping"></span>
                  </span>
                )}
              </Link>

              {/* Desktop User Menu - Premium */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center">
                  {user?.role === "admin" && (
                    <div className="relative">
                      <button
                        onClick={() => setAdminDropdown(!adminDropdown)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300 font-semibold text-sm"
                      >
                        <FaUserCog className="h-4 w-4" />
                        <span>{t("user.admin")}</span>
                        <FaChevronDown
                          className={`h-3 w-3 transition-transform duration-300 ${
                            adminDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {adminDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 z-10 backdrop-blur-lg bg-white/95">
                          {adminMenuItems.map((item) => (
                            <Link
                              key={item.name}
                              to={item.path}
                              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 hover:text-primary-600 transition-all duration-300"
                              onClick={() => setAdminDropdown(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Premium User Dropdown - REMOVED CADRE AROUND USER ICON */}
                  <div className="relative ml-2">
                    <button
                      onClick={() => setUserDropdown(!userDropdown)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300"
                    >
                      <FaUser className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-sm">
                        {user?.name}
                      </span>
                      <FaChevronDown
                        className={`h-3 w-3 transition-transform duration-300 ${
                          userDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {userDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 z-10 backdrop-blur-lg bg-white/95">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          to="/wishlist"
                          className="flex items-center justify-between space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r from-gray-50 to-white hover:text-primary-600 transition-all duration-300"
                          onClick={() => {
                            setUserDropdown(false);
                            dispatch(fetchWishlist());
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <FaHeart className="h-4 w-4" />
                            <span>{t("user.myWishlist")}</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/my-orders"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r from-gray-50 to-white hover:text-primary-600 transition-all duration-300"
                          onClick={() => setUserDropdown(false)}
                        >
                          <FaBox className="h-4 w-4" />
                          <span>{t("user.myOrders")}</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r from-gray-50 to-white hover:text-primary-600 transition-all duration-300"
                          onClick={() => setUserDropdown(false)}
                        >
                          <FaUser className="h-4 w-4" />
                          <span>{t("user.myProfile")}</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setUserDropdown(false);
                          }}
                          className="flex items-center space-x-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r from-red-50 to-red-100/50 transition-all duration-300"
                        >
                          <FaSignOutAlt className="h-4 w-4" />
                          <span>{t("user.logout")}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300 font-semibold text-sm"
                  >
                    {t("user.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl"
                  >
                    {t("user.register")}
                  </Link>
                </div>
              )}

              {/* Premium Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2.5 text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl transition-all duration-300"
                aria-label="Menu"
              >
                {isOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Premium Mobile Search Bar */}
          {isSearchVisible && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative" ref={mobileSearchContainerRef}>
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={t("search.placeholder")}
                    aria-label="Search products"
                    aria-expanded={isSearchDropdownOpen}
                    aria-controls="navbar-search-results"
                    aria-activedescendant={activeResultId}
                    className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 pl-12 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 shadow-sm"
                  />
                  {renderSearchDropdown()}
                </div>
              </form>
            </div>
          )}

          {/* Premium Mobile Menu Dropdown */}
          {isOpen && (
            <div
              ref={mobileMenuRef}
              className="md:hidden fixed inset-0 top-20 bg-white z-40 overflow-y-auto"
              style={{
                height: "calc(100vh - 5rem)",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/* Language Switcher in Mobile Menu */}
              <div className="border-b border-gray-100">
                <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100/50">
                  <p className="text-sm font-bold text-gray-900">
                    Language / Langue / اللغة
                  </p>
                </div>
                <div className="px-4 py-3">
                  <div className="grid grid-cols-3 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setIsOpen(false);
                        }}
                        className={`flex flex-col items-center justify-center py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          i18n.language === lang.code
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                            : "bg-gray-50 text-gray-700 hover:bg-gradient-to-r from-gray-100 to-white border border-gray-200"
                        }`}
                      >
                        <span className="text-2xl mb-2">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="py-2">
                <Link
                  to="/"
                  className="flex items-center space-x-4 px-5 py-4 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 transition-all duration-300 border-b border-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                    <FaHome className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="font-semibold text-base">
                    {t("menu.home")}
                  </span>
                </Link>

                <Link
                  to="/shop"
                  className="flex items-center space-x-4 px-5 py-4 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 transition-all duration-300 border-b border-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                    <FaStore className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="font-semibold text-base">
                    {t("menu.shop")}
                  </span>
                </Link>

                {/* Shop Categories in Mobile */}
                <div className="border-b border-gray-100">
                  <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100">
                    <p className="text-sm font-bold text-gray-900">
                      {t("menu.shopCategories")}
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {shopCategories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        className="flex items-center px-5 py-3.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 transition-all duration-300 border-b border-gray-50 last:border-0 pl-8"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaChevronRight className="h-3 w-3 text-gray-400 mr-3" />
                        <span className="font-medium">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Premium Cart Item Count Display */}
              <Link
                to="/cart"
                className="flex items-center justify-between px-5 py-4 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 transition-all duration-300 border-b border-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                    <FaShoppingCart className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="font-semibold text-base">
                    {t("cart.shoppingCart")}
                  </span>
                </div>
                {cartItemCount > 0 && (
                  <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold px-3 py-1.5 rounded-full animate-pulse shadow-lg">
                    {t("cart.items", { count: cartItemCount })}
                  </span>
                )}
              </Link>

              {/* Premium User Section */}
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-100/50">
                    <div className="flex items-center space-x-4">
                      <FaUser className="h-6 w-6 text-primary-600" />
                      <div>
                        <p className="font-bold text-lg text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-sm text-primary-600">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* My Wishlist */}
                  <Link
                    to="/wishlist"
                    className="flex items-center justify-between px-5 py-3.5 text-gray-700 hover:text-red-500 hover:bg-gradient-to-r from-red-50 to-red-100/50 transition-all duration-300 border-b border-gray-100"
                    onClick={() => {
                      setIsOpen(false);
                      dispatch(fetchWishlist());
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <FaHeart className="h-5 w-5 text-red-500" />
                      <span className="font-medium text-sm">
                        {t("user.myWishlist")}
                      </span>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* My Orders */}
                  <Link
                    to="/my-orders"
                    className="flex items-center space-x-3 px-5 py-3.5 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 transition-all duration-300 border-b border-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaBox className="h-5 w-5 text-primary-600" />
                    <span className="font-medium text-sm">
                      {t("user.myOrders")}
                    </span>
                  </Link>

                  {/* My Profile */}
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-5 py-3.5 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 transition-all duration-300 border-b border-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="h-5 w-5 text-primary-600" />
                    <span className="font-medium text-sm">
                      {t("user.myProfile")}
                    </span>
                  </Link>

                  {/* Premium Admin Panel */}
                  {user?.role === "admin" && (
                    <>
                      <div className="px-5 py-3 bg-gradient-to-r from-gray-900 to-black">
                        <p className="text-sm font-bold text-white uppercase tracking-wider">
                          {t("admin.panel")}
                        </p>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {adminMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className="flex items-center space-x-3 px-5 py-3 text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 transition-all duration-300 border-b border-gray-50 pl-8"
                            onClick={() => setIsOpen(false)}
                          >
                            <FaChevronRight className="h-3 w-3 text-gray-400" />
                            <span className="font-medium text-sm">
                              {item.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full text-left px-5 py-4 text-red-600 hover:bg-gradient-to-r from-red-50 to-red-100/50 transition-all duration-300 border-b border-gray-100"
                  >
                    <FaSignOutAlt className="h-5 w-5" />
                    <span className="font-semibold text-sm">
                      {t("user.logout")}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-100/50">
                    <p className="font-bold text-lg text-gray-900">
                      {t("user.welcome")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("user.pleaseLogin")}
                    </p>
                  </div>

                  <Link
                    to="/login"
                    className="flex items-center justify-center space-x-3 px-5 py-4 text-primary-600 hover:bg-gradient-to-r from-primary-50 to-primary-100/50 transition-all duration-300 border-b border-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="h-5 w-5" />
                    <span className="font-bold text-base">
                      {t("user.loginToAccount")}
                    </span>
                  </Link>

                  <Link
                    to="/register"
                    className="flex items-center justify-center px-5 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="font-bold text-base">
                      {t("user.createAccount")}
                    </span>
                  </Link>
                </>
              )}

              {/* Premium Footer Info */}
              <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 sticky bottom-0">
                <p className="text-xs text-gray-500 text-center">
                  {t("footer.copyright", { year: new Date().getFullYear() })}
                </p>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
