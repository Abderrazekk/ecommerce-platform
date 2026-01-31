import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchActiveHero } from "../../redux/slices/hero.slice";
import Loader from "../common/Loader";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const Hero = () => {
  const dispatch = useDispatch();
  const { hero, loading, error } = useSelector((state) => state.hero);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const timerRef = useRef(null);

  // Calculate layout variables
  const effectiveLayout = hero
    ? hero.effectiveLayout ||
      (hero.images?.length === 2
        ? "2-modern"
        : hero.images?.length === 3
          ? "3-stacked"
          : hero.images?.length === 4
            ? "4-grid"
            : hero.images?.length === 5
              ? "5-dynamic"
              : hero.images?.length === 6
                ? "6-stylish"
                : "slideshow")
    : "slideshow";

  const isSlideshowMode = effectiveLayout === "slideshow";

  useEffect(() => {
    dispatch(fetchActiveHero());
  }, [dispatch]);

  // Timer management effect
  useEffect(() => {
    if (hero?.images?.length > 0) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Start auto-rotation if enabled or in slideshow mode
      if ((hero.autoRotate && isAutoRotating) || isSlideshowMode) {
        const intervalTime = hero.rotationInterval || 5000;

        timerRef.current = setInterval(() => {
          setCurrentIndex((prevIndex) => {
            return (prevIndex + 1) % hero.images.length;
          });
        }, intervalTime);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hero, isAutoRotating, isSlideshowMode]);

  // Reset currentIndex when hero changes
  useEffect(() => {
    if (hero) {
      setCurrentIndex(0);
      setIsInitialLoad(true);

      const timeout = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [hero]);

  // Restart timer after manual navigation
  useEffect(() => {
    if (isAutoRotating && hero?.images?.length > 1 && isSlideshowMode) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const intervalTime = hero.rotationInterval || 5000;
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % hero.images.length);
      }, intervalTime);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, isAutoRotating, hero, isSlideshowMode]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-gray-100">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !hero) {
    return (
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center md:text-left max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to E-Shop
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Discover amazing products at great prices. Shop the latest trends
              in electronics, fashion, home goods, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="inline-block bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Shop Now
              </Link>
              <Link
                to="/about"
                className="inline-block border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overlay position classes
  const overlayPositionClasses = {
    "top-left": "top-4 left-4 text-left",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2 text-center",
    "top-right": "top-4 right-4 text-right",
    "center-left": "top-1/2 left-4 transform -translate-y-1/2 text-left",
    center:
      "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center",
    "center-right": "top-1/2 right-4 transform -translate-y-1/2 text-right",
    "bottom-left": "bottom-4 left-4 text-left",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2 text-center",
    "bottom-right": "bottom-4 right-4 text-right",
  };

  // Text size classes
  const textSizeClasses = {
    small: "text-sm md:text-base",
    medium: "text-base md:text-lg",
    large: "text-lg md:text-xl lg:text-2xl",
  };

  // Render image with overlay
  const renderImageWithOverlay = (image, index) => {
    return (
      <div
        key={`${image.public_id}-${index}`}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: isSlideshowMode ? (index === currentIndex ? 1 : 0) : 1,
          transition: `opacity ${hero.transitionSpeed || 1000}ms ease-in-out`,
          zIndex: isSlideshowMode ? (index === currentIndex ? 1 : 0) : 1,
        }}
      >
        <img
          src={image.url}
          alt={`${hero.title} - ${index + 1}`}
          className="w-full h-full object-cover"
          loading={index === 0 ? "eager" : "lazy"}
          onError={(e) => {
            console.error(`Failed to load image: ${image.url}`);
            e.target.style.backgroundColor = "#f3f4f6";
          }}
        />
        {/* Gradient Overlay for image - this is only for image enhancement */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none"></div>

        {/* Text Overlay for image (per image overlay) */}
        {image.overlayText && (
          <div
            className={`absolute ${overlayPositionClasses[image.overlayPosition]} ${textSizeClasses[image.textSize]} font-semibold text-white drop-shadow-lg max-w-[80%] pointer-events-none`}
            style={{ color: image.overlayColor || "#FFFFFF" }}
          >
            <p className="break-words">{image.overlayText}</p>
          </div>
        )}
      </div>
    );
  };

  // Render slideshow layout
  const renderSlideshowLayout = () => {
    return (
      <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        {hero.images.map((image, index) =>
          renderImageWithOverlay(image, index),
        )}
      </div>
    );
  };

  // Render static layouts
  const renderStaticLayout = () => {
    const images = hero.images || [];

    switch (effectiveLayout) {
      case "2-modern":
        return (
          <div className="h-[70vh] md:h-[80vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative h-full overflow-hidden rounded-lg"
                >
                  {renderImageWithOverlay(image, index)}
                </div>
              ))}
            </div>
          </div>
        );

      case "3-stacked":
        return (
          <div className="h-[70vh] md:h-[80vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              <div className="md:col-span-2 h-full">
                <div className="relative h-full overflow-hidden rounded-lg">
                  {images[0] && renderImageWithOverlay(images[0], 0)}
                </div>
              </div>
              <div className="grid grid-rows-2 gap-4 h-full">
                {images.slice(1, 3).map((image, index) => (
                  <div
                    key={index + 1}
                    className="relative overflow-hidden rounded-lg"
                  >
                    {renderImageWithOverlay(image, index + 1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "4-grid":
        return (
          <div className="h-[70vh] md:h-[80vh]">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 h-full">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg"
                >
                  {renderImageWithOverlay(image, index)}
                </div>
              ))}
            </div>
          </div>
        );

      case "5-dynamic":
        return (
          <div className="h-[70vh] md:h-[80vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
              {images.slice(0, 2).map((image, index) => (
                <div key={index} className="md:col-span-1 h-full">
                  <div className="relative h-full overflow-hidden rounded-lg">
                    {renderImageWithOverlay(image, index)}
                  </div>
                </div>
              ))}
              {images[2] && (
                <div className="md:col-span-1 row-span-2">
                  <div className="relative h-full overflow-hidden rounded-lg">
                    {renderImageWithOverlay(images[2], 2)}
                  </div>
                </div>
              )}
              {images.slice(3).map((image, index) => (
                <div key={index + 3} className="md:col-span-1 h-full">
                  <div className="relative h-full overflow-hidden rounded-lg">
                    {renderImageWithOverlay(image, index + 3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "6-stylish":
        return (
          <div className="h-[70vh] md:h-[80vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg"
                >
                  {renderImageWithOverlay(image, index)}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="h-[70vh] md:h-[80vh]">
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              {images[0] && renderImageWithOverlay(images[0], 0)}
            </div>
          </div>
        );
    }
  };

  const handlePrev = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCurrentIndex((prev) => (prev === 0 ? hero.images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCurrentIndex((prev) => (prev === hero.images.length - 1 ? 0 : prev + 1));
  };

  const handleAutoRotateToggle = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  return (
    <div className="relative">
      {isSlideshowMode ? renderSlideshowLayout() : renderStaticLayout()}

      {/* Hero Content Overlay - This contains the title, subtitle, and buttons */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fadeInUp drop-shadow-lg">
              {hero.title}
            </h1>
            {hero.subtitle && (
              <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-gray-100 animate-fadeInUp animation-delay-200 drop-shadow-lg">
                {hero.subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp animation-delay-400">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Shop Now
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Learn More
              </Link>
            </div>
            <div className="mt-8 flex items-center space-x-4 text-sm">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full drop-shadow-md">
                {hero.season.charAt(0).toUpperCase() + hero.season.slice(1)}{" "}
                Collection
              </span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes timer {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
};

export default Hero;
