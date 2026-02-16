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
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation("auth");
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
      toast.error(t("bannedMessage"), {
        duration: 10000,
        icon: <FaExclamationTriangle className="text-red-500" />,
      });
      navigate("/login", { replace: true });
    }
  }, [navigate, t]);

  // Load Google Identity Services script
  useEffect(() => {
    if (window.google) {
      setGoogleScriptLoaded(true);
      return;
    }

    const scriptId = "google-identity-script";
    if (document.getElementById(scriptId)) {
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
      toast.error(t("googleLoadError"));
    };

    document.head.appendChild(script);

    return () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, [t]);

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
      toast.error(t("googleConfigError"));
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      window.google.accounts.id.renderButton(googleButtonContainerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: "300",
      });

      googleInitializedRef.current = true;
      console.log("Google button initialized and rendered");
    } catch (error) {
      console.error("Failed to initialize Google button:", error);
      toast.error(t("googleInitError"));
    }
  }, [googleScriptLoaded, t]);

  // Handle Google Sign-In response
  const handleGoogleResponse = async (response) => {
    try {
      setIsGoogleLoading(true);
      toast.loading(t("googleSigningIn"), { id: "google-login" });

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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        dispatch({
          type: "auth/googleLogin/fulfilled",
          payload: data,
        });

        toast.success(t("googleSuccess"), { id: "google-login" });
        navigate("/");
      } else {
        throw new Error(data.message || t("googleFailed"));
      }
    } catch (error) {
      console.error("Google login error:", error);

      let errorMessage = t("googleGenericError");

      if (
        error.message.includes("already exists") ||
        error.message.includes("409")
      ) {
        errorMessage = t("googleEmailExists");
      } else if (
        error.message.includes("banned") ||
        error.message.includes("403")
      ) {
        errorMessage = t("bannedMessage");
      } else if (error.message.includes("Invalid Google token")) {
        errorMessage = t("googleInvalidToken");
      }

      toast.error(errorMessage, { id: "google-login" });

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
      toast.error(t("googleNotLoaded"));
      return;
    }

    const googleButton =
      googleButtonContainerRef.current?.querySelector('div[role="button"]');
    if (googleButton) {
      googleButton.click();
    } else {
      toast.error(t("googleButtonNotReady"));
    }
  };

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error(t("enterCredentials"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("validEmail"));
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
    toast.success(t("adminCredentialsLoaded"));
  };

  const handleForgotPassword = () => {
    toast(t("forgotPasswordSoon"), { icon: "🔒" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="relative w-full max-w-5xl">
        <div className="absolute -top-10 -left-8 h-32 w-32 rounded-full bg-primary-100 blur-3xl opacity-70" />
        <div className="absolute -bottom-12 -right-6 h-40 w-40 rounded-full bg-indigo-100 blur-3xl opacity-70" />
        <div className="relative grid gap-8 overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur md:grid-cols-[1.05fr_1fr] md:p-10">
          <div className="hidden flex-col justify-between rounded-2xl bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-600 p-8 text-white shadow-lg md:flex">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
                {t("welcomeBack")}
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {t("signInSubtitle")}
              </h2>
              <p className="mt-4 text-sm text-white/80">{t("accessDeals")}</p>
            </div>
            <div className="space-y-3 text-sm text-white/90">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                {t("benefitSecureCheckout")}
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                {t("benefitPersonalized")}
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                {t("benefitTrackOrders")}
              </div>
            </div>
          </div>

          <div className="space-y-8 rounded-2xl bg-white/90 p-6 shadow-xl md:p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                {t("welcomeBackHeading")}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t("signInPrompt")}{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  {t("createNewAccount")}
                </Link>
              </p>
            </div>

            {/* Google Sign-In Section */}
            <div className="space-y-4">
              <div
                ref={googleButtonContainerRef}
                className="min-h-[42px] flex items-center justify-center"
              >
                {!googleScriptLoaded && (
                  <div className="flex items-center justify-center w-full py-3 px-4 border border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                      <span className="text-sm">{t("loadingGoogle")}</span>
                    </div>
                  </div>
                )}
              </div>

              {googleScriptLoaded && (
                <button
                  onClick={handleManualGoogleSignIn}
                  disabled={isGoogleLoading || !googleInitializedRef.current}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">
                        {t("signingIn")}
                      </span>
                    </>
                  ) : (
                    <>
                      <FaGoogle className="h-5 w-5 text-red-600" />
                      <span className="text-gray-700 font-medium">
                        {t("signInWithGoogle")}
                      </span>
                    </>
                  )}
                </button>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    {t("orContinueWithEmail")}
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
                    {t("email")}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder={t("emailPlaceholder")}
                    disabled={loading || isGoogleLoading}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("password")}
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                      disabled={loading || isGoogleLoading}
                    >
                      {t("forgotPassword")}
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
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500 pr-12"
                      placeholder={t("passwordPlaceholder")}
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
                    className="text-sm text-primary-600 hover:text-primary-500 font-medium border border-primary-200 px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors"
                    disabled={loading || isGoogleLoading}
                  >
                    {t("loadAdminCredentials")}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading || isGoogleLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      {t("signingInWithEmail")}
                    </>
                  ) : (
                    t("signInWithEmail")
                  )}
                </button>
              </div>
            </form>

            {/* Registration Prompt */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {t("noAccount")}{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  {t("signUpHere")}
                </Link>
              </p>
            </div>

            {/* Development Info Banner */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <p className="text-sm text-blue-800">
                  <strong className="font-semibold">{t("devMode")}</strong>
                  <br />
                  {t("devAdmin")}
                  <br />
                  {t("devGoogle")}
                  <br />
                  {t("devTest")}
                </p>
              </div>
            )}

            {/* Ban Warning */}
            {isBanned && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-800 font-medium">
                    {t("bannedMessage")}
                  </p>
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="text-center text-xs text-gray-500 pt-4">
              <p>
                {t("agreeTerms")}{" "}
                <Link to="/terms" className="underline hover:text-gray-700">
                  {t("termsOfService")}
                </Link>{" "}
                {t("and")}{" "}
                <Link to="/privacy" className="underline hover:text-gray-700">
                  {t("privacyPolicy")}
                </Link>
                .
              </p>
              <p className="mt-1">
                {t("googlePrivacy")}{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-700"
                >
                  {t("privacyPolicy")}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
