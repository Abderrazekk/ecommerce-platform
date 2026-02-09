import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

// Public Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";

// Protected Pages (User)
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";

// Support Pages
import HelpFAQ from "./pages/footer/HelpFAQ";
import CustomerService from "./pages/footer/CustomerService";
import DeliveryPayment from "./pages/footer/DeliveryPayment";
import ReturnPolicy from "./pages/footer/ReturnPolicy";

// Legal Pages
import TermsConditions from "./pages/footer/TermsConditions";
import PrivacyPolicy from "./pages/footer/PrivacyPolicy";
import LegalNotice from "./pages/footer/LegalNotice";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import Hero from "./pages/admin/Hero";
import AdminSponsors from "./pages/admin/Sponsors";

// Optional: Not Found page
import NotFound from "./pages/NotFound";

// Import auth actions
import { logout } from "./redux/slices/auth.slice";

function App() {
  const dispatch = useDispatch();
  const { isBanned } = useSelector((state) => state.auth);

  // Global ban check - if user becomes banned while using the app
  useEffect(() => {
    if (isBanned) {
      dispatch(logout("Your account has been banned"));
      window.location.href = "/login?message=Your account has been banned";
    }
  }, [isBanned, dispatch]);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Support Routes */}
            <Route path="/help-faq" element={<HelpFAQ />} />
            <Route path="/customer-service" element={<CustomerService />} />
            <Route path="/delivery-payment" element={<DeliveryPayment />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />

            {/* Legal Routes */}
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/legal-notice" element={<LegalNotice />} />

            {/* User Protected Routes */}
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <PrivateRoute>
                  <MyOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <PrivateRoute>
                  <Wishlist />
                </PrivateRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute adminOnly>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/hero"
              element={
                <PrivateRoute adminOnly>
                  <Hero />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <PrivateRoute adminOnly>
                  <Products />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <PrivateRoute adminOnly>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute adminOnly>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/sponsors"
              element={
                <AdminRoute>
                  <AdminSponsors />
                </AdminRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
