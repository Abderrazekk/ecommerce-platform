import api from "./api";

const commentService = {
  // Get comments for a product
  getProductComments: (productId, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);

    return api.get(`/products/${productId}/comments?${params.toString()}`);
  },

  // Create a comment - CHANGED TO JSON NOT FORMDATA
  createComment: (productId, text) => {
    return api.post(`/products/${productId}/comments`, { 
      text 
    }, {
      headers: {
        "Content-Type": "application/json", // Changed from multipart/form-data
      },
    });
  },

  // Update a comment
  updateComment: (commentId, text) => {
    return api.put(`/comments/${commentId}`, { 
      text 
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // Delete a comment (admin only)
  deleteComment: (commentId) => {
    return api.delete(`/comments/${commentId}`);
  },
};

export default commentService;