// ecommerce-frontend/src/services/comment.service.js
import api from "./api";

const commentService = {
  // Get reviews for a product
  getProductComments: (productId, page = 1, limit = 10, sortBy = "newest") => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    params.append("sortBy", sortBy);

    return api.get(`/products/${productId}/comments?${params.toString()}`);
  },

  // Get product rating summary
  getProductRatingSummary: (productId) => {
    return api.get(`/products/${productId}/rating-summary`);
  },

  // Create a review with rating
  createComment: (productId, text, rating) => {
    return api.post(
      `/products/${productId}/comments`,
      {
        text,
        rating,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  },

  // Update a review with rating
  updateComment: (commentId, text, rating) => {
    return api.put(
      `/comments/${commentId}`,
      {
        text,
        rating,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  },

  // Delete a review (admin only)
  deleteComment: (commentId) => {
    return api.delete(`/comments/${commentId}`);
  },
};

export default commentService;
