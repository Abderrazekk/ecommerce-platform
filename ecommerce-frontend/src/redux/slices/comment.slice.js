// redux/slices/comment.slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import commentService from "../../services/comment.service";
import { toast } from "react-hot-toast";

// Async thunks
export const fetchProductComments = createAsyncThunk(
  "comments/fetchByProduct",
  async ({ productId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await commentService.getProductComments(
        productId,
        page,
        limit
      );
      return { productId, data: response.data };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch comments"
      );
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addComment = createAsyncThunk(
  "comments/add",
  async ({ productId, text }, { rejectWithValue }) => {
    try {
      const response = await commentService.createComment(productId, text);
      toast.success("Comment added successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const editComment = createAsyncThunk(
  "comments/edit",
  async ({ commentId, text }, { rejectWithValue }) => {
    try {
      const response = await commentService.updateComment(commentId, text);
      toast.success("Comment updated successfully!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update comment");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const removeComment = createAsyncThunk(
  "comments/delete",
  async (commentId, { rejectWithValue }) => {
    try {
      await commentService.deleteComment(commentId);
      toast.success("Comment deleted successfully!");
      return commentId;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  commentsByProduct: {}, // { productId: { comments: [], pagination: {} } }
  loading: false,
  error: null,
  submitting: false,
};

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
          comments: data.comments,
          pagination: data.pagination,
        };
      })
      .addCase(fetchProductComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add comment
      .addCase(addComment.pending, (state) => {
        state.submitting = true;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.submitting = false;
        const { comment } = action.payload;
        const { product } = comment;

        if (state.commentsByProduct[product]) {
          // Add to beginning of array (newest first)
          state.commentsByProduct[product].comments.unshift(comment);
          state.commentsByProduct[product].pagination.total += 1;
        } else {
          // Create new entry if product doesn't have comments yet
          state.commentsByProduct[product] = {
            comments: [comment],
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1,
            },
          };
        }
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
        const { product, _id } = comment;

        if (state.commentsByProduct[product]) {
          const index = state.commentsByProduct[product].comments.findIndex(
            (c) => c._id === _id
          );
          if (index !== -1) {
            state.commentsByProduct[product].comments[index] = comment;
          }
        }
      })
      .addCase(editComment.rejected, (state) => {
        state.submitting = false;
      })
      // Delete comment
      .addCase(removeComment.fulfilled, (state, action) => {
        const commentId = action.payload;

        // Find and remove comment from all products
        Object.keys(state.commentsByProduct).forEach((productId) => {
          const productComments = state.commentsByProduct[productId];
          if (productComments) {
            const index = productComments.comments.findIndex(
              (c) => c._id === commentId
            );
            if (index !== -1) {
              productComments.comments.splice(index, 1);
              productComments.pagination.total -= 1;
            }
          }
        });
      });
  },
});

export const { clearComments, clearAllComments, clearError } =
  commentSlice.actions;
export default commentSlice.reducer;