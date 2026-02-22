import api from "./api";

const productService = {
  getProducts: (
    page = 1,
    limit = 12,
    category = "",
    search = "",
    brand = "",
    isAliExpress = "", // NEW
  ) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (category) params.append("category", category);
    if (search) params.append("search", search);
    if (brand) params.append("brand", brand);
    if (isAliExpress) params.append("isAliExpress", isAliExpress); // NEW

    return api.get(`/products?${params.toString()}`);
  },

  // New: Get all products for admin (includes hidden)
  getAdminProducts: (
    page = 1,
    limit = 50,
    category = "",
    search = "",
    brand = "",
    isAliExpress = "", // NEW
  ) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (category) params.append("category", category);
    if (search) params.append("search", search);
    if (brand) params.append("brand", brand);
    if (isAliExpress) params.append("isAliExpress", isAliExpress); // NEW

    return api.get(`/products/admin/products?${params.toString()}`);
  },

  // New: Get featured products
  getFeaturedProducts: (limit = 8) => {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit);

    return api.get(`/products/featured?${params.toString()}`);
  },

  // New: Get brands
  getBrands: () => {
    return api.get("/products/brands");
  },

  getProduct: (id) => {
    return api.get(`/products/${id}`);
  },

  getCategories: () => {
    return api.get("/products/categories");
  },

  createProduct: (productData) => {

    // Log form data entries for debugging
    for (let [key, value] of productData.entries()) {
      if (key === "images" || key === "video") {
      } else {
      }
    }

    return api.post("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateProduct: (id, productData) => {

    // Log form data entries for debugging
    for (let [key, value] of productData.entries()) {
      if (key === "images" || key === "video") {
      } else {
      }
    }

    return api.put(`/products/${id}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteProduct: (id) => {
    return api.delete(`/products/${id}`);
  },

  getSimilarProducts: async (productId) => {
    const response = await api.get(`/products/${productId}/similar`);
    return response.data; // ✅ returns { success, products }
  },

  getOnSaleProducts: (limit = 8) => {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit);
    return api.get(`/products/onsale?${params.toString()}`);
  },
};

export default productService;

// Note: The above code includes new methods for fetching admin products, featured products, and brands.
