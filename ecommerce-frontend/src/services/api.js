import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      // Unauthorized - invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      // Forbidden - banned user or insufficient permissions
      const errorMessage = error.response?.data?.error;
      const errorCode = error.response?.data?.code;

      // Check if it's a ban-related error
      if (
        errorMessage === "Your account has been banned" ||
        errorCode === "ACCOUNT_BANNED"
      ) {
        // Clear user data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Store ban message for display on login page
        sessionStorage.setItem("banMessage", "Your account has been banned");

        // Redirect to login page
        window.location.href = "/login";

        // Show toast notification if available
        if (typeof window !== "undefined" && window.toast) {
          window.toast.error(
            "Your account has been banned. Please contact support.",
          );
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
