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
  ChevronDown,
  Volume2,
  VolumeX,
  Settings,
  Download,
  Heart,
  Share2,
  Package,
  Truck,
  Shield,
  Award,
  RefreshCw,
  Globe,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, loading: productLoading } = useSelector(
    (state) => state.products,
  );
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const {
    commentsByProduct,
    loading: commentsLoading,
    submitting,
    error,
  } = useSelector((state) => state.comments);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Enhanced Video state
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoVolume, setVideoVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [showVideoControls, setShowVideoControls] = useState(true);
  const [videoQuality, setVideoQuality] = useState("auto");
  const videoRef = useRef(null);
  const videoControlsTimeout = useRef(null);

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
    dispatch(fetchProductById(id));
    dispatch(fetchProductComments({ productId: id }));
  }, [dispatch, id]);

  // Enhanced Video Controls
  const handleVideoPlayPause = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
      resetVideoControlsTimeout();
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
      videoRef.current.volume = videoVolume;
    }
  };

  const handleVideoEnded = () => {
    setVideoPlaying(false);
  };

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setVideoVolume(volume);
    setIsMuted(volume === 0);
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = videoVolume || 0.5;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
      resetVideoControlsTimeout();
    }
  };

  const changeVideoSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setVideoSpeed(speed);
      resetVideoControlsTimeout();
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current && videoDuration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * videoDuration;
      setVideoProgress(percent * 100);
      resetVideoControlsTimeout();
    }
  };

  const toggleFullscreen = (element) => {
    if (!document.fullscreenElement) {
      element?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetVideoControlsTimeout = () => {
    setShowVideoControls(true);
    if (videoControlsTimeout.current) {
      clearTimeout(videoControlsTimeout.current);
    }
    videoControlsTimeout.current = setTimeout(() => {
      setShowVideoControls(false);
    }, 3000);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (videoControlsTimeout.current) {
        clearTimeout(videoControlsTimeout.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setIsHovering(true);
      setCursorPos({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const calculateZoomStyle = () => {
    if (!imageContainerRef.current || !mainImageRef.current || !product?.images)
      return {};

    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();

    const lensSize = 180;
    const zoomFactor = 2;

    let lensX = cursorPos.x - lensSize / 2;
    let lensY = cursorPos.y - lensSize / 2;

    lensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
    lensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

    const bgX = -(cursorPos.x * zoomFactor - lensSize / 2);
    const bgY = -(cursorPos.y * zoomFactor - lensSize / 2);

    return {
      lensPosition: { x: lensX, y: lensY },
      backgroundPosition: `${bgX}px ${bgY}px`,
      backgroundSize: `${rect.width * zoomFactor}px ${rect.height * zoomFactor}px`,
    };
  };

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

  // Comment handlers
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
        addComment({ productId: id, text: commentText }),
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
            `Failed to delete comment: ${result.payload || "Unknown error"}`,
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

  // Get comments for current product
  const currentComments = commentsByProduct[id]?.comments || [];
  const commentPagination = commentsByProduct[id]?.pagination || {
    total: 0,
    page: 1,
    totalPages: 1,
  };

  if (productLoading) return <Loader />;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

  const zoomStyle = calculateZoomStyle();
  const displayedComments = showAllComments
    ? currentComments
    : currentComments.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors mr-3">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="font-medium">Back to Collection</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Media */}
          <div className="space-y-12">
            {/* Images Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900">Gallery</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {product.images?.length || 0} images
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ZoomIn className="h-4 w-4" />
                  <span>Hover to zoom 2x</span>
                </div>
              </div>

              {/* Main Image Container */}
              <div
                ref={imageContainerRef}
                className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm"
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
                    className="w-full h-[600px] object-contain"
                    onLoad={handleImageLoad}
                  />
                )}

                {/* Zoom Lens */}
                {isHovering &&
                  product.images &&
                  imageLoaded &&
                  product.images[selectedImageIndex] && (
                    <div
                      ref={zoomLensRef}
                      className="absolute pointer-events-none z-20 overflow-hidden rounded-full"
                      style={{
                        left: `${zoomStyle.lensPosition?.x || 0}px`,
                        top: `${zoomStyle.lensPosition?.y || 0}px`,
                        width: "200px",
                        height: "200px",
                        border: "2px solid rgba(255, 255, 255, 0.9)",
                        boxShadow:
                          "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 0 40px rgba(255, 255, 255, 0.3)",
                        backgroundImage: `url(${product.images[selectedImageIndex].url})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: zoomStyle.backgroundSize || "auto",
                        backgroundPosition:
                          zoomStyle.backgroundPosition || "0px 0px",
                        transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  )}

                {/* Navigation & Controls */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedImageIndex((prev) =>
                          prev > 0 ? prev - 1 : product.images.length - 1,
                        );
                        setIsHovering(false);
                      }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 group"
                    >
                      <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedImageIndex((prev) =>
                          prev < product.images.length - 1 ? prev + 1 : 0,
                        );
                        setIsHovering(false);
                      }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 group"
                    >
                      <ChevronRight className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                  {selectedImageIndex + 1} / {product.images?.length || 1}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-4 overflow-x-auto py-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 relative overflow-hidden rounded-xl transition-all duration-300 ${
                        selectedImageIndex === index
                          ? "ring-2 ring-primary-500 ring-offset-2"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-24 h-24 object-cover"
                      />
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-primary-500/10"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Video Section - Professional Video Player */}
            {product.video && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Film className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Product Video
                      </h3>
                      <p className="text-sm text-gray-500">
                        Detailed demonstration
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFullscreen(videoRef.current)}
                    className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </button>
                </div>

                <div
                  className="relative rounded-2xl overflow-hidden bg-black border border-gray-800 shadow-2xl"
                  onMouseMove={resetVideoControlsTimeout}
                  onMouseLeave={() => {
                    if (videoControlsTimeout.current) {
                      clearTimeout(videoControlsTimeout.current);
                    }
                    videoControlsTimeout.current = setTimeout(() => {
                      setShowVideoControls(false);
                    }, 1000);
                  }}
                >
                  <video
                    ref={videoRef}
                    src={product.video}
                    className="w-full h-[500px] object-contain"
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoaded}
                    onEnded={handleVideoEnded}
                    poster={product.images?.[0]?.url}
                    onClick={handleVideoPlayPause}
                  />

                  {/* Enhanced Video Controls Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
                      showVideoControls ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {/* Top Controls Bar */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={toggleMute}
                          className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX className="h-5 w-5 text-white" />
                          ) : (
                            <Volume2 className="h-5 w-5 text-white" />
                          )}
                        </button>
                        <div className="w-32">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : videoVolume}
                            onChange={handleVolumeChange}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="relative group">
                          <button className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                            <Settings className="h-5 w-5 text-white" />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-40 bg-gray-900/95 backdrop-blur-sm rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl">
                            {[0.5, 1, 1.5, 2].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => changeVideoSpeed(speed)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors ${
                                  videoSpeed === speed ? "bg-white/20" : ""
                                }`}
                              >
                                {speed}x Speed
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center Play Button */}
                    {!videoPlaying && (
                      <button
                        onClick={handleVideoPlayPause}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
                      >
                        <Play className="h-10 w-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                      </button>
                    )}

                    {/* Bottom Controls Bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                      {/* Progress Bar */}
                      <div
                        className="relative h-1.5 bg-gray-700/50 rounded-full cursor-pointer group"
                        onClick={handleSeek}
                      >
                        <div
                          className="absolute h-full bg-primary-500 rounded-full transition-all duration-100"
                          style={{ width: `${videoProgress}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ left: `calc(${videoProgress}% - 8px)` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={handleVideoPlayPause}
                            className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                          >
                            {videoPlaying ? (
                              <Pause className="h-5 w-5 text-white" />
                            ) : (
                              <Play className="h-5 w-5 text-white" />
                            )}
                          </button>
                          <div className="text-white text-sm font-medium">
                            {formatTime(videoRef.current?.currentTime || 0)} /{" "}
                            {formatTime(videoDuration)}
                          </div>
                        </div>
                        <div className="text-white text-sm">{videoSpeed}x</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-10">
            {/* Product Header */}
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {product.brand && (
                  <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                    {product.brand}
                  </span>
                )}
                <span className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
                  {product.category}
                </span>
                {product.isFeatured && (
                  <span className="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-full">
                    <Star className="h-3 w-3 mr-2" />
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-normal text-gray-900 leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2.5 rounded-lg border transition-colors ${
                      isWishlisted
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`}
                    />
                  </button>
                  <button className="p-2.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-baseline space-x-4">
                {product.discountPrice ? (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-baseline space-x-3">
                        <span className="text-5xl font-light text-gray-900">
                          {formatPrice(product.discountPrice)}
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <div className="inline-flex items-center px-4 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                        Save {discountPercentage}% •{" "}
                        {formatPrice(product.price - product.discountPrice)}
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-5xl font-light text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    product.stock > 10
                      ? "bg-green-50 text-green-700"
                      : product.stock > 0
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      product.stock > 10
                        ? "bg-green-500"
                        : product.stock > 0
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  {product.stock > 10
                    ? "In Stock"
                    : product.stock > 0
                      ? "Low Stock"
                      : "Out of Stock"}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Description
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Product Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {product.stock > 0 ? (
              <div className="space-y-8 pt-8 border-t border-gray-100">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <span className="text-sm text-gray-500">
                        Max: {product.stock}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-xl">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-5 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-xl">−</span>
                        </button>
                        <span className="px-8 py-3 border-x border-gray-300 text-xl min-w-[100px] text-center font-medium">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(Math.min(product.stock, quantity + 1))
                          }
                          className="px-5 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-xl">+</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-600">Total</div>
                        <div className="text-sm text-gray-500">
                          Including VAT
                        </div>
                      </div>
                      <span className="text-3xl font-light text-gray-900">
                        {formatPrice(
                          (product.discountPrice || product.price) * quantity,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl text-lg font-medium transition-colors shadow-sm hover:shadow"
                    >
                      Add to Cart
                    </button>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, 3))}
                        className="py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Add 3
                      </button>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, 5))}
                        className="py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Add 5
                      </button>
                      <button
                        onClick={() => setQuantity(product.stock)}
                        className="py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Add All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                  {[
                    {
                      icon: Truck,
                      label: "Free Shipping",
                      desc: "2-3 business days",
                    },
                    {
                      icon: Shield,
                      label: "2-Year Warranty",
                      desc: "Full coverage",
                    },
                    {
                      icon: RefreshCw,
                      label: "30-Day Returns",
                      desc: "Easy process",
                    },
                    {
                      icon: Globe,
                      label: "Worldwide Delivery",
                      desc: "International",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <feature.icon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {feature.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {feature.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-red-100 rounded-full">
                    <Check className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-red-700 mb-3">
                  Out of Stock
                </h4>
                <p className="text-red-600 mb-6">
                  This product is currently unavailable
                </p>
                <button className="w-full py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                  Notify When Available
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
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
                <Loader />
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
                              <span className="text-xs text-gray-400">
                                Edited
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {(canEditComment(comment) ||
                        canDeleteComment(comment)) && (
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
                      <span>
                        Show {currentComments.length - 3} More Reviews
                      </span>
                      <ChevronDown className="h-5 w-5 ml-3 group-hover:translate-y-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
