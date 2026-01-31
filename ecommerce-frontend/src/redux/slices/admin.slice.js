import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/admin.service';

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (period = 'month', { rejectWithValue }) => {
    try {
      return await adminService.getAnalytics(period);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const exportAnalytics = createAsyncThunk(
  'admin/exportAnalytics',
  async ({ format, type, startDate, endDate }, { rejectWithValue }) => {
    try {
      const data = await adminService.exportData(format, type, startDate, endDate);
      return { data, format, type };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRevenueReport = createAsyncThunk(
  'admin/fetchRevenueReport',
  async ({ startDate, endDate, groupBy }, { rejectWithValue }) => {
    try {
      return await adminService.getRevenueReport(startDate, endDate, groupBy);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserMetrics = createAsyncThunk(
  'admin/fetchUserMetrics',
  async (period = 'month', { rejectWithValue }) => {
    try {
      return await adminService.getUserMetrics(period);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchInventoryAnalytics = createAsyncThunk(
  'admin/fetchInventoryAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getInventoryAnalytics();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    analytics: null,
    revenueReport: null,
    userMetrics: null,
    inventoryAnalytics: null,
    loading: false,
    exportLoading: false,
    error: null,
    lastUpdated: null,
    period: 'month'
  },
  reducers: {
    clearAnalytics: (state) => {
      state.analytics = null;
      state.error = null;
    },
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.period = action.meta.arg || 'month';
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Export Analytics
      .addCase(exportAnalytics.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportAnalytics.fulfilled, (state, action) => {
        state.exportLoading = false;
        // Trigger download
        const { data, format, type } = action.payload;
        const blob = new Blob([data], { 
          type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report-${Date.now()}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .addCase(exportAnalytics.rejected, (state) => {
        state.exportLoading = false;
      })
      // Fetch Revenue Report
      .addCase(fetchRevenueReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueReport = action.payload;
      })
      .addCase(fetchRevenueReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Metrics
      .addCase(fetchUserMetrics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.userMetrics = action.payload;
      })
      .addCase(fetchUserMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Inventory Analytics
      .addCase(fetchInventoryAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryAnalytics = action.payload;
      })
      .addCase(fetchInventoryAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAnalytics, setPeriod, clearError } = adminSlice.actions;
export default adminSlice.reducer;