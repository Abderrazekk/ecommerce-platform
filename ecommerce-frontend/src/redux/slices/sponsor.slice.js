// File: ecommerce-frontend/src/redux/slices/sponsor.slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import sponsorService from "../../services/sponsor.service";

// Async thunks
export const fetchVisibleSponsors = createAsyncThunk(
  "sponsors/fetchVisible",
  async (_, { rejectWithValue }) => {
    try {
      const response = await sponsorService.getVisibleSponsors();
      return response.sponsors;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sponsors"
      );
    }
  }
);

export const fetchAllSponsors = createAsyncThunk(
  "sponsors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await sponsorService.getAllSponsors();
      return response.sponsors;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sponsors"
      );
    }
  }
);

export const createSponsor = createAsyncThunk(
  "sponsors/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await sponsorService.createSponsor(formData);
      return response.sponsor;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create sponsor"
      );
    }
  }
);

export const updateSponsor = createAsyncThunk(
  "sponsors/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await sponsorService.updateSponsor(id, formData);
      return response.sponsor;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update sponsor"
      );
    }
  }
);

export const deleteSponsor = createAsyncThunk(
  "sponsors/delete",
  async (id, { rejectWithValue }) => {
    try {
      await sponsorService.deleteSponsor(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete sponsor"
      );
    }
  }
);

export const toggleSponsorVisibility = createAsyncThunk(
  "sponsors/toggleVisibility",
  async (id, { rejectWithValue }) => {
    try {
      const response = await sponsorService.toggleSponsorVisibility(id);
      return response.sponsor;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle visibility"
      );
    }
  }
);

// Slice
const sponsorSlice = createSlice({
  name: "sponsors",
  initialState: {
    visibleSponsors: [],
    adminSponsors: [],
    loading: false,
    error: null,
    success: false,
    message: "",
  },
  reducers: {
    clearSponsorState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = "";
    },
    resetSuccess: (state) => {
      state.success = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch visible sponsors
      .addCase(fetchVisibleSponsors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVisibleSponsors.fulfilled, (state, action) => {
        state.loading = false;
        state.visibleSponsors = action.payload;
      })
      .addCase(fetchVisibleSponsors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all sponsors (admin)
      .addCase(fetchAllSponsors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSponsors.fulfilled, (state, action) => {
        state.loading = false;
        state.adminSponsors = action.payload;
      })
      .addCase(fetchAllSponsors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create sponsor
      .addCase(createSponsor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSponsor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Sponsor created successfully";
        state.adminSponsors.unshift(action.payload);
      })
      .addCase(createSponsor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update sponsor
      .addCase(updateSponsor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSponsor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Sponsor updated successfully";
        const index = state.adminSponsors.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.adminSponsors[index] = action.payload;
        }
      })
      .addCase(updateSponsor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete sponsor
      .addCase(deleteSponsor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteSponsor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Sponsor deleted successfully";
        state.adminSponsors = state.adminSponsors.filter(
          (s) => s._id !== action.payload
        );
      })
      .addCase(deleteSponsor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Toggle visibility
      .addCase(toggleSponsorVisibility.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(toggleSponsorVisibility.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Sponsor visibility toggled successfully";
        const index = state.adminSponsors.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.adminSponsors[index] = action.payload;
        }
      })
      .addCase(toggleSponsorVisibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearSponsorState, resetSuccess } = sponsorSlice.actions;
export default sponsorSlice.reducer;