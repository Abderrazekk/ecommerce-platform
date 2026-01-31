import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/auth.service";
import wishlistService from "../../services/wishlist.service";
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

export const fetchWishlist = createAsyncThunk(
  "auth/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist();
      return response.data.wishlist;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// New: Add to wishlist
export const addToWishlist = createAsyncThunk(
  "auth/addToWishlist",
  async (productId, { rejectWithValue, getState }) => {
    try {
      const response = await wishlistService.addToWishlist(productId);
      const state = getState();

      // Add product ID to local wishlist
      const product =
        state.products.products.find((p) => p._id === productId) ||
        state.products.product ||
        state.products.featuredProducts.find((p) => p._id === productId);

      toast.success("Added to wishlist!");
      return {
        productId,
        product,
        count: response.data.count,
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// New: Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  "auth/removeFromWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.removeFromWishlist(productId);
      toast.success("Removed from wishlist!");
      return {
        productId,
        count: response.data.count,
      };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove from wishlist",
      );
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// New: Check wishlist status
export const checkWishlistStatus = createAsyncThunk(
  "auth/checkWishlistStatus",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.checkWishlist(productId);
      return {
        productId,
        isInWishlist: response.data.isInWishlist,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// New: Get wishlist count
export const fetchWishlistCount = createAsyncThunk(
  "auth/fetchWishlistCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlistCount();
      return response.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
  isBanned: false, // Add ban status flag
  wishlist: [],
  wishlistIds: new Set(),
  wishlistCount: 0,
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
    clearWishlist: (state) => {
      state.wishlist = [];
      state.wishlistIds = new Set();
      state.wishlistCount = 0;
    },
    // Add reducer to handle ban detection from API interceptor
    setBanned: (state) => {
      state.isBanned = true;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.wishlist = [];
      state.wishlistIds = new Set();
      state.wishlistCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
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

        // Clear previous wishlist data
        state.wishlist = [];
        state.wishlistIds = new Set();
        state.wishlistCount = 0;
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

        // Clear previous wishlist data
        state.wishlist = [];
        state.wishlistIds = new Set();
        state.wishlistCount = 0;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.isBanned = false;
        state.wishlist = [];
        state.wishlistIds = new Set();
        state.wishlistCount = 0;
      })

      // Fetch wishlist
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
        state.wishlistIds = new Set(action.payload.map((p) => p._id));
        state.wishlistCount = action.payload.length;
      })

      // Add to wishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const { productId, product, count } = action.payload;

        if (product && !state.wishlistIds.has(productId)) {
          state.wishlist.push(product);
          state.wishlistIds.add(productId);
        }
        state.wishlistCount = count;
      })

      // Remove from wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        const { productId, count } = action.payload;

        state.wishlist = state.wishlist.filter((p) => p._id !== productId);
        state.wishlistIds.delete(productId);
        state.wishlistCount = count;
      })

      // Check wishlist status
      .addCase(checkWishlistStatus.fulfilled, (state, action) => {
        const { productId, isInWishlist } = action.payload;

        if (isInWishlist && !state.wishlistIds.has(productId)) {
          // Note: We don't have the full product object here
          // We'll need to fetch it separately or handle differently
          state.wishlistIds.add(productId);
        } else if (!isInWishlist) {
          state.wishlistIds.delete(productId);
        }
      })

      // Fetch wishlist count
      .addCase(fetchWishlistCount.fulfilled, (state, action) => {
        state.wishlistCount = action.payload;
      });
  },
});

export const { clearError, updateProfile, clearWishlist, setBanned } =
  authSlice.actions;
export default authSlice.reducer;
