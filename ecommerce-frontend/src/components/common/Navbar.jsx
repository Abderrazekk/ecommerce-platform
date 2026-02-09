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
      path: "/shop?category=Electronics & Gadgets",
      desc: t("shopCategories.electronics.description"),
    },
    {
      name: t("shopCategories.fashion.name"),
      path: "/shop?category=Fashion & Apparel",
      desc: t("shopCategories.fashion.description"),
    },
    {
      name: t("shopCategories.beauty.name"),
      path: "/shop?category=Beauty & Personal Care",
      desc: t("shopCategories.beauty.description"),
    },
    {
      name: t("shopCategories.homeKitchen.name"),
      path: "/shop?category=Home & Kitchen",
      desc: t("shopCategories.homeKitchen.description"),
    },
    {
      name: t("shopCategories.fitness.name"),
      path: "/shop?category=Fitness & Outdoors",
      desc: t("shopCategories.fitness.description"),
    },
    {
      name: t("shopCategories.babyKids.name"),
      path: "/shop?category=Baby & Kids",
      desc: t("shopCategories.babyKids.description"),
    },
    {
      name: t("shopCategories.pets.name"),
      path: "/shop?category=Pets",
      desc: t("shopCategories.pets.description"),
    },
    {
      name: t("shopCategories.automotive.name"),
      path: "/shop?category=Automotive & Tools",
      desc: t("shopCategories.automotive.description"),
    },
    {
      name: t("shopCategories.lifestyle.name"),
      path: "/shop?category=Lifestyle & Hobbies",
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
    {
      name: t("menu.about"),
      path: "/about",
      icon: <FaInfoCircle className="h-4 w-4" />,
    },
    {
      name: t("menu.contact"),
      path: "/contact",
      icon: <FaEnvelope className="h-4 w-4" />,
    },
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
        className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20"
        role="listbox"
        id="navbar-search-results"
        aria-label="Search suggestions"
      >
        {isSearching && (
          <div className="px-4 py-3 text-sm text-gray-500">
            {t("search.searching")}
          </div>
        )}
        {!isSearching && searchError && (
          <div className="px-4 py-3 text-sm text-red-500">{searchError}</div>
        )}
        {!isSearching && !searchError && searchResults.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-500">
            {t("search.noResults")}
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
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-150 ${
                activeResultIndex === index
                  ? "bg-primary-50 text-primary-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
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
                <p className="text-xs text-gray-500">
                  {(product.brand || t("search.brand")) +
                    " · " +
                    (product.category || t("search.category"))}
                </p>
              </div>
              <span className="text-xs font-semibold text-primary-600">
                {t("search.view")}
              </span>
            </button>
          ))}
      </div>
    );
  };

  return (
    <>
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-2 space-y-1 md:space-y-0">
            {/* Left side - Contact Info */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <FaPhone className="h-3 w-3" />
                <a
                  href="tel:+21655999444"
                  className="hover:text-primary-200 transition-colors"
                >
                  {t("header.phone")}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="h-3 w-3" />
                <a
                  href="mailto:Contact@shoppina.com"
                  className="hover:text-primary-200 transition-colors"
                >
                  {t("header.email")}
                </a>
              </div>
            </div>

            {/* Right side - Social Media Only (Language switcher moved to main nav) */}
            <div className="flex items-center space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61585767552922"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
                aria-label={t("header.social.facebook")}
              >
                <FaFacebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/shoppina_tn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-300 transition-colors"
                aria-label={t("header.social.instagram")}
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@shoppina_tn?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
                aria-label={t("header.social.tiktok")}
              >
                <FaTiktok className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="relative">
                  <img
                    src="/shoppina1.jpg"
                    alt="Shoppina Logo"
                    className="h-10 w-auto object-contain"
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
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                >
                  {item.name}
                </Link>
              ))}

              {/* Shop with Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShopDropdown(true)}
                onMouseLeave={() => setShopDropdown(false)}
              >
                <Link
                  to="/shop"
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                >
                  <span>{t("menu.shop")}</span>
                  <FaChevronDown
                    className={`ml-1 h-3 w-3 transition-transform duration-200 ${shopDropdown ? "rotate-180" : ""}`}
                  />
                </Link>

                {/* Shop Dropdown Menu */}
                {shopDropdown && (
                  <div
                    className="absolute left-0 mt-0 w-[700px] bg-white rounded-lg shadow-lg py-4 border border-gray-200 z-10"
                    onMouseEnter={() => setShopDropdown(true)}
                    onMouseLeave={() => setShopDropdown(false)}
                  >
                    <div className="px-6 pb-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {t("menu.shopCategories")}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {t("menu.browseCollection")}
                          </p>
                        </div>
                        <Link
                          to="/shop"
                          className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
                          onClick={() => setShopDropdown(false)}
                        >
                          {t("menu.viewAll")}
                        </Link>
                      </div>
                    </div>

                    <div className="px-6 pt-4">
                      {/* 3-column grid layout */}
                      <div className="grid grid-cols-3 gap-4">
                        {/* Column 1 */}
                        <div className="space-y-2">
                          {shopCategories.slice(0, 3).map((category) => (
                            <Link
                              key={category.name}
                              to={category.path}
                              className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                              onClick={() => setShopDropdown(false)}
                            >
                              <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                                {category.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {category.desc}
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-2">
                          {shopCategories.slice(3, 6).map((category) => (
                            <Link
                              key={category.name}
                              to={category.path}
                              className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                              onClick={() => setShopDropdown(false)}
                            >
                              <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                                {category.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {category.desc}
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Column 3 */}
                        <div className="space-y-2">
                          {shopCategories.slice(6, 9).map((category) => (
                            <Link
                              key={category.name}
                              to={category.path}
                              className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                              onClick={() => setShopDropdown(false)}
                            >
                              <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                                {category.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {category.desc}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Quick Links */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Link
                            to="/shop?discount=true"
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                            onClick={() => setShopDropdown(false)}
                          >
                            {t("menu.quickLinks.onSale")}
                          </Link>
                          <span className="text-gray-300">•</span>
                          <Link
                            to="/shop?featured=true"
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                            onClick={() => setShopDropdown(false)}
                          >
                            {t("menu.quickLinks.featured")}
                          </Link>
                          <span className="text-gray-300">•</span>
                          <Link
                            to="/shop?new=true"
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
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

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 justify-center px-9">
              <form
                onSubmit={handleSearch}
                className="w-full max-w-md"
                ref={desktopSearchContainerRef}
              >
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                    className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  />
                  {renderSearchDropdown()}
                </div>
              </form>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-3">
              {/* Search Icon - Mobile & Desktop */}
              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="md:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                aria-label="Search"
              >
                <FaSearch className="h-5 w-5" />
              </button>

              {/* Language Switcher - Moved to main navbar */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setLanguageDropdown(!languageDropdown)}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                  aria-label="Change language"
                >
                  <FaGlobe className="h-5 w-5" />
                  <span className="hidden md:inline text-sm font-medium">
                    {i18n.language === "en"
                      ? "EN"
                      : i18n.language === "fr"
                        ? "FR"
                        : "AR"}
                  </span>
                  <FaChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${languageDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {languageDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`flex items-center space-x-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-all duration-200 ${
                          i18n.language === lang.code
                            ? "text-primary-600 bg-primary-50"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
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

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                onClick={() => {
                  if (isAuthenticated) {
                    dispatch(fetchWishlist());
                  }
                }}
              >
                <FaHeart className="h-5 w-5" />
                <span
                  className={`absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 ${
                    wishlistCount > 0
                      ? "bg-red-500 scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  }`}
                  key={`wishlist-badge-${wishlistCount}`}
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <FaShoppingCart className="h-5 w-5" />
                <span
                  className={`absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 ${
                    cartItemCount > 0
                      ? "bg-primary-500 scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  }`}
                  key={`cart-badge-${cartItemCount}`}
                >
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 animate-ping"></span>
                  </span>
                )}
              </Link>

              {/* Desktop User Menu */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center">
                  {user?.role === "admin" && (
                    <div className="relative">
                      <button
                        onClick={() => setAdminDropdown(!adminDropdown)}
                        className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        <FaUserCog className="h-4 w-4" />
                        <span>{t("user.admin")}</span>
                        <FaChevronDown
                          className={`h-3 w-3 transition-transform duration-200 ${adminDropdown ? "rotate-180" : ""}`}
                        />
                      </button>
                      {adminDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-10">
                          {adminMenuItems.map((item) => (
                            <Link
                              key={item.name}
                              to={item.path}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                              onClick={() => setAdminDropdown(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdown(!userDropdown)}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center">
                        <FaUser className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{user?.name}</span>
                      <FaChevronDown
                        className={`h-3 w-3 transition-transform duration-200 ${userDropdown ? "rotate-180" : ""}`}
                      />
                    </button>
                    {userDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-10">
                        <Link
                          to="/wishlist"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                          onClick={() => {
                            setUserDropdown(false);
                            dispatch(fetchWishlist());
                          }}
                        >
                          <FaHeart className="h-4 w-4" />
                          <span>{t("user.myWishlist")}</span>
                          {wishlistCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/my-orders"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                          onClick={() => setUserDropdown(false)}
                        >
                          <FaBox className="h-4 w-4" />
                          <span>{t("user.myOrders")}</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
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
                          className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
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
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    {t("user.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-sm"
                  >
                    {t("user.register")}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
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

          {/* Mobile Search Bar */}
          {isSearchVisible && (
            <div className="md:hidden py-3 border-t border-gray-100">
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pl-12 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200"
                  />
                  {renderSearchDropdown()}
                </div>
              </form>
            </div>
          )}

          {/* Mobile Menu Dropdown */}
          {isOpen && (
            <div
              ref={mobileMenuRef}
              className="md:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto"
              style={{
                height: "calc(100vh - 4rem)",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/* Language Switcher in Mobile Menu */}
              <div className="border-b border-gray-100">
                <div className="px-4 py-3 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">
                    Language / Langue / اللغة
                  </p>
                </div>
                <div className="px-4 py-2">
                  <div className="flex space-x-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setIsOpen(false);
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          i18n.language === lang.code
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="py-2">
                <Link
                  to="/"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaHome className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">{t("menu.home")}</span>
                </Link>

                <Link
                  to="/shop"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaStore className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">{t("menu.shop")}</span>
                </Link>

                {/* Shop Categories in Mobile */}
                <div className="border-b border-gray-50">
                  <div className="px-4 py-3 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">
                      {t("menu.shopCategories")}
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {shopCategories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        className="flex items-center px-4 py-3 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50 last:border-0 pl-8"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaChevronRight className="h-3 w-3 text-gray-400 mr-2" />
                        <span>{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to="/about"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaInfoCircle className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">{t("menu.about")}</span>
                </Link>

                <Link
                  to="/contact"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaEnvelope className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">{t("menu.contact")}</span>
                </Link>
              </div>

              {/* Wishlist Item Count Display */}
              <Link
                to="/wishlist"
                className="flex items-center justify-between px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                onClick={() => {
                  setIsOpen(false);
                  if (isAuthenticated) {
                    dispatch(fetchWishlist());
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <FaHeart className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">{t("wishlist.wishlist")}</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                    {t("wishlist.items", { count: wishlistCount })}
                  </span>
                )}
              </Link>

              {/* Cart Item Count Display */}
              <Link
                to="/cart"
                className="flex items-center justify-between px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <FaShoppingCart className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">{t("cart.shoppingCart")}</span>
                </div>
                {cartItemCount > 0 && (
                  <span className="bg-primary-600 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                    {t("cart.items", { count: cartItemCount })}
                  </span>
                )}
              </Link>

              {/* User Section */}
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-50 bg-primary-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center">
                        <FaUser className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
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
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                    onClick={() => {
                      setIsOpen(false);
                      dispatch(fetchWishlist());
                    }}
                  >
                    <FaHeart className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">{t("user.myWishlist")}</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* My Orders */}
                  <Link
                    to="/my-orders"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaBox className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">{t("user.myOrders")}</span>
                  </Link>

                  {/* My Profile */}
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">{t("user.myProfile")}</span>
                  </Link>

                  {/* Admin Panel */}
                  {user?.role === "admin" && (
                    <>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          {t("admin.panel")}
                        </p>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {adminMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50 pl-8"
                            onClick={() => setIsOpen(false)}
                          >
                            <FaChevronRight className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{item.name}</span>
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
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 border-b border-gray-50"
                  >
                    <FaSignOutAlt className="h-5 w-5" />
                    <span className="font-medium">{t("user.logout")}</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-gray-50 bg-primary-50">
                    <p className="font-semibold text-gray-900">
                      {t("user.welcome")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("user.pleaseLogin")}
                    </p>
                  </div>

                  <Link
                    to="/login"
                    className="flex items-center justify-center space-x-2 px-4 py-3 text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="h-5 w-5" />
                    <span className="font-semibold">
                      {t("user.loginToAccount")}
                    </span>
                  </Link>

                  <Link
                    to="/register"
                    className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="font-semibold">
                      {t("user.createAccount")}
                    </span>
                  </Link>
                </>
              )}

              {/* Footer Info */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 sticky bottom-0">
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
