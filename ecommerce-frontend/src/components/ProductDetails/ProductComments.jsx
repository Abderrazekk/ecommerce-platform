// ecommerce-frontend/src/components/ProductDetails/ProductComments.jsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  User,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  ChevronDown,
  Filter,
} from "lucide-react";
import StarRating from "../common/StarRating";
import toast from "react-hot-toast";

// Import the memoized selectors
import {
  selectCommentsByProductId,
  selectRatingSummaryByProductId,
} from "../../redux/slices/comment.slice";

const ProductComments = ({
  id,
  user,
  isAuthenticated,
  commentsLoading,
  submitting,
  error,
  dispatch,
  navigate,
  addComment,
  editComment,
  removeComment,
  fetchProductComments,
}) => {
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Use memoized selectors with stable references
  const currentComments = useSelector(
    useMemo(
      () => (state) => selectCommentsByProductId(state, id),
      [id]
    )
  );

  const ratingSummary = useSelector(
    useMemo(
      () => (state) => selectRatingSummaryByProductId(state, id),
      [id]
    )
  );

  // Memoize displayed comments calculation
  const displayedComments = useMemo(() => {
    return showAllComments
      ? currentComments
      : currentComments.slice(0, 3);
  }, [currentComments, showAllComments]);

  // FIXED: Handle adding comment with proper state updates
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
      
      // Dispatch the add comment action
      const resultAction = await dispatch(
        addComment({ productId: id, text: commentText, rating })
      );
      
      if (addComment.fulfilled.match(resultAction)) {
        // Success - clear form
        setCommentText("");
        setRating(0);
        
        // FIX: Immediately refetch comments to get updated list
        // This ensures the UI updates without refresh
        await dispatch(fetchProductComments({ productId: id, sortBy }));
        
      } else if (addComment.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || "Failed to add review");
      }
      
    } catch (error) {
      console.error("Error adding review:", error);
      // Don't show error toast here - it's already shown by the thunk
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

  // FIXED: Handle updating comment with proper state updates
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
        editComment({ commentId, text: editText, rating: editRating })
      );

      if (editComment.fulfilled.match(resultAction)) {
        setEditingCommentId(null);
        setEditText("");
        setEditRating(0);
        
        // FIX: Immediately refetch comments to get updated list
        await dispatch(fetchProductComments({ productId: id, sortBy }));
        
      } else if (editComment.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
    } finally {
      setLocalSubmitting(false);
    }
  };

  // FIXED: Handle deleting comment with proper state updates
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const resultAction = await dispatch(removeComment(commentId));
        
        if (removeComment.fulfilled.match(resultAction)) {
          // FIX: Immediately refetch comments to get updated list
          await dispatch(fetchProductComments({ productId: id, sortBy }));
        } else if (removeComment.rejected.match(resultAction)) {
          throw new Error(resultAction.payload || "Failed to delete review");
        }
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    dispatch(fetchProductComments({ productId: id, sortBy: newSortBy }));
  };

  const canEditComment = (comment) => {
    if (!user || !comment || !comment.user) return false;
    const currentUserId = user._id || user.id;
    const commentOwnerId = comment.user._id || comment.user.id;
    const userIdStr = currentUserId?.toString();
    const commentUserIdStr = commentOwnerId?.toString();
    const isOwner = userIdStr === commentUserIdStr;
    const isAdmin = user.role === "admin";
    return isOwner || isAdmin;
  };

  const canDeleteComment = (comment) => {
    if (!user) return false;
    return user.role === "admin";
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

  // Calculate percentage for rating distribution bar
  const getPercentage = useMemo(() => (count) => {
    if (ratingSummary.count === 0) return 0;
    return (count / ratingSummary.count) * 100;
  }, [ratingSummary.count]);

  return (
    <div className="mt-24 pt-20 border-t border-gray-100">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-normal text-gray-900 mb-4">
            Customer Reviews
          </h2>
          
          {/* Average Rating Display */}
          {ratingSummary.count > 0 && (
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-5xl font-light text-gray-900">
                  {ratingSummary.average.toFixed(1)}
                </div>
                <div>
                  <StarRating rating={ratingSummary.average} readOnly size="lg" />
                  <p className="text-gray-600 mt-2">
                    Based on {ratingSummary.count} {ratingSummary.count === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
              
              {/* Rating Distribution */}
              <div className="w-full max-w-md space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-8">{star}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${getPercentage(ratingSummary.distribution[star] || 0)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {ratingSummary.distribution[star] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort Options */}
        {currentComments.length > 0 && (
          <div className="mb-8 flex justify-end">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: "newest", label: "Newest" },
                  { value: "highest", label: "Highest Rated" },
                  { value: "lowest", label: "Lowest Rated" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === option.value
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Review Form */}
        {isAuthenticated ? (
          <div className="mb-12 bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-normal text-gray-900 mb-6">
              Write a Review
            </h3>
            <form onSubmit={handleAddComment} className="space-y-6">
              <div className="space-y-4">
                {/* Star Rating Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={rating}
                      onRatingChange={setRating}
                      size="lg"
                    />
                    <span className="text-gray-600 ml-4">
                      {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
                    </span>
                  </div>
                </div>
                
                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Review *
                  </label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none bg-white"
                    rows={4}
                    maxLength={1000}
                    disabled={localSubmitting || submitting}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {commentText.length}/1000 characters
                </span>
                <button
                  type="submit"
                  disabled={
                    !commentText.trim() || rating === 0 || localSubmitting || submitting
                  }
                  className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-3"
                >
                  {localSubmitting || submitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">Error: {error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-12 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-700 text-lg">
              Please{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-gray-900 hover:text-black font-medium underline"
              >
                sign in
              </button>{" "}
              to leave a review
            </p>
          </div>
        )}

        {/* Reviews List */}
        {commentsLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentComments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <MessageSquare className="h-12 w-12 text-gray-400" />
            </div>
            <h4 className="text-2xl font-normal text-gray-900 mb-4">
              No Reviews Yet
            </h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Be the first to share your experience with this product.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {displayedComments.map((comment) => (
              <div
                key={comment._id}
                className="border-b border-gray-100 pb-8 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <User className="h-7 w-7 text-gray-600" />
                      </div>
                      {comment.user?.role === "admin" && (
                        <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                          Admin
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h5 className="font-medium text-gray-900">
                          {comment.user?.name || "Anonymous"}
                        </h5>
                      </div>
                      <div className="mb-2">
                        <StarRating rating={comment.rating} readOnly size="sm" />
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <time dateTime={comment.createdAt}>
                          {formatCommentDate(comment.createdAt)}
                        </time>
                        {comment.isEdited && (
                          <span className="text-xs text-gray-400">Edited</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {(canEditComment(comment) || canDeleteComment(comment)) && (
                    <div className="flex space-x-2">
                      {canEditComment(comment) && (
                        <button
                          onClick={() => handleStartEdit(comment)}
                          className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit review"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {canDeleteComment(comment) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Edit Your Review
                      </label>
                      
                      {/* Star Rating for Edit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Rating *
                        </label>
                        <div className="flex items-center gap-2">
                          <StarRating
                            rating={editRating}
                            onRatingChange={setEditRating}
                            size="md"
                          />
                          <span className="text-gray-600 ml-4">
                            {editRating > 0 ? `${editRating} out of 5 stars` : "Select a rating"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Review Text for Edit */}
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none bg-white"
                        rows={4}
                        maxLength={1000}
                        autoFocus
                      />
                      <div className="text-sm text-gray-500 flex justify-between">
                        <span>{editText.length}/1000 characters</span>
                        {editText.length === 1000 && (
                          <span className="text-red-500">
                            Character limit reached
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={handleCancelEdit}
                        className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={localSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        disabled={
                          !editText.trim() || editRating === 0 || localSubmitting || submitting
                        }
                        className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {localSubmitting || submitting
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {comment.text}
                  </p>
                )}
              </div>
            ))}

            {/* Show More Reviews Button */}
            {currentComments.length > 3 && !showAllComments && (
              <div className="text-center pt-12">
                <button
                  onClick={() => setShowAllComments(true)}
                  className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-medium group"
                >
                  <span>Show {currentComments.length - 3} More Reviews</span>
                  <ChevronDown className="h-5 w-5 ml-3 group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductComments;