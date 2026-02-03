// src/components/product/ProductMedia.jsx
import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";

const ProductMedia = ({ product, selectedImageIndex, setSelectedImageIndex }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Video states
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoVolume, setVideoVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [showVideoControls, setShowVideoControls] = useState(true);
  
  const imageContainerRef = useRef(null);
  const mainImageRef = useRef(null);
  const videoRef = useRef(null);
  const videoControlsTimeout = useRef(null);

  // Zoom functionality
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current || !mainImageRef.current || !product?.images || !imageLoaded) return;

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
    if (!imageContainerRef.current || !mainImageRef.current || !product?.images) return {};

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

  // Video controls
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
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
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

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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

  const zoomStyle = calculateZoomStyle();

  return (
    <div className="space-y-12">
      {/* Images Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">Gallery</h3>
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
          {isHovering && product.images && imageLoaded && product.images[selectedImageIndex] && (
            <div
              className="absolute pointer-events-none z-20 overflow-hidden rounded-full"
              style={{
                left: `${zoomStyle.lensPosition?.x || 0}px`,
                top: `${zoomStyle.lensPosition?.y || 0}px`,
                width: "200px",
                height: "200px",
                border: "2px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 0 40px rgba(255, 255, 255, 0.3)",
                backgroundImage: `url(${product.images[selectedImageIndex].url})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: zoomStyle.backgroundSize || "auto",
                backgroundPosition: zoomStyle.backgroundPosition || "0px 0px",
                transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          )}

          {/* Navigation & Controls */}
          {product.images && product.images.length > 1 && (
            <>
              <button
                onClick={() => {
                  setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
                  setIsHovering(false);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 group"
              >
                <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => {
                  setSelectedImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
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

      {/* Video Section */}
      {product.video && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Product Video</h3>
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
                      onChange={(e) => {
                        const volume = parseFloat(e.target.value);
                        setVideoVolume(volume);
                        setIsMuted(volume === 0);
                        if (videoRef.current) {
                          videoRef.current.volume = volume;
                        }
                      }}
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
  );
};

export default ProductMedia;