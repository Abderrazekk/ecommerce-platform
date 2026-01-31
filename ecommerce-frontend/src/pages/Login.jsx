import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slices/auth.slice";
import {
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaGoogle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isBanned } = useSelector((state) => state.auth);

  const googleButtonContainerRef = useRef(null);
  const googleInitializedRef = useRef(false);

  // Check for ban messages
  useEffect(() => {
    const banMessage = sessionStorage.getItem("banMessage");
    if (banMessage) {
      toast.error(banMessage, {
        duration: 10000,
        icon: <FaExclamationTriangle className="text-red-500" />,
      });
      sessionStorage.removeItem("banMessage");
    }

    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");
    if (message === "Your account has been banned") {
      toast.error("Your account has been banned. Please contact support.", {
        duration: 10000,
        icon: <FaExclamationTriangle className="text-red-500" />,
      });
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Load Google Identity Services script
  useEffect(() => {
    if (window.google) {
      setGoogleScriptLoaded(true);
      return;
    }

    const scriptId = "google-identity-script";
    if (document.getElementById(scriptId)) {
      // Script already exists, wait for it to load
      const existingScript = document.getElementById(scriptId);
      existingScript.onload = () => setGoogleScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Google Identity Services script loaded");
      setGoogleScriptLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Google Identity Services");
      toast.error(
        "Failed to load Google Sign-In. Please check your connection.",
      );
    };

    document.head.appendChild(script);

    return () => {
      // Clean up on unmount
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Initialize Google button when script is loaded
  useEffect(() => {
    if (
      !googleScriptLoaded ||
      !googleButtonContainerRef.current ||
      googleInitializedRef.current
    ) {
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Google Client ID not configured");
      toast.error("Google Sign-In is not configured. Please contact support.");
      return;
    }

    try {
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      // Render the button
      window.google.accounts.id.renderButton(googleButtonContainerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: "300", // Fixed width in pixels
      });

      googleInitializedRef.current = true;
      console.log("Google button initialized and rendered");
    } catch (error) {
      console.error("Failed to initialize Google button:", error);
      toast.error("Failed to initialize Google Sign-In");
    }
  }, [googleScriptLoaded]);

  // Handle Google Sign-In response
  const handleGoogleResponse = async (response) => {
    try {
      setIsGoogleLoading(true);
      toast.loading("Signing in with Google...", { id: "google-login" });

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const result = await fetch(`${apiUrl}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: response.credential }),
      });

      if (!result.ok) {
        const errorData = await result.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${result.status}`,
        );
      }

      const data = await result.json();

      if (data.success) {
        // Store user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Dispatch to Redux store
        dispatch({
          type: "auth/googleLogin/fulfilled",
          payload: data,
        });

        toast.success("Signed in with Google!", { id: "google-login" });
        navigate("/");
      } else {
        throw new Error(data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);

      let errorMessage = "Google Sign-In failed. Please try again.";

      if (
        error.message.includes("already exists") ||
        error.message.includes("409")
      ) {
        errorMessage =
          "An account with this email already exists. Please use email/password login.";
      } else if (
        error.message.includes("banned") ||
        error.message.includes("403")
      ) {
        errorMessage = "Your account has been banned. Please contact support.";
      } else if (error.message.includes("Invalid Google token")) {
        errorMessage = "Invalid Google token. Please try again.";
      }

      toast.error(errorMessage, { id: "google-login" });

      // Reset Google button
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        try {
          window.google.accounts.id.cancel();
          if (googleButtonContainerRef.current) {
            googleButtonContainerRef.current.innerHTML = "";
          }
          googleInitializedRef.current = false;
        } catch (err) {
          console.warn("Error resetting Google button:", err);
        }
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle manual Google Sign-In button click (fallback)
  const handleManualGoogleSignIn = () => {
    if (!googleScriptLoaded) {
      toast.error("Google Sign-In is still loading. Please wait.");
      return;
    }

    // Try to trigger the Google button programmatically
    const googleButton =
      googleButtonContainerRef.current?.querySelector('div[role="button"]');
    if (googleButton) {
      googleButton.click();
    } else {
      toast.error("Google Sign-In button not ready. Please refresh the page.");
    }
  };

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleAdminLogin = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
    toast.success("Admin credentials loaded. Click Sign in.");
  };

  const handleForgotPassword = () => {
    toast("Forgot password feature coming soon!", { icon: "🔒" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or{" "}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Google Sign-In Section */}
        <div className="space-y-4">
          {/* Google button container */}
          <div
            ref={googleButtonContainerRef}
            className="min-h-[42px] flex items-center justify-center"
          >
            {!googleScriptLoaded && (
              <div className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                  <span className="text-sm">Loading Google Sign-In...</span>
                </div>
              </div>
            )}
          </div>

          {/* Fallback button (hidden when Google button is loaded) */}
          {googleScriptLoaded && (
            <button
              onClick={handleManualGoogleSignIn}
              disabled={isGoogleLoading || !googleInitializedRef.current}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Signing in...</span>
                </>
              ) : (
                <>
                  <FaGoogle className="h-5 w-5 text-red-600" />
                  <span className="text-gray-700 font-medium">
                    Sign in with Google
                  </span>
                </>
              )}
            </button>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        {/* Email/Password Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
                disabled={loading || isGoogleLoading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                  disabled={loading || isGoogleLoading}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  minLength="6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="••••••••"
                  disabled={loading || isGoogleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  disabled={loading || isGoogleLoading}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Admin Credentials Button */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleAdminLogin}
                className="text-sm text-primary-600 hover:text-primary-500 font-medium border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                disabled={loading || isGoogleLoading}
              >
                Load Admin Credentials
              </button>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || isGoogleLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing in...
                </>
              ) : (
                "Sign in with Email"
              )}
            </button>
          </div>
        </form>

        {/* Registration Prompt */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Development Info Banner */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-blue-800">
              <strong className="font-semibold">Development Mode:</strong>
              <br />
              • Default Admin: admin@example.com / admin123
              <br />
              • Google Sign-In: Use any Google account
              <br />• Test Email: test@example.com / test123
            </p>
          </div>
        )}

        {/* Ban Warning */}
        {isBanned && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-800 font-medium">
                Your account has been banned. Please contact support.
              </p>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="text-center text-xs text-gray-500 pt-4">
          <p>
            By signing in, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-gray-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-gray-700">
              Privacy Policy
            </Link>
          </p>
          <p className="mt-1">
            Google Sign-In is subject to Google's{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
