import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/auth.slice";
import { clearCart } from "../../redux/slices/cart.slice";
import { fetchWishlistCount } from "../../redux/slices/auth.slice";
import {
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaSearch,
  FaHome,
  FaStore,
  FaInfoCircle,
  FaEnvelope,
  FaUserCog,
  FaBox,
  FaSignOutAlt,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [shopDropdown, setShopDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { isAuthenticated, user, wishlistCount } = useSelector(
    (state) => state.auth,
  );
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch wishlist count on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlistCount());
    }
  }, [isAuthenticated, dispatch]);

  // Shop categories
  const shopCategories = [
    { name: "All Products", path: "/shop" },
    {
      name: "Electronics & Gadgets",
      path: "/shop?category=Electronics & Gadgets",
    },
    { name: "Fashion & Apparel", path: "/shop?category=Fashion & Apparel" },
    {
      name: "Beauty & Personal Care",
      path: "/shop?category=Beauty & Personal Care",
    },
    { name: "Home & Kitchen", path: "/shop?category=Home & Kitchen" },
    { name: "Fitness & Outdoors", path: "/shop?category=Fitness & Outdoors" },
    { name: "Baby & Kids", path: "/shop?category=Baby & Kids" },
    { name: "Pets", path: "/shop?category=Pets" },
    { name: "Automotive & Tools", path: "/shop?category=Automotive & Tools" },
    { name: "Lifestyle & Hobbies", path: "/shop?category=Lifestyle & Hobbies" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchVisible(false);
      setIsOpen(false);
    }
  };

  const menuItems = [
    { name: "Home", path: "/", icon: <FaHome className="h-4 w-4" /> },
    {
      name: "About",
      path: "/about",
      icon: <FaInfoCircle className="h-4 w-4" />,
    },
    {
      name: "Contact",
      path: "/contact",
      icon: <FaEnvelope className="h-4 w-4" />,
    },
  ];

  const adminMenuItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Hero", path: "/admin/hero" },
    { name: "Products", path: "/admin/products" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Users", path: "/admin/users" },
  ];

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
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
                <span>Shop</span>
                <FaChevronDown
                  className={`ml-1 h-3 w-3 transition-transform duration-200 ${shopDropdown ? "rotate-180" : ""}`}
                />
              </Link>

              {/* Shop Dropdown Menu - Clean Minimalist Design */}
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
                          Shop Categories
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Browse our collection
                        </p>
                      </div>
                      <Link
                        to="/shop"
                        className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
                        onClick={() => setShopDropdown(false)}
                      >
                        View All →
                      </Link>
                    </div>
                  </div>

                  <div className="px-6 pt-4">
                    {/* 3-column grid layout */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Column 1 */}
                      <div className="space-y-2">
                        <Link
                          to="/shop?category=Electronics & Gadgets"
                          className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          onClick={() => setShopDropdown(false)}
                        >
                          <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                            Electronics
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Phones, Laptops, Tablets
                          </div>
                        </Link>

                        <Link
                          to="/shop?category=Home & Kitchen"
                          className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          onClick={() => setShopDropdown(false)}
                        >
                          <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                            Home & Kitchen
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Appliances, Furniture
                          </div>
                        </Link>

                        <Link
                          to="/shop?category=Automotive & Tools"
                          className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          onClick={() => setShopDropdown(false)}
                        >
                          <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                            Automotive
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Tools, Accessories
                          </div>
                        </Link>
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2">
                        <Link
                          to="/shop?category=Fashion & Apparel"
                          className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          onClick={() => setShopDropdown(false)}
                        >
                          <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                            Fashion
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Clothing, Shoes, Bags
                          </div>
                        </Link>

                        <Link
                          to="/shop?category=Fitness & Outdoors"
                          className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          onClick={() => setShopDropdown(false)}
                        >
                          <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                            Fitness & Outdoors
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Sports, Camping, Yoga
                          </div>
                        </Link>

                        <Link
                          to="/shop?category=Pets"
                          className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          onClick={() => setShopDropdown(false)}
                        >
                          <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                            Pets
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Food, Toys, Accessories
                          </div>
                        </Link>
                      </div>

                      {/* Column 3 */}
                      <div className="space-y-2">
                        <Link
                          to="/shop?category=Beauty & Personal Care"
                          className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          onClick={() => setShopDropdown(false)}
                        >
                          <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                            Beauty & Care
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Skincare, Cosmetics
                          </div>
                        </Link>

                        <Link
                          to="/shop?category=Baby & Kids"
                          className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          onClick={() => setShopDropdown(false)}
                        >
                          <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                            Baby & Kids
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Toys, Clothing, Gear
                          </div>
                        </Link>

                        <Link
                          to="/shop?category=Lifestyle & Hobbies"
                          className="block p-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          onClick={() => setShopDropdown(false)}
                        >
                          <div className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                            Lifestyle & Hobbies
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Books, Games, Music
                          </div>
                        </Link>
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
                          On Sale
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link
                          to="/shop?featured=true"
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                          onClick={() => setShopDropdown(false)}
                        >
                          Featured
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link
                          to="/shop?new=true"
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                          onClick={() => setShopDropdown(false)}
                        >
                          New Arrivals
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Desktop Wishlist Icon */}
            <div className="hidden md:block">
              <Link
                to={isAuthenticated ? "/wishlist" : "/login"}
                className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                title="Wishlist"
              >
                <FaHeart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Search Icon - Mobile & Desktop */}
            <button
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              aria-label="Search"
            >
              <FaSearch className="h-5 w-5" />
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
            >
              <FaShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Desktop User Menu - Hidden on mobile */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                {user?.role === "admin" && (
                  <div className="relative">
                    <button
                      onClick={() => setAdminDropdown(!adminDropdown)}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      <FaUserCog className="h-4 w-4" />
                      <span>Admin</span>
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
                        onClick={() => setUserDropdown(false)}
                      >
                        <FaHeart className="h-4 w-4" />
                        <span>My Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="ml-auto bg-primary-100 text-primary-800 text-xs font-bold px-2 py-0.5 rounded-full">
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
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                        onClick={() => setUserDropdown(false)}
                      >
                        <FaUser className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserDropdown(false);
                        }}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <FaSignOutAlt className="h-4 w-4" />
                        <span>Logout</span>
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
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-sm"
                >
                  Register
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
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  autoFocus
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-40">
            {/* Navigation Links */}
            <div className="py-2">
              <Link
                to="/"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <FaHome className="h-5 w-5 text-primary-600" />
                <span className="font-medium">Home</span>
              </Link>

              <Link
                to="/shop"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <FaStore className="h-5 w-5 text-primary-600" />
                <span className="font-medium">Shop</span>
              </Link>

              {/* Shop Categories in Mobile */}
              <div className="pl-8 border-b border-gray-50">
                {shopCategories.slice(0, 5).map((category) => (
                  <Link
                    key={category.name}
                    to={category.path}
                    className="flex items-center px-4 py-3 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50 last:border-0"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{category.name}</span>
                  </Link>
                ))}
                {shopCategories.length > 5 && (
                  <Link
                    to="/shop"
                    className="flex items-center px-4 py-3 text-sm text-primary-600 hover:bg-primary-50 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>View All Categories →</span>
                  </Link>
                )}
              </div>

              <Link
                to="/about"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <FaInfoCircle className="h-5 w-5 text-primary-600" />
                <span className="font-medium">About</span>
              </Link>

              <Link
                to="/contact"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <FaEnvelope className="h-5 w-5 text-primary-600" />
                <span className="font-medium">Contact</span>
              </Link>
            </div>

            {/* Wishlist */}
            <Link
              to={isAuthenticated ? "/wishlist" : "/login"}
              className="flex items-center justify-between px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <FaHeart className="h-5 w-5 text-primary-600" />
                <span className="font-medium">Wishlist</span>
              </div>
              {isAuthenticated && wishlistCount > 0 && (
                <span className="bg-primary-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {wishlistCount} items
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
                <span className="font-medium">Shopping Cart</span>
              </div>
              {cartItemCount > 0 && (
                <span className="bg-primary-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {cartItemCount} items
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
                      <p className="text-sm text-primary-600">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* My Orders */}
                <Link
                  to="/my-orders"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaBox className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">My Orders</span>
                </Link>

                {/* My Profile */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">My Profile</span>
                </Link>

                {/* Admin Panel */}
                {user?.role === "admin" && (
                  <>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Admin Panel
                      </p>
                    </div>
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
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-50 bg-primary-50">
                  <p className="font-semibold text-gray-900">
                    Welcome to Shoppina
                  </p>
                  <p className="text-sm text-gray-600">
                    Please login to continue
                  </p>
                </div>

                <Link
                  to="/login"
                  className="flex items-center justify-center space-x-2 px-4 py-3 text-primary-600 hover:bg-primary-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="h-5 w-5" />
                  <span className="font-semibold">Login to Account</span>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-semibold">Create New Account</span>
                </Link>
              </>
            )}

            {/* Footer Info */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                © {new Date().getFullYear()} Shoppina. All rights reserved.
              </p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
