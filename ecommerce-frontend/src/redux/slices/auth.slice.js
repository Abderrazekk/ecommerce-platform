import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/auth.service";
import { toast } from "react-hot-toast";

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);

        // Check if user is banned (shouldn't happen but just in case)
        if (response.data.user.isBanned) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          throw new Error("Your account has been banned");
        }

        toast.success("Login successful!");
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      // Handle ban error specifically
      if (error.response?.status === 403 || error.message.includes("banned")) {
        toast.error("Your account has been banned. Please contact support.", {
          duration: 10000,
        });
        return rejectWithValue("Account banned");
      }

      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (googleData, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(googleData);
      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);

        if (response.data.user.isBanned) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          throw new Error("Your account has been banned");
        }

        toast.success("Google login successful!");
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      if (error.response?.status === 403 || error.message.includes("banned")) {
        toast.error("Your account has been banned. Please contact support.", {
          duration: 10000,
        });
        return rejectWithValue("Account banned");
      }

      if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.message ||
            "Email already registered with password",
        );
        return rejectWithValue("Email conflict");
      }

      toast.error(
        error.response?.data?.message || error.message || "Google login failed",
      );
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        toast.success("Registration successful!");
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (message = null) => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    if (message && message.includes("banned")) {
      toast.error(message);
    } else {
      toast.success("Logged out successfully!");
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (newPassword, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.changePassword(newPassword);
      if (response.data.success) {
        // If backend returns a new token, update it
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        toast.success(response.data.message);
        return response.data; // contains new token if any
      }
      throw new Error(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email",
      );
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
  isBanned: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    // Add reducer to handle ban detection from API interceptor
    setBanned: (state) => {
      state.isBanned = true;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isBanned = false;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload.user;

        state.user = {
          _id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          authMethod: userData.authMethod,
          avatar: userData.avatar,
          isBanned: userData.isBanned || false,
          phone: userData.phone,
          address: userData.address,
        };

        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isBanned = false;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload === "Account banned") {
          state.isBanned = true;
          state.isAuthenticated = false;
        }
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isBanned = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload.user;

        // Ensure user object has consistent _id field
        state.user = {
          _id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isBanned: userData.isBanned || false,
          phone: userData.phone,
          address: userData.address,
        };

        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isBanned = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Check if error is ban-related
        if (action.payload === "Account banned") {
          state.isBanned = true;
          state.isAuthenticated = false;
        }
      })

      // Register
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload.user;

        state.user = {
          _id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          address: userData.address,
        };

        state.token = action.payload.token;
        state.isAuthenticated = true;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.isBanned = false;
      })

      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.token) {
          state.token = action.payload.token;
          // The user object remains the same – no need to update
        }
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateProfile, setBanned } = authSlice.actions;
export default authSlice.reducer;
