import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import heroService from '../../services/hero.service';

// Async Thunks
export const fetchActiveHero = createAsyncThunk(
  'hero/fetchActiveHero',
  async (_, { rejectWithValue }) => {
    try {
      const response = await heroService.getActiveHero();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch hero'
      );
    }
  }
);

export const getAllHeroes = createAsyncThunk(
  'hero/getAllHeroes',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await heroService.getAllHeroes(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch heroes'
      );
    }
  }
);

export const getHeroById = createAsyncThunk(
  'hero/getHeroById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await heroService.getHeroById(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch hero'
      );
    }
  }
);

export const createHero = createAsyncThunk(
  'hero/createHero',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await heroService.createHero(formData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create hero'
      );
    }
  }
);

export const updateHero = createAsyncThunk(
  'hero/updateHero',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await heroService.updateHero(id, formData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update hero'
      );
    }
  }
);

export const deleteHero = createAsyncThunk(
  'hero/deleteHero',
  async (id, { rejectWithValue }) => {
    try {
      await heroService.deleteHero(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete hero'
      );
    }
  }
);

export const setActiveHero = createAsyncThunk(
  'hero/setActiveHero',
  async (id, { rejectWithValue }) => {
    try {
      const response = await heroService.setActiveHero(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to set active hero'
      );
    }
  }
);

const heroSlice = createSlice({
  name: 'hero',
  initialState: {
    hero: null, // Active hero for homepage
    heroes: [], // All heroes for admin
    heroDetail: null, // Current hero being edited
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  reducers: {
    clearHeroError: (state) => {
      state.error = null;
    },
    clearHeroDetail: (state) => {
      state.heroDetail = null;
    },
    resetHeroForm: (state) => {
      state.heroDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Active Hero
      .addCase(fetchActiveHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveHero.fulfilled, (state, action) => {
        state.loading = false;
        state.hero = action.payload;
      })
      .addCase(fetchActiveHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hero = null;
      })
      // Get All Heroes
      .addCase(getAllHeroes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllHeroes.fulfilled, (state, action) => {
        state.loading = false;
        state.heroes = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllHeroes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.heroes = [];
      })
      // Get Hero By ID
      .addCase(getHeroById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHeroById.fulfilled, (state, action) => {
        state.loading = false;
        state.heroDetail = action.payload.data;
      })
      .addCase(getHeroById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.heroDetail = null;
      })
      // Create Hero
      .addCase(createHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHero.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new hero to the beginning of the list
        state.heroes = [action.payload.data, ...state.heroes];
        // If this hero is set as active, update the active hero
        if (action.payload.data.isActive) {
          state.hero = action.payload.data;
        }
        // Update pagination total
        state.pagination.total += 1;
      })
      .addCase(createHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Hero
      .addCase(updateHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHero.fulfilled, (state, action) => {
        state.loading = false;
        // Update in heroes list
        const index = state.heroes.findIndex(h => h._id === action.payload.data._id);
        if (index !== -1) {
          state.heroes[index] = action.payload.data;
        }
        // Update hero detail
        state.heroDetail = action.payload.data;
        // If this hero is active, update the active hero
        if (action.payload.data.isActive) {
          state.hero = action.payload.data;
          // Set all other heroes as inactive in the local state
          state.heroes = state.heroes.map(h => ({
            ...h,
            isActive: h._id === action.payload.data._id ? true : false
          }));
        }
      })
      .addCase(updateHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Hero
      .addCase(deleteHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHero.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from heroes list
        state.heroes = state.heroes.filter(h => h._id !== action.payload);
        // Clear hero detail if it was deleted
        if (state.heroDetail && state.heroDetail._id === action.payload) {
          state.heroDetail = null;
        }
        // Clear active hero if it was deleted
        if (state.hero && state.hero._id === action.payload) {
          state.hero = null;
        }
        // Update pagination total
        state.pagination.total -= 1;
      })
      .addCase(deleteHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Set Active Hero
      .addCase(setActiveHero.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setActiveHero.fulfilled, (state, action) => {
        state.loading = false;
        // Update the active hero
        state.hero = action.payload;
        // Update all heroes in the list to reflect the active status
        state.heroes = state.heroes.map(h => ({
          ...h,
          isActive: h._id === action.payload._id
        }));
      })
      .addCase(setActiveHero.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHeroError, clearHeroDetail, resetHeroForm } = heroSlice.actions;
export default heroSlice.reducer;