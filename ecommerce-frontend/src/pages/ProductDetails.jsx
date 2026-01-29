import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductById } from "../redux/slices/product.slice";
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
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, loading } = useSelector((state) => state.products);
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

  useEffect(() => {
    dispatch(fetchProductById(id));
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

  // Handle mouse move for zoom
  const handleMouseMove = (e) => {
    if (
      !imageContainerRef.current ||
      !mainImageRef.current ||
      !product.images ||
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
    if (!imageContainerRef.current || !mainImageRef.current || !product.images)
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
      // When switching to video, stop any playing video
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

  if (loading) return <Loader />;

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
                          <ArrowLeft className="h-5 w-5" />
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
                          <ArrowLeft className="h-5 w-5 transform rotate-180" />
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

                    <button
                      onClick={handleAddToCart}
                      className="w-full flex items-center justify-center space-x-3 bg-primary-600 hover:bg-primary-700 text-white py-4 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <span>Add to Cart</span>
                    </button>

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
                  <button
                    onClick={() => {
                      // Add to wishlist or notify when back in stock
                    }}
                    className="w-full py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    Notify me when available
                  </button>
                </div>
              )}

              {/* Product Info Cards */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="p-1.5 bg-green-100 rounded-md mr-2">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <h4 className="font-semibold text-gray-800">
                      Free Shipping
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">On orders over $50</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="p-1.5 bg-blue-100 rounded-md mr-2">
                      <span className="text-blue-600 font-bold">↻</span>
                    </div>
                    <h4 className="font-semibold text-gray-800">
                      30-Day Returns
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">Easy return policy</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold mb-4 text-gray-800 text-lg">
                  Product Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium text-gray-800">
                      {product.brand || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-800">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images:</span>
                    <span className="font-medium text-gray-800">
                      {product.images?.length || 0} photos
                    </span>
                  </div>
                  {product.video && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Video:</span>
                      <span className="font-medium text-green-800">
                        ✅ Available
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Added:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${product.isVisible ? "text-green-600" : "text-red-600"}`}
                    >
                      {product.isVisible
                        ? "🟢 Visible in shop"
                        : "🔴 Hidden from shop"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
