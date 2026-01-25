import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/auth.slice";
import { clearCart } from "../../redux/slices/cart.slice";
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
  FaShoppingBag,
} from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    { name: "Shop", path: "/shop", icon: <FaStore className="h-4 w-4" /> },
    { name: "About", path: "/about", icon: <FaInfoCircle className="h-4 w-4" /> },
    { name: "Contact", path: "/contact", icon: <FaEnvelope className="h-4 w-4" /> },
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
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                E-Shop
              </span>
            </Link>
          </div>

          {/* Desktop Menu - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile & Desktop */}
            <button
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              aria-label="Search"
            >
              <FaSearch className="h-5 w-5" />
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <FaShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
                      className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
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
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
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
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
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
                        to="/my-orders"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                        onClick={() => setUserDropdown(false)}
                      >
                        <FaBox className="h-4 w-4" />
                        <span>My Orders</span>
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
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
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
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="text-blue-600">{item.icon}</div>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Cart Item Count Display */}
            <Link
              to="/cart"
              className="flex items-center justify-between px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border-b border-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <FaShoppingCart className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Shopping Cart</span>
              </div>
              {cartItemCount > 0 && (
                <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {cartItemCount} items
                </span>
              )}
            </Link>

            {/* User Section */}
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-50 bg-blue-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                      <FaUser className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-blue-600">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* My Orders */}
                <Link
                  to="/my-orders"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaBox className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">My Orders</span>
                </Link>

                {/* My Profile */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="h-5 w-5 text-blue-600" />
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
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border-b border-gray-50 pl-8"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaChevronDown className="h-3 w-3 text-gray-400" />
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
                <div className="px-4 py-3 border-b border-gray-50 bg-blue-50">
                  <p className="font-semibold text-gray-900">Welcome to E-Shop</p>
                  <p className="text-sm text-gray-600">Please login to continue</p>
                </div>

                <Link
                  to="/login"
                  className="flex items-center justify-center space-x-2 px-4 py-3 text-blue-600 hover:bg-blue-50 transition-all duration-200 border-b border-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="h-5 w-5" />
                  <span className="font-semibold">Login to Account</span>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-semibold">Create New Account</span>
                </Link>
              </>
            )}

            {/* Footer Info */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                © 2023 E-Shop. All rights reserved.
              </p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;