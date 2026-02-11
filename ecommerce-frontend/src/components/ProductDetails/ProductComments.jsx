// ecommerce-frontend/src/components/ProductDetails/ProductComments.jsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import StarRating from "../common/StarRating";
import toast from "react-hot-toast";

import {
  addComment,
  editComment,
  removeComment,
  fetchProductComments,
  selectCommentsByProductId,
  selectRatingSummaryByProductId,
} from "../../redux/slices/comment.slice";

const ProductComments = ({ productId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const {
    loading: commentsLoading,
    submitting,
    error,
  } = useSelector((state) => state.comments);

  const currentComments = useSelector(
    useMemo(
      () => (state) => selectCommentsByProductId(state, productId),
      [productId],
    ),
  );

  const ratingSummary = useSelector(
    useMemo(
      () => (state) => selectRatingSummaryByProductId(state, productId),
      [productId],
    ),
  );

  const displayedComments = useMemo(
    () => (showAllComments ? currentComments : currentComments.slice(0, 3)),
    [currentComments, showAllComments],
  );

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.error("Review text is required");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!isAuthenticated) {
      toast.error("You must be logged in to leave a review");
      navigate("/login");
      return;
    }

    try {
      setLocalSubmitting(true);
      const resultAction = await dispatch(
        addComment({ productId, text: commentText, rating }),
      );

      if (addComment.fulfilled.match(resultAction)) {
        setCommentText("");
        setRating(0);
        await dispatch(fetchProductComments({ productId, sortBy }));
      } else if (addComment.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || "Failed to add review");
      }
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
    setEditRating(comment.rating);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
    setEditRating(0);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      toast.error("Review text is required");
      return;
    }
    if (editRating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    try {
      setLocalSubmitting(true);
      const resultAction = await dispatch(
        editComment({ commentId, text: editText, rating: editRating }),
      );

      if (editComment.fulfilled.match(resultAction)) {
        setEditingCommentId(null);
        setEditText("");
        setEditRating(0);
        await dispatch(fetchProductComments({ productId, sortBy }));
      } else if (editComment.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const resultAction = await dispatch(removeComment(commentId));
      if (removeComment.fulfilled.match(resultAction)) {
        await dispatch(fetchProductComments({ productId, sortBy }));
      } else if (removeComment.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    dispatch(fetchProductComments({ productId, sortBy: newSortBy }));
  };

  const canEditComment = (comment) => {
    if (!user || !comment?.user) return false;
    const currentUserId = user._id || user.id;
    const commentOwnerId = comment.user._id || comment.user.id;
    return (
      currentUserId?.toString() === commentOwnerId?.toString() ||
      user.role === "admin"
    );
  };

  const canDeleteComment = (comment) => {
    return user?.role === "admin";
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return (
        "Today at " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else if (diffDays === 1) {
      return (
        "Yesterday at " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPercentage = useMemo(
    () => (count) =>
      ratingSummary.count === 0 ? 0 : (count / ratingSummary.count) * 100,
    [ratingSummary.count],
  );

  if (!ratingSummary) return null;

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-xl font-medium text-gray-900">Customer Reviews</h2>
      </div>

      {/* Add Review Form – cleaner, with focus states */}
      {isAuthenticated ? (
        <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100">
          <h3 className="text-base font-medium text-gray-900 mb-4">
            Write a Review
          </h3>
          <form onSubmit={handleAddComment} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="md"
                />
                <span className="text-xs text-gray-600 ml-2">
                  {rating > 0 ? `${rating} out of 5` : "Select a rating"}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white text-sm transition-shadow"
                rows={3}
                maxLength={1000}
                disabled={localSubmitting || submitting}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {commentText.length}/1000
              </span>
              <button
                type="submit"
                disabled={
                  !commentText.trim() ||
                  rating === 0 ||
                  localSubmitting ||
                  submitting
                }
                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all flex items-center gap-2 shadow-button hover:shadow-button-hover hover:-translate-y-0.5"
              >
                {localSubmitting || submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-700">
            Please{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
            >
              sign in
            </button>{" "}
            to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      {commentsLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : currentComments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-base font-medium text-gray-900 mb-2">
            No Reviews Yet
          </h4>
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            Be the first to share your experience with this product.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedComments.map((comment) => (
            <div
              key={comment._id}
              className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-white shadow-sm">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    {comment.user?.role === "admin" && (
                      <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ring-2 ring-white">
                        Admin
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="text-sm font-semibold text-gray-900">
                        {comment.user?.name || "Anonymous"}
                      </h5>
                    </div>
                    <div className="mt-1">
                      <StarRating rating={comment.rating} readOnly size="sm" />
                    </div>
                    <div className="flex items-center space-x-3 mt-1.5 text-xs text-gray-500">
                      <time dateTime={comment.createdAt}>
                        {formatCommentDate(comment.createdAt)}
                      </time>
                      {comment.isEdited && (
                        <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Edited
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {(canEditComment(comment) || canDeleteComment(comment)) && (
                  <div className="flex space-x-1">
                    {canEditComment(comment) && (
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Edit review"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Comment Content / Edit Form */}
              {editingCommentId === comment._id ? (
                <div className="mt-4 space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={editRating}
                        onRatingChange={setEditRating}
                        size="md"
                      />
                      <span className="text-xs text-gray-600 ml-2">
                        {editRating > 0
                          ? `${editRating} out of 5`
                          : "Select a rating"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Review *
                    </label>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white text-sm"
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="text-xs text-gray-500 flex justify-between mt-1.5">
                      <span>{editText.length}/1000</span>
                      {editText.length === 1000 && (
                        <span className="text-red-500">
                          Character limit reached
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateComment(comment._id)}
                      disabled={
                        !editText.trim() ||
                        editRating === 0 ||
                        localSubmitting ||
                        submitting
                      }
                      className="px-5 py-1.5 bg-gray-900 hover:bg-black text-white rounded-md text-xs font-medium disabled:opacity-50 transition-all hover:-translate-y-0.5"
                    >
                      {localSubmitting || submitting
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed mt-2 bg-gray-50/50 p-4 rounded-lg">
                  {comment.text}
                </p>
              )}
            </div>
          ))}

          {/* Show More Reviews Button */}
          {currentComments.length > 3 && !showAllComments && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowAllComments(true)}
                className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium shadow-sm hover:shadow"
              >
                <span>Show {currentComments.length - 3} More Reviews</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductComments;
