import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import promoService from "../../services/promo.service";

// Async thunks
export const fetchActivePromo = createAsyncThunk(
  "promo/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await promoService.getActivePromo();
      return response.promo; // backend returns { success, promo }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch promo");
    }
  }
);

export const createPromo = createAsyncThunk(
  "promo/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await promoService.createPromo(formData);
      return response.promo;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create promo");
    }
  }
);

export const updatePromo = createAsyncThunk(
  "promo/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await promoService.updatePromo(id, formData);
      return response.promo;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update promo");
    }
  }
);

export const deletePromo = createAsyncThunk(
  "promo/delete",
  async (id, { rejectWithValue }) => {
    try {
      await promoService.deletePromo(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete promo");
    }
  }
);

const initialState = {
  activePromo: null,
  loading: false,
  error: null,
};

const promoSlice = createSlice({
  name: "promo",
  initialState,
  reducers: {
    clearPromoError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active
      .addCase(fetchActivePromo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivePromo.fulfilled, (state, action) => {
        state.loading = false;
        state.activePromo = action.payload;
      })
      .addCase(fetchActivePromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createPromo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPromo.fulfilled, (state, action) => {
        state.loading = false;
        // After create, we might want to refetch active, but for simplicity we set active if visible
        if (action.payload.isVisible) {
          state.activePromo = action.payload;
        }
      })
      .addCase(createPromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updatePromo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromo.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isVisible) {
          state.activePromo = action.payload;
        } else if (state.activePromo?._id === action.payload._id) {
          state.activePromo = null;
        }
      })
      .addCase(updatePromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deletePromo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromo.fulfilled, (state, action) => {
        state.loading = false;
        if (state.activePromo?._id === action.payload) {
          state.activePromo = null;
        }
      })
      .addCase(deletePromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPromoError } = promoSlice.actions;
export default promoSlice.reducer;