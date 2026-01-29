import api from "./api";

const wishlistService = {
  // Get user's wishlist
  getWishlist: () => {
    return api.get("/users/wishlist");
  },

  // Add product to wishlist
  addToWishlist: (productId) => {
    return api.post(`/users/wishlist/${productId}`);
  },

  // Remove product from wishlist
  removeFromWishlist: (productId) => {
    return api.delete(`/users/wishlist/${productId}`);
  },

  // Check if product is in wishlist
  checkWishlist: (productId) => {
    return api.get(`/users/wishlist/check/${productId}`);
  },

  // Get wishlist count
  getWishlistCount: () => {
    return api.get("/users/wishlist/count");
  },
};

export default wishlistService;