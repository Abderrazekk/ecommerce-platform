import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wishlistService from "../../services/wishlist.service";
import toast from "react-hot-toast";

// Async thunks
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, thunkAPI) => {
    try {
      const response = await wishlistService.getWishlist();
      return response.data;
    } catch (error) {
      const message =
        "Failed to fetch wishlist";
      toast(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId, thunkAPI) => {
    try {
      const response = await wishlistService.addToWishlist(productId);
      toast("Added to wishlist");
      return response.data;
    } catch (error) {
      const message =
        "Failed to add to wishlist";
      toast(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, thunkAPI) => {
    try {
      const response = await wishlistService.removeFromWishlist(productId);
      toast("Removed from wishlist");
      return response.data;
    } catch (error) {
      const message =
        "Failed to remove from wishlist";
      toast(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const checkInWishlist = createAsyncThunk(
  "wishlist/checkInWishlist",
  async (productId, thunkAPI) => {
    try {
      const response = await wishlistService.checkInWishlist(productId);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to check wishlist status";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, thunkAPI) => {
    try {
      const response = await wishlistService.clearWishlist();
      toast("Wishlist cleared");
      return response.data;
    } catch (error) {
      const message =
        "Failed to clear wishlist";
      toast(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState = {
  wishlist: null,
  wishlistItems: [],
  itemCount: 0,
  loading: false,
  error: null,
  success: false,
  wishlistChecked: {}, // Cache for product wishlist status
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlist: (state) => {
      state.wishlist = null;
      state.wishlistItems = [];
      state.itemCount = 0;
      state.error = null;
      state.success = false;
      state.wishlistChecked = {};
    },
    clearWishlistError: (state) => {
      state.error = null;
    },
    // Optimistic update for immediate UI feedback
    toggleWishlistOptimistic: (state, action) => {
      const { productId, add } = action.payload;
      state.wishlistChecked[productId] = add;

      if (add) {
        state.itemCount += 1;
      } else {
        state.itemCount = Math.max(0, state.itemCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.wishlist = action.payload.wishlist;
        state.wishlistItems = action.payload.wishlist?.items || [];
        state.itemCount = action.payload.wishlist?.itemCount || 0;

        // Update wishlist status cache
        state.wishlistChecked = {};
        if (action.payload.wishlist?.items) {
          action.payload.wishlist.items.forEach((item) => {
            if (item.product) {
              state.wishlistChecked[item.product._id] = true;
            }
          });
        }
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.wishlist = action.payload.wishlist;
        state.wishlistItems = action.payload.wishlist?.items || [];
        state.itemCount = action.payload.wishlist?.itemCount || 0;
        state.wishlistChecked[action.payload.addedProductId] = true;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        // Revert optimistic update if failed
        if (action.meta.arg) {
          state.wishlistChecked[action.meta.arg] = false;
          state.itemCount = Math.max(0, state.itemCount - 1);
        }
      })

      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // Remove from items list
        state.wishlistItems = state.wishlistItems.filter(
          (item) => item.product?._id !== action.payload.removedProductId,
        );

        // Update counts
        state.itemCount =
          action.payload.itemCount || state.wishlistItems.length;

        // Update cache
        state.wishlistChecked[action.payload.removedProductId] = false;

        // Update wishlist object if exists
        if (state.wishlist) {
          state.wishlist.items = state.wishlistItems;
          state.wishlist.itemCount = state.itemCount;
        }
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        // Revert optimistic update if failed
        if (action.meta.arg) {
          state.wishlistChecked[action.meta.arg] = true;
          state.itemCount += 1;
        }
      })

      // Check in Wishlist
      .addCase(checkInWishlist.fulfilled, (state, action) => {
        state.wishlistChecked[action.payload.productId] =
          action.payload.inWishlist;
      })

      // Clear Wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.wishlistItems = [];
        state.itemCount = 0;
        state.wishlistChecked = {};
        if (state.wishlist) {
          state.wishlist.items = [];
          state.wishlist.itemCount = 0;
        }
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetWishlist, clearWishlistError, toggleWishlistOptimistic } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
