import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import commentService from "../../services/comment.service";
import { toast } from "react-hot-toast";

// Async thunks (unchanged)
export const fetchProductComments = createAsyncThunk(
  "comments/fetchByProduct",
  async (
    { productId, page = 1, limit = 10, sortBy = "newest" },
    { rejectWithValue },
  ) => {
    try {
      const response = await commentService.getProductComments(
        productId,
        page,
        limit,
        sortBy,
      );
      return { productId, data: response.data };
    } catch (error) {
      toast(error.response?.data?.message || "Failed to fetch comments");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchProductRatingSummary = createAsyncThunk(
  "comments/fetchRatingSummary",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await commentService.getProductRatingSummary(productId);
      return { productId, summary: response.data.summary };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const addComment = createAsyncThunk(
  "comments/add",
  async ({ productId, text, rating }, { rejectWithValue }) => {
    try {
      const response = await commentService.createComment(
        productId,
        text,
        rating,
      );
      toast("Review added successfully!");
      return response.data;
    } catch (error) {
      toast(error.response?.data?.message || "Failed to add comment");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const editComment = createAsyncThunk(
  "comments/edit",
  async ({ commentId, text, rating }, { rejectWithValue }) => {
    try {
      const response = await commentService.updateComment(
        commentId,
        text,
        rating,
      );
      toast("Review updated successfully!");
      return response.data;
    } catch (error) {
      toast(error.response?.data?.message || "Failed to update comment");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const removeComment = createAsyncThunk(
  "comments/delete",
  async (commentId, { rejectWithValue }) => {
    try {
      await commentService.deleteComment(commentId);
      toast("Review deleted successfully!");
      return commentId;
    } catch (error) {
      toast(error.response?.data?.message || "Failed to delete comment");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const initialState = {
  commentsByProduct: {}, // { productId: { comments: [], pagination: {}, ratingSummary: {} } }
  loading: false,
  error: null,
  submitting: false,
};

// Helper function to get default rating summary
const getDefaultRatingSummary = () => ({
  average: 0,
  count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
});

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearComments: (state, action) => {
      const { productId } = action.payload;
      delete state.commentsByProduct[productId];
    },
    clearAllComments: (state) => {
      state.commentsByProduct = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchProductComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductComments.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, data } = action.payload;
        state.commentsByProduct[productId] = {
          comments: data.comments || [],
          pagination: data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
          ratingSummary: data.ratingSummary || getDefaultRatingSummary(),
        };
      })
      .addCase(fetchProductComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch rating summary
      .addCase(fetchProductRatingSummary.fulfilled, (state, action) => {
        const { productId, summary } = action.payload;
        if (state.commentsByProduct[productId]) {
          state.commentsByProduct[productId].ratingSummary = summary;
        } else {
          state.commentsByProduct[productId] = {
            comments: [],
            pagination: {},
            ratingSummary: summary,
          };
        }
      })
      // Add comment
      .addCase(addComment.pending, (state) => {
        state.submitting = true;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.submitting = false;
        const { comment } = action.payload;
        const { product } = comment;

        if (!state.commentsByProduct[product]) {
          state.commentsByProduct[product] = {
            comments: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
            },
            ratingSummary: getDefaultRatingSummary(),
          };
        }

        state.commentsByProduct[product].comments.unshift(comment);
        state.commentsByProduct[product].pagination.total += 1;

        const oldSummary =
          state.commentsByProduct[product].ratingSummary ||
          getDefaultRatingSummary();

        const totalReviews = oldSummary.count + 1;
        const newAverage = parseFloat(
          (
            (oldSummary.average * oldSummary.count + comment.rating) /
            totalReviews
          ).toFixed(1),
        );

        const newDistribution = { ...oldSummary.distribution };
        newDistribution[comment.rating] =
          (newDistribution[comment.rating] || 0) + 1;

        state.commentsByProduct[product].ratingSummary = {
          average: newAverage,
          count: totalReviews,
          distribution: newDistribution,
        };
      })
      .addCase(addComment.rejected, (state) => {
        state.submitting = false;
      })
      // Edit comment
      .addCase(editComment.pending, (state) => {
        state.submitting = true;
      })
      .addCase(editComment.fulfilled, (state, action) => {
        state.submitting = false;
        const { comment } = action.payload;
        const { product, _id, rating: newRating } = comment;

        if (state.commentsByProduct[product]) {
          const index = state.commentsByProduct[product].comments.findIndex(
            (c) => c._id === _id,
          );
          if (index !== -1) {
            const oldRating =
              state.commentsByProduct[product].comments[index].rating;
            state.commentsByProduct[product].comments[index] = comment;

            if (oldRating !== newRating) {
              const summary =
                state.commentsByProduct[product].ratingSummary ||
                getDefaultRatingSummary();
              const totalReviews = summary.count;

              if (totalReviews > 0) {
                const newAverage = parseFloat(
                  (
                    (summary.average * totalReviews - oldRating + newRating) /
                    totalReviews
                  ).toFixed(1),
                );

                const newDistribution = { ...summary.distribution };
                newDistribution[oldRating] = Math.max(
                  0,
                  (newDistribution[oldRating] || 0) - 1,
                );
                newDistribution[newRating] =
                  (newDistribution[newRating] || 0) + 1;

                state.commentsByProduct[product].ratingSummary = {
                  ...summary,
                  average: newAverage,
                  distribution: newDistribution,
                };
              }
            }
          }
        }
      })
      .addCase(editComment.rejected, (state) => {
        state.submitting = false;
      })
      // Delete comment
      .addCase(removeComment.fulfilled, (state, action) => {
        const commentId = action.payload;

        Object.keys(state.commentsByProduct).forEach((productId) => {
          const productComments = state.commentsByProduct[productId];
          if (productComments) {
            const index = productComments.comments.findIndex(
              (c) => c._id === commentId,
            );
            if (index !== -1) {
              const deletedComment = productComments.comments[index];
              productComments.comments.splice(index, 1);
              productComments.pagination.total = Math.max(
                0,
                productComments.pagination.total - 1,
              );

              const summary =
                productComments.ratingSummary || getDefaultRatingSummary();
              const totalReviews = Math.max(0, summary.count - 1);

              if (totalReviews > 0) {
                const newAverage = parseFloat(
                  (
                    (summary.average * summary.count - deletedComment.rating) /
                    totalReviews
                  ).toFixed(1),
                );

                const newDistribution = { ...summary.distribution };
                newDistribution[deletedComment.rating] = Math.max(
                  0,
                  (newDistribution[deletedComment.rating] || 0) - 1,
                );

                productComments.ratingSummary = {
                  average: newAverage,
                  count: totalReviews,
                  distribution: newDistribution,
                };
              } else {
                productComments.ratingSummary = getDefaultRatingSummary();
              }
            }
          }
        });
      });
  },
});

// ✅ Memoized selector factories (use these to avoid warnings)
export const makeSelectProductComments = () => {
  return createSelector(
    [(state) => state.comments.commentsByProduct, (_, productId) => productId],
    (commentsByProduct, productId) => {
      return commentsByProduct[productId]?.comments || [];
    },
  );
};

export const makeSelectProductRatingSummary = () => {
  return createSelector(
    [(state) => state.comments.commentsByProduct, (_, productId) => productId],
    (commentsByProduct, productId) => {
      return (
        commentsByProduct[productId]?.ratingSummary || getDefaultRatingSummary()
      );
    },
  );
};

// Non-memoized selectors (can still be used but may cause warnings)
export const selectCommentsByProductId = (state, productId) => {
  return state.comments.commentsByProduct[productId]?.comments || [];
};

export const selectRatingSummaryByProductId = (state, productId) => {
  return (
    state.comments.commentsByProduct[productId]?.ratingSummary ||
    getDefaultRatingSummary()
  );
};

export const { clearComments, clearAllComments, clearError } =
  commentSlice.actions;
export default commentSlice.reducer;
