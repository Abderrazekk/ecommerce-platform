// Hero.jsx (Public) – Full-width, responsive, e‑commerce style
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

  // Mobile detection (force slideshow on mobile)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Force slideshow on mobile
  const displayLayout =
    isMobile && hero?.images?.length ? "slideshow" : effectiveLayout;
  const isSlideshowMode = displayLayout === "slideshow";

  useEffect(() => {
    dispatch(fetchActiveHero());
  }, [dispatch]);

  // Timer management
  useEffect(() => {
    if (hero?.images?.length > 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

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
      <div className="h-[70vh] md:h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !hero) {
    // Fallback hero (unchanged)
    return (
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center md:text-left max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to{" "}
              <span className="text-white drop-shadow-lg">Shoppina</span>
            </h1>
            <p className="text-xl mb-8 text-primary-100 leading-relaxed">
              Discover amazing products at great prices. Shop the latest trends
              in electronics, fashion, home goods, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                Shop Now
                <svg
                  className="ml-3 w-5 h-5"
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
                className="inline-flex items-center justify-center border-2 border-white/30 text-white hover:bg-white/10 font-semibold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm"
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
    "top-left": "top-6 left-6 text-left",
    "top-center": "top-6 left-1/2 transform -translate-x-1/2 text-center",
    "top-right": "top-6 right-6 text-right",
    "center-left": "top-1/2 left-6 transform -translate-y-1/2 text-left",
    center:
      "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center",
    "center-right": "top-1/2 right-6 transform -translate-y-1/2 text-right",
    "bottom-left": "bottom-6 left-6 text-left",
    "bottom-center": "bottom-6 left-1/2 transform -translate-x-1/2 text-center",
    "bottom-right": "bottom-6 right-6 text-right",
  };

  // Text size classes
  const textSizeClasses = {
    small: "text-sm md:text-base",
    medium: "text-base md:text-lg",
    large: "text-lg md:text-xl lg:text-2xl",
  };

  // Render image with overlay for static layouts (unchanged)
  const renderImageWithOverlay = (image, index) => {
    return (
      <div
        key={`${image.public_id}-${index}`}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: 1, // static layouts always visible
          zIndex: 1,
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
        {/* Gradient overlay for image enhancement */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>

        {/* Text overlay */}
        {image.overlayText && (
          <div
            className={`absolute ${overlayPositionClasses[image.overlayPosition]} ${textSizeClasses[image.textSize]} font-semibold text-white drop-shadow-xl backdrop-blur-sm bg-black/20 px-4 py-2 rounded-xl pointer-events-none`}
            style={{ color: image.overlayColor || "#FFFFFF" }}
          >
            <p className="break-words">{image.overlayText}</p>
          </div>
        )}
      </div>
    );
  };

  // ---------- SLIDESHOW LAYOUT (dual‑layer desktop) ----------
  // Updated renderSlideshowLayout function – replace in your Hero.jsx

  // Updated renderSlideshowLayout function – replace in your Hero.jsx

  const renderSlideshowLayout = () => {
    // Desktop: full width, fixed height (even taller now), image covers, rounded bottom corners
    const renderDesktopSlide = (image, index) => (
      <div
        key={`desktop-${image.public_id}-${index}`}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: index === currentIndex ? 1 : 0,
          transition: `opacity ${hero.transitionSpeed || 1000}ms ease-in-out`,
          zIndex: index === currentIndex ? 1 : 0,
        }}
      >
        <img
          src={image.url}
          alt={`${hero.title} - ${index + 1}`}
          className="w-full h-full object-cover rounded-b-3xl lg:rounded-b-[4rem]"
          loading={index === 0 ? "eager" : "lazy"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-b-3xl lg:rounded-b-[4rem] pointer-events-none"></div>
        {image.overlayText && (
          <div
            className={`absolute ${overlayPositionClasses[image.overlayPosition]} ${textSizeClasses[image.textSize]} font-semibold text-white drop-shadow-xl z-10`}
            style={{ color: image.overlayColor || "#FFFFFF" }}
          >
            <p className="break-words max-w-xl px-6 py-3 rounded-xl backdrop-blur-sm bg-black/20">
              {image.overlayText}
            </p>
          </div>
        )}
      </div>
    );

    // Mobile: tall aspect ratio, full width, image covers, rounded bottom corners
    const renderMobileSlide = (image, index) => (
      <div
        key={`mobile-${image.public_id}-${index}`}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: index === currentIndex ? 1 : 0,
          transition: `opacity ${hero.transitionSpeed || 1000}ms ease-in-out`,
          zIndex: index === currentIndex ? 1 : 0,
        }}
      >
        <img
          src={image.url}
          alt={`${hero.title} - ${index + 1}`}
          className="w-full h-full object-cover rounded-b-3xl"
          loading={index === 0 ? "eager" : "lazy"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-b-3xl pointer-events-none"></div>
        {image.overlayText && (
          <div
            className={`absolute ${overlayPositionClasses[image.overlayPosition]} ${textSizeClasses[image.textSize]} font-semibold text-white drop-shadow-xl backdrop-blur-sm bg-black/20 px-4 py-2 rounded-xl pointer-events-none`}
            style={{ color: image.overlayColor || "#FFFFFF" }}
          >
            <p className="break-words">{image.overlayText}</p>
          </div>
        )}
      </div>
    );

    return (
      <div className="w-full">
        {/* Mobile version */}
        <div className="block md:hidden relative w-full aspect-[4/5] overflow-hidden">
          {hero.images.map((image, index) => renderMobileSlide(image, index))}
        </div>

        {/* Desktop version – taller height */}
        <div className="hidden md:block relative w-full h-[700px] lg:h-[800px] overflow-hidden">
          {hero.images.map((image, index) => renderDesktopSlide(image, index))}
        </div>
      </div>
    );
  };
  // ---------- STATIC LAYOUTS (unchanged, but with responsive image containers) ----------
  const renderStaticLayout = () => {
    const images = hero.images || [];

    // Base image container classes: taller on mobile, 16:9 on desktop
    const imageContainerClasses =
      "relative aspect-[4/5] md:aspect-video overflow-hidden";

    switch (displayLayout) {
      case "2-modern":
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-1">
            {images.map((image, index) => (
              <div key={index} className={imageContainerClasses}>
                {renderImageWithOverlay(image, index)}
              </div>
            ))}
          </div>
        );

      case "3-stacked":
        return (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-1">
            {/* Left large image */}
            <div className={`md:col-span-2 ${imageContainerClasses}`}>
              {images[0] && renderImageWithOverlay(images[0], 0)}
            </div>
            {/* Right stacked images */}
            <div className="grid grid-rows-2 gap-0 md:gap-1">
              {images.slice(1, 3).map((image, index) => (
                <div key={index + 1} className={imageContainerClasses}>
                  {renderImageWithOverlay(image, index + 1)}
                </div>
              ))}
            </div>
          </div>
        );

      case "4-grid":
        return (
          <div className="w-full grid grid-cols-2 md:grid-cols-2 gap-0 md:gap-1">
            {images.map((image, index) => (
              <div key={index} className={imageContainerClasses}>
                {renderImageWithOverlay(image, index)}
              </div>
            ))}
          </div>
        );

      case "5-dynamic":
        return (
          <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-0 md:gap-1">
            {/* First two images */}
            {images.slice(0, 2).map((image, index) => (
              <div key={index} className={imageContainerClasses}>
                {renderImageWithOverlay(image, index)}
              </div>
            ))}
            {/* Middle large image (spans two rows) */}
            {images[2] && (
              <div className={`row-span-2 ${imageContainerClasses}`}>
                {renderImageWithOverlay(images[2], 2)}
              </div>
            )}
            {/* Remaining images */}
            {images.slice(3).map((image, index) => (
              <div key={index + 3} className={imageContainerClasses}>
                {renderImageWithOverlay(image, index + 3)}
              </div>
            ))}
          </div>
        );

      case "6-stylish":
        return (
          <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-0 md:gap-1">
            {images.map((image, index) => (
              <div key={index} className={imageContainerClasses}>
                {renderImageWithOverlay(image, index)}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="w-full">
            <div className={imageContainerClasses}>
              {images[0] && renderImageWithOverlay(images[0], 0)}
            </div>
          </div>
        );
    }
  };

  // Navigation handlers (optional – can be used if you add controls)
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
    <Link to="/shop" className="block cursor-pointer">
      <div className="relative">
        {isSlideshowMode ? renderSlideshowLayout() : renderStaticLayout()}

        {/* Optional slideshow controls – uncomment if needed */}
        {/* {isSlideshowMode && hero.images.length > 1 && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center space-x-4 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                handlePrev();
              }}
              className="p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAutoRotateToggle();
              }}
              className="p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition"
            >
              {isAutoRotating ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
          </div>
        )} */}

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
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
    </Link>
  );
};

export default Hero;
