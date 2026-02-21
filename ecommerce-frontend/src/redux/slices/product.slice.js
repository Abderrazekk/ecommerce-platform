import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../../services/product.service";
import { toast } from "react-hot-toast";

// Async thunks
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (
    {
      page = 1,
      limit = 12,
      category = "",
      search = "",
      brand = "",
      isAliExpress = "",
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await productService.getProducts(
        page,
        limit,
        category,
        search,
        brand,
        isAliExpress,
      );
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// New: Fetch admin products (includes hidden)
export const fetchAdminProducts = createAsyncThunk(
  "products/fetchAdminAll",
  async (
    {
      page = 1,
      limit = 50,
      category = "",
      search = "",
      brand = "",
      isAliExpress = "", // NEW
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await productService.getAdminProducts(
        page,
        limit,
        category,
        search,
        brand,
        isAliExpress, // NEW
      );
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// New: Fetch featured products
export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeatured",
  async ({ limit = 8 }, { rejectWithValue }) => {
    try {
      const response = await productService.getFeaturedProducts(limit);
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch featured products",
      );
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// New: Fetch brands
export const fetchBrands = createAsyncThunk(
  "products/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getBrands();
      return response.data.brands;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch brands");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getProduct(id);
      return response.data.product;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch product");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(productData);
      toast.success("Product created successfully!");
      return response.data.product;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(id, productData);
      toast.success("Product updated successfully!");
      return response.data.product;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      toast.success("Product deleted successfully!");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchSimilarProducts = createAsyncThunk(
  "products/fetchSimilar",
  async (productId, { rejectWithValue }) => {
    if (!productId) return rejectWithValue("No product ID");
    try {
      const response = await productService.getSimilarProducts(productId);
      return response.products; // ✅ array
    } catch (error) {
      // ❌ NO TOAST – silent failure
      return rejectWithValue(
        error.response?.data?.message || "Failed to load similar products",
      );
    }
  },
);

const initialState = {
  products: [], // All products (for admin)
  featuredProducts: [], // Featured products for homepage
  brands: [], // All brands
  product: null,
  categories: [],
  loading: false,
  error: null,
  similarProducts: [],
  similarProductsLoading: false,
  similarProductsError: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  },
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProduct: (state) => {
      state.product = null;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products (visible only)
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch admin products (all products)
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload.products;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch brands
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single product
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        // If product is visible and featured, add to featuredProducts
        if (action.payload.isVisible && action.payload.isFeatured) {
          state.featuredProducts = [
            action.payload,
            ...state.featuredProducts,
          ].slice(0, 8);
        }
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }

        // Update featured products
        if (action.payload.isVisible && action.payload.isFeatured) {
          const featuredIndex = state.featuredProducts.findIndex(
            (p) => p._id === action.payload._id,
          );
          if (featuredIndex !== -1) {
            state.featuredProducts[featuredIndex] = action.payload;
          } else {
            // Add to featured if it meets criteria
            state.featuredProducts = [
              action.payload,
              ...state.featuredProducts,
            ].slice(0, 8);
          }
        } else {
          // Remove from featured if no longer featured or visible
          state.featuredProducts = state.featuredProducts.filter(
            (p) => p._id !== action.payload._id,
          );
        }

        if (state.product?._id === action.payload._id) {
          state.product = action.payload;
        }
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.featuredProducts = state.featuredProducts.filter(
          (p) => p._id !== action.payload,
        );
      })
      // Similar products
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.similarProductsLoading = true;
        state.similarProductsError = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.similarProductsLoading = false;
        state.similarProducts = action.payload;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.similarProductsLoading = false;
        state.similarProductsError = action.payload;
      });
  },
});

export const { clearProduct, setCategories } = productSlice.actions;
export default productSlice.reducer;
