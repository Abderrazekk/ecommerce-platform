import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductById } from "../redux/slices/product.slice";
import {
  fetchProductComments,
  addComment,
  editComment,
  removeComment,
} from "../redux/slices/comment.slice";
import { addToCart } from "../redux/slices/cart.slice";
import { addToWishlist, removeFromWishlist } from "../redux/slices/auth.slice"; // NEW: Wishlist actions
import { formatPrice } from "../utils/formatPrice";
import Loader from "../components/common/Loader";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Star,
  Tag,
  ZoomIn,
  Maximize2,
  Film,
  Play,
  Pause,
  Image as ImageIcon,
  Video as VideoIcon,
  MessageSquare,
  Edit2,
  Trash2,
  Send,
  X,
  User,
  Calendar,
  Edit,
  ChevronLeft,
  ChevronRight,
  Save,
  XCircle,
  Clock,
  Heart,
  HeartOff,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, loading: productLoading } = useSelector(
    (state) => state.products,
  );
  const { user, isAuthenticated, wishlistIds } = useSelector(
    (state) => state.auth,
  );
  const {
    commentsByProduct,
    loading: commentsLoading,
    submitting,
    error,
  } = useSelector((state) => state.comments);

  // NEW: Wishlist state
  const isInWishlist = wishlistIds.has(id);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Video state
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showVideo, setShowVideo] = useState(product?.video ? true : false);
  const videoRef = useRef(null);

  // Zoom state
  const [isHovering, setIsHovering] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageContainerRef = useRef(null);
  const mainImageRef = useRef(null);
  const zoomLensRef = useRef(null);

  // Comment states
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [localSubmitting, setLocalSubmitting] = useState(false);

  useEffect(() => {
    console.log("DEBUG - Initializing ProductDetails for product:", id);
    console.log("DEBUG - User state:", user);
    console.log("DEBUG - Is Authenticated:", isAuthenticated);

    dispatch(fetchProductById(id));
    dispatch(fetchProductComments({ productId: id }));
  }, [dispatch, id]);

  // Reset showVideo when product changes
  useEffect(() => {
    if (product?.video) {
      setShowVideo(true);
    } else {
      setShowVideo(false);
    }
  }, [product]);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addToCart({
          product: product._id,
          name: product.name,
          price: product.discountPrice || product.price,
          image: product.images?.[0]?.url || "",
          quantity: quantity,
        }),
      );
    }
  };

  // NEW: Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      navigate(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(id));
    } else {
      dispatch(addToWishlist(id));
    }
  };

  // Handle mouse move for zoom
  const handleMouseMove = (e) => {
    if (
      !imageContainerRef.current ||
      !mainImageRef.current ||
      !product?.images ||
      !imageLoaded
    )
      return;

    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();

    // Get mouse position relative to container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only update if mouse is inside container
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setIsHovering(true);
      setCursorPos({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Calculate zoom lens position and background
  const calculateZoomStyle = () => {
    if (!imageContainerRef.current || !mainImageRef.current || !product?.images)
      return {};

    const container = imageContainerRef.current;
    const img = mainImageRef.current;
    const rect = container.getBoundingClientRect();

    // Lens dimensions
    const lensSize = 180;
    const zoomFactor = 1.5;

    // Calculate lens position (centered on cursor)
    let lensX = cursorPos.x - lensSize / 2;
    let lensY = cursorPos.y - lensSize / 2;

    // Keep lens within image bounds
    lensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
    lensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

    // Calculate background position for zoom
    const bgX = -(cursorPos.x * zoomFactor - lensSize / 2);
    const bgY = -(cursorPos.y * zoomFactor - lensSize / 2);

    return {
      lensPosition: { x: lensX, y: lensY },
      backgroundPosition: `${bgX}px ${bgY}px`,
      backgroundSize: `${rect.width * zoomFactor}px ${rect.height * zoomFactor}px`,
    };
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      imageContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Video controls
  const handleVideoPlayPause = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    setVideoPlaying(false);
  };

  const toggleView = (showVideoView) => {
    setShowVideo(showVideoView);
    if (showVideoView) {
      if (videoRef.current) {
        videoRef.current.pause();
        setVideoPlaying(false);
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // DEBUG: Function to check edit permissions with detailed logging
  const checkEditPermissions = (comment) => {
    console.group("DEBUG - Edit Permission Check");
    console.log("Current User:", {
      id: user?._id,
      name: user?.name,
      role: user?.role,
    });
    console.log("Comment Owner:", {
      id: comment.user?._id,
      name: comment.user?.name,
      role: comment.user?.role,
    });
    console.log("Is Same User:", user?._id === comment.user?._id);
    console.log("Is Admin:", user?.role === "admin");
    console.log(
      "Can Edit:",
      user?._id === comment.user?._id || user?.role === "admin",
    );
    console.groupEnd();
  };

  // Comment handlers
  const handleAddComment = async (e) => {
    e.preventDefault();
    console.log("DEBUG - Adding comment for product:", id);

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
        addComment({ productId: id, text: commentText }),
      );

      console.log("DEBUG - Add comment result:", result);

      if (result.type === "comments/add/fulfilled") {
        setCommentText("");
        console.log("DEBUG - Comment added successfully");
      } else {
        console.error("DEBUG - Failed to add comment:", result.payload);
        alert(`Failed to add comment: ${result.payload || "Unknown error"}`);
      }
    } catch (error) {
      console.error("DEBUG - Exception adding comment:", error);
      alert("An error occurred while adding comment");
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    console.log("DEBUG - Starting edit for comment:", comment._id);
    console.log("Comment data:", comment);
    checkEditPermissions(comment);

    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    console.log("DEBUG - Cancelling edit");
    setEditingCommentId(null);
    setEditText("");
  };

  const handleUpdateComment = async (commentId) => {
    console.log("DEBUG - Updating comment:", commentId);
    console.log("New text:", editText);

    if (!editText.trim()) {
      alert("Comment text is required");
      return;
    }

    try {
      setLocalSubmitting(true);
      const result = await dispatch(editComment({ commentId, text: editText }));

      console.log("DEBUG - Update comment result:", result);

      if (result.type === "comments/edit/fulfilled") {
        setEditingCommentId(null);
        setEditText("");
        console.log("DEBUG - Comment updated successfully");
      } else {
        console.error("DEBUG - Failed to update comment:", result.payload);
        alert(`Failed to update comment: ${result.payload || "Unknown error"}`);
      }
    } catch (error) {
      console.error("DEBUG - Exception updating comment:", error);
      alert("An error occurred while updating comment");
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    console.log("DEBUG - Deleting comment:", commentId);

    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const result = await dispatch(removeComment(commentId));
        console.log("DEBUG - Delete comment result:", result);

        if (result.type === "comments/delete/rejected") {
          alert(
            `Failed to delete comment: ${result.payload || "Unknown error"}`,
          );
        }
      } catch (error) {
        console.error("DEBUG - Exception deleting comment:", error);
        alert("An error occurred while deleting comment");
      }
    }
  };

  // Enhanced permission check with detailed logging
  // Replace the existing canEditComment function with this FIXED version:
  const canEditComment = (comment) => {
    if (!user || !comment || !comment.user) {
      console.log("DEBUG - Missing data for edit check");
      return false;
    }

    // Get the current user's ID - handle both .id and ._id formats
    const currentUserId = user._id || user.id;

    // Get the comment owner's ID - handle both ._id and .id formats
    const commentOwnerId = comment.user._id || comment.user.id;

    // Convert both to strings for safe comparison
    const userIdStr = currentUserId?.toString();
    const commentUserIdStr = commentOwnerId?.toString();

    const isOwner = userIdStr === commentUserIdStr;
    const isAdmin = user.role === "admin";

    console.log("DEBUG - canEditCheck:", {
      currentUser: {
        id: user._id,
        alternateId: user.id,
        finalId: userIdStr,
        name: user.name,
        role: user.role,
      },
      commentUser: {
        _id: comment.user._id,
        id: comment.user.id,
        finalId: commentUserIdStr,
        name: comment.user.name,
        role: comment.user.role,
      },
      isOwner,
      isAdmin,
      canEdit: isOwner || isAdmin,
    });

    return isOwner || isAdmin;
  };
  const canDeleteComment = (comment) => {
    if (!user) return false;
    return user.role === "admin";
  };

  // Format date for comments with relative time
  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return (
        "Today at " +
        date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else if (diffDays === 1) {
      return (
        "Yesterday at " +
        date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Get comments for current product
  const currentComments = commentsByProduct[id]?.comments || [];
  const commentPagination = commentsByProduct[id]?.pagination || {
    total: 0,
    page: 1,
    totalPages: 1,
  };

  // Debug logging for comments
  useEffect(() => {
    console.log("DEBUG - Current comments:", currentComments);
    console.log("DEBUG - Comments state:", commentsByProduct[id]);
  }, [currentComments, commentsByProduct, id]);

  if (productLoading) return <Loader />;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h2>
          <button onClick={() => navigate("/shop")} className="btn-primary">
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // Calculate discount percentage
  const discountPercentage = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

  // Get zoom styles
  const zoomStyle = calculateZoomStyle();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Media Section */}
            <div className="space-y-6">
              {/* View Toggle - Show only if product has video */}
              {product.video && (
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => toggleView(false)}
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                      !showVideo
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Images ({product.images?.length || 0})</span>
                  </button>
                  <button
                    onClick={() => toggleView(true)}
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                      showVideo
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <VideoIcon className="h-4 w-4" />
                    <span>Video</span>
                  </button>
                </div>
              )}

              {/* Video Player */}
              {showVideo && product.video && (
                <div className="mb-6">
                  <div className="relative rounded-lg overflow-hidden shadow-lg bg-black">
                    <video
                      ref={videoRef}
                      src={product.video}
                      className="w-full h-96 object-contain"
                      controls
                      onTimeUpdate={handleVideoTimeUpdate}
                      onLoadedMetadata={handleVideoLoaded}
                      onEnded={handleVideoEnded}
                      poster={product.images?.[0]?.url}
                    />

                    {/* Custom video controls overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleVideoPlayPause}
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-colors"
                        >
                          {videoPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </button>

                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-600/50 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-primary-500 h-full transition-all duration-100"
                              style={{ width: `${videoProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-300 mt-1">
                            <span>
                              {formatTime(videoRef.current?.currentTime || 0)}
                            </span>
                            <span>{formatTime(videoDuration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                      Product demonstration video
                    </p>
                  </div>
                </div>
              )}

              {/* Image Gallery */}
              {!showVideo && (
                <div className="relative">
                  {/* Zoom and Fullscreen Controls */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <ZoomIn className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">
                        1.5x Zoom
                      </span>
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="p-3 rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-50 transition-colors"
                      title="Fullscreen"
                    >
                      <Maximize2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Main Image Container with Zoom */}
                  <div
                    ref={imageContainerRef}
                    className="relative overflow-hidden rounded-lg cursor-none"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Main Image */}
                    {product.images && product.images.length > 0 && (
                      <img
                        ref={mainImageRef}
                        src={product.images[selectedImageIndex]?.url || ""}
                        alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                        className="w-full h-96 object-cover"
                        onLoad={handleImageLoad}
                      />
                    )}

                    {/* Zoom Lens - Professional glass effect */}
                    {isHovering &&
                      product.images &&
                      imageLoaded &&
                      product.images[selectedImageIndex] && (
                        <div
                          ref={zoomLensRef}
                          className="absolute pointer-events-none z-10 overflow-hidden rounded-full"
                          style={{
                            left: `${zoomStyle.lensPosition?.x || 0}px`,
                            top: `${zoomStyle.lensPosition?.y || 0}px`,
                            width: "180px",
                            height: "180px",
                            border: "2px solid rgba(255, 255, 255, 0.9)",
                            boxShadow: `
                            0 0 0 1px rgba(0, 0, 0, 0.1),
                            0 8px 32px rgba(0, 0, 0, 0.2),
                            inset 0 0 32px rgba(255, 255, 255, 0.2)
                          `,
                            backgroundColor: "transparent",
                            backdropFilter: "blur(2px)",
                            backgroundImage: `url(${product.images[selectedImageIndex].url})`,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: zoomStyle.backgroundSize || "auto",
                            backgroundPosition:
                              zoomStyle.backgroundPosition || "0px 0px",
                            transition: "left 0.05s linear, top 0.05s linear",
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.1)",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                            }}
                          />
                        </div>
                      )}

                    {/* Image Navigation Arrows */}
                    {product.images && product.images.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedImageIndex((prev) =>
                              prev > 0 ? prev - 1 : product.images.length - 1,
                            );
                            setIsHovering(false);
                          }}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-20"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedImageIndex((prev) =>
                              prev < product.images.length - 1 ? prev + 1 : 0,
                            );
                            setIsHovering(false);
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-20"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {product.images && product.images.length > 1 && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700">
                          More Views
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {selectedImageIndex + 1} of {product.images.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {product.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedImageIndex(index);
                              setShowVideo(false);
                            }}
                            className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                              selectedImageIndex === index && !showVideo
                                ? "border-primary-500 ring-2 ring-primary-200 ring-opacity-50 scale-105"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={`Thumbnail ${index + 1}`}
                              className="h-20 w-full object-cover"
                            />
                            {selectedImageIndex === index && !showVideo && (
                              <div className="absolute inset-0 bg-primary-500 bg-opacity-10"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zoom Instructions */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                    <p className="text-sm text-blue-700 flex items-center justify-center">
                      <ZoomIn className="h-4 w-4 mr-2" />
                      <span className="font-medium">
                        Hover over image for 1.5x zoom magnifier
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              {/* Brand and Category */}
              <div className="mb-4 flex flex-wrap gap-2">
                {product.brand && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                    {product.brand}
                  </span>
                )}
                <span className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.isFeatured && (
                  <span className="inline-flex bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </span>
                )}
                {product.video && (
                  <span className="inline-flex bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full items-center">
                    <Film className="h-3 w-3 mr-1" />
                    Has Video
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="inline-block bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-semibold">
                    {discountPercentage}% OFF
                  </span>
                )}
                {/* NEW: Wishlist Badge */}
                {isInWishlist && (
                  <span className="inline-flex bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full items-center">
                    <FaHeart className="h-3 w-3 fill-red-500 mr-1" />
                    In Wishlist
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-2">
                  {product.discountPrice ? (
                    <>
                      <p className="text-4xl font-bold text-green-600">
                        {formatPrice(product.discountPrice)}
                      </p>
                      <p className="text-2xl text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </p>
                    </>
                  ) : (
                    <p className="text-4xl font-bold text-primary-600">
                      {formatPrice(product.price)}
                    </p>
                  )}
                </div>

                {/* Stock Status */}
                <p
                  className={`text-sm font-medium ${
                    product.stock > 10
                      ? "text-green-600"
                      : product.stock > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {product.stock > 10
                    ? "✅ In Stock"
                    : product.stock > 0
                      ? "⚠️ Low Stock"
                      : "❌ Out of Stock"}
                  {product.stock > 0 && ` (${product.stock} available)`}
                </p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-gray-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Description
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              {product.stock > 0 ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-700 font-medium">
                        Quantity:
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              setQuantity(Math.max(1, quantity - 1))
                            }
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                          >
                            <span className="text-lg font-bold">-</span>
                          </button>
                          <span className="px-6 py-2 border-x border-gray-300 font-bold text-lg min-w-[60px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              setQuantity(Math.min(product.stock, quantity + 1))
                            }
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                          >
                            <span className="text-lg font-bold">+</span>
                          </button>
                        </div>
                        <span className="text-sm text-gray-500">
                          Max: {product.stock}
                        </span>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="mb-4 p-3 bg-white rounded border">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total:</span>
                        <span className="text-2xl font-bold text-primary-600">
                          {formatPrice(
                            (product.discountPrice || product.price) * quantity,
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {/* Add to Cart Button */}
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 flex items-center justify-center space-x-3 bg-primary-600 hover:bg-primary-700 text-white py-4 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
                      >
                        <ShoppingCart className="h-6 w-6" />
                        <span>Add to Cart</span>
                      </button>

                      {/* NEW: Wishlist Button */}
                      <button
                        onClick={handleWishlistToggle}
                        className={`px-4 py-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isInWishlist
                            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                            : "bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100"
                        }`}
                        title={
                          isInWishlist
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                        }
                      >
                        {isInWishlist ? (
                          <Heart className="h-6 w-6 fill-red-500" />
                        ) : (
                          <Heart className="h-6 w-6" />
                        )}
                      </button>
                    </div>

                    {/* Quick add buttons */}
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, 3))}
                        className="flex-1 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        Add 3
                      </button>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, 5))}
                        className="flex-1 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        Add 5
                      </button>
                      <button
                        onClick={() => setQuantity(product.stock)}
                        className="flex-1 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        Add All
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-red-100 rounded-full mr-3">
                      <Check className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-700">Out of Stock</h4>
                      <p className="text-red-600 text-sm">
                        This product is currently unavailable
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleWishlistToggle}
                      className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        isInWishlist
                          ? "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
                          : "border border-red-300 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                      }`}
                    >
                      {isInWishlist ? (
                        <>
                          <Heart className="h-5 w-5 fill-red-500" />
                          Remove from Wishlist
                        </>
                      ) : (
                        <>
                          <Heart className="h-5 w-5" />
                          Save for Later
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        // Add to wishlist or notify when back in stock
                      }}
                      className="flex-1 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
                    >
                      Notify me when available
                    </button>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <MessageSquare className="h-6 w-6 mr-2 text-primary-600" />
                    Product Comments
                    {commentPagination.total > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {commentPagination.total}
                      </span>
                    )}
                  </h3>
                </div>

                {/* Add Comment Form */}
                {isAuthenticated ? (
                  <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800">
                      Add Your Comment
                    </h4>
                    <form onSubmit={handleAddComment}>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your thoughts about this product..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        rows={3}
                        maxLength={1000}
                        disabled={localSubmitting || submitting}
                      />
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-gray-500">
                          {commentText.length}/1000 characters
                        </span>
                        <button
                          type="submit"
                          disabled={
                            !commentText.trim() || localSubmitting || submitting
                          }
                          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {localSubmitting || submitting ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              <span>Post Comment</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">Error: {error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-blue-800">
                      Please{" "}
                      <button
                        onClick={() => navigate("/login")}
                        className="text-blue-600 hover:text-blue-800 font-semibold underline"
                      >
                        login
                      </button>{" "}
                      to add a comment
                    </p>
                  </div>
                )}

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader />
                  </div>
                ) : currentComments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">
                      No comments yet
                    </h4>
                    <p className="text-gray-500">
                      Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentComments.map((comment) => (
                      <div
                        key={comment._id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors group relative"
                      >
                        {/* Edit Tooltip */}
                        {canEditComment(comment) && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded shadow-sm">
                              Click pencil to edit
                            </div>
                          </div>
                        )}

                        {/* Comment Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary-600" />
                              </div>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">
                                {comment.user?.name || "Unknown User"}
                                {comment.user?.role === "admin" && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                    Admin
                                  </span>
                                )}
                              </h5>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <time dateTime={comment.createdAt}>
                                  {formatCommentDate(comment.createdAt)}
                                </time>
                                {comment.isEdited && (
                                  <div className="relative group/edit-badge inline-block">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded cursor-help">
                                      Edited
                                    </span>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/edit-badge:opacity-100 transition-opacity whitespace-nowrap z-10">
                                      <div className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Last edited:{" "}
                                        {new Date(
                                          comment.updatedAt,
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {(canEditComment(comment) ||
                            canDeleteComment(comment)) && (
                            <div className="flex space-x-2">
                              {canEditComment(comment) && (
                                <button
                                  onClick={() => {
                                    console.log("DEBUG - Edit button clicked");
                                    console.log(
                                      "Comment user ID:",
                                      comment.user?._id,
                                    );
                                    console.log("Current user ID:", user?._id);
                                    handleStartEdit(comment);
                                  }}
                                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                  title="Edit comment"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                              {canDeleteComment(comment) && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                  title="Delete comment"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Comment Content */}
                        {editingCommentId === comment._id ? (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-blue-800 mb-2">
                                Edit your comment
                              </label>
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                                maxLength={1000}
                                autoFocus
                              />
                              <div className="text-sm text-gray-600 mt-1 flex justify-between">
                                <span>{editText.length}/1000 characters</span>
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
                                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={localSubmitting}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateComment(comment._id)}
                                disabled={
                                  !editText.trim() ||
                                  localSubmitting ||
                                  submitting
                                }
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {localSubmitting || submitting ? (
                                  <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {comment.text}
                          </p>
                        )}

                        {/* Debug info (visible only in development) */}
                        {process.env.NODE_ENV === "development" && (
                          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                            <div className="flex justify-between">
                              <span>Comment ID: {comment._id?.slice(-8)}</span>
                              <span>
                                User ID: {comment.user?._id?.slice(-8)}
                              </span>
                              <span>
                                Can Edit:{" "}
                                {canEditComment(comment) ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination for comments */}
                {commentPagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          dispatch(
                            fetchProductComments({
                              productId: id,
                              page: commentPagination.page - 1,
                            }),
                          )
                        }
                        disabled={commentPagination.page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-600">
                        Page {commentPagination.page} of{" "}
                        {commentPagination.totalPages}
                      </span>
                      <button
                        onClick={() =>
                          dispatch(
                            fetchProductComments({
                              productId: id,
                              page: commentPagination.page + 1,
                            }),
                          )
                        }
                        disabled={
                          commentPagination.page >= commentPagination.totalPages
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
