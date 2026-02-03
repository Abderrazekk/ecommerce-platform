// src/components/product/ProductComments.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  ChevronDown,
  Star,
} from "lucide-react";

const ProductComments = ({
  commentsByProduct,
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
}) => {
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const currentComments = commentsByProduct[id]?.comments || [];
  const displayedComments = showAllComments
    ? currentComments
    : currentComments.slice(0, 3);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      alert("Comment text is required");
      return;
    }

    if (!isAuthenticated) {
      alert("You must be logged in to comment");
      navigate("/login");
      return;
    }

    try {
      setLocalSubmitting(true);
      const result = await dispatch(
        addComment({ productId: id, text: commentText })
      );

      if (result.type === "comments/add/fulfilled") {
        setCommentText("");
      } else {
        alert(`Failed to add comment: ${result.payload || "Unknown error"}`);
      }
    } catch (error) {
      alert("An error occurred while adding comment");
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      alert("Comment text is required");
      return;
    }

    try {
      setLocalSubmitting(true);
      const result = await dispatch(editComment({ commentId, text: editText }));

      if (result.type === "comments/edit/fulfilled") {
        setEditingCommentId(null);
        setEditText("");
      } else {
        alert(`Failed to update comment: ${result.payload || "Unknown error"}`);
      }
    } catch (error) {
      alert("An error occurred while updating comment");
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const result = await dispatch(removeComment(commentId));
        if (result.type === "comments/delete/rejected") {
          alert(
            `Failed to delete comment: ${result.payload || "Unknown error"}`
          );
        }
      } catch (error) {
        alert("An error occurred while deleting comment");
      }
    }
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

  return (
    <div className="mt-24 pt-20 border-t border-gray-100">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-normal text-gray-900 mb-4">
            Customer Comments
          </h2>
        </div>

        {/* Add Comment Form */}
        {isAuthenticated ? (
          <div className="mb-12 bg-gray-50 rounded-2xl p-8">
            <form onSubmit={handleAddComment} className="space-y-6">
              <div className="space-y-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none bg-white"
                  rows={4}
                  maxLength={1000}
                  disabled={localSubmitting || submitting}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {commentText.length}/1000 characters
                </span>
                <button
                  type="submit"
                  disabled={
                    !commentText.trim() || localSubmitting || submitting
                  }
                  className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-3"
                >
                  {localSubmitting || submitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Post Review</span>
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
              to share your review
            </p>
          </div>
        )}

        {/* Comments List */}
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
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
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
                          title="Edit comment"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {canDeleteComment(comment) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete comment"
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
                          !editText.trim() || localSubmitting || submitting
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

            {/* Show More Comments Button */}
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