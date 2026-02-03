import api from "./api";

const wishlistService = {
  // Get user's wishlist
  getWishlist: () => {
    return api.get("/wishlist");
  },

  // Add product to wishlist
  addToWishlist: (productId) => {
    return api.post("/wishlist", { productId });
  },

  // Remove product from wishlist
  removeFromWishlist: (productId) => {
    return api.delete(`/wishlist/${productId}`);
  },

  // Check if product is in wishlist
  checkInWishlist: (productId) => {
    return api.get(`/wishlist/check/${productId}`);
  },

  // Clear entire wishlist
  clearWishlist: () => {
    return api.delete("/wishlist");
  },
};

export default wishlistService;
