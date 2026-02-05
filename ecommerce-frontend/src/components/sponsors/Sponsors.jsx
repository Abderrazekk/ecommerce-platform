// File: e-commerce-frontend/src/components/sponsors/Sponsors.jsx
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchVisibleSponsors } from "../../redux/slices/sponsor.slice";
import Loader from "../common/Loader";

const Sponsors = () => {
  const dispatch = useDispatch();
  const { visibleSponsors, loading } = useSelector((state) => state.sponsors);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    dispatch(fetchVisibleSponsors());
  }, [dispatch]);

  useEffect(() => {
    if (
      !visibleSponsors.length ||
      visibleSponsors.length <= 2 ||
      !containerRef.current
    )
      return;

    const container = containerRef.current;
    let animationId;
    let currentPosition = 0;
    const speed = 0.75;

    const animate = () => {
      currentPosition -= speed;

      // Get container width
      const containerWidth = container.scrollWidth;

      // Reset position when scrolled past container width
      if (Math.abs(currentPosition) >= containerWidth) {
        currentPosition = 0;
      }

      container.style.transform = `translateX(${currentPosition}px)`;
      animationId = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (containerRef.current) {
        containerRef.current.style.transform = "translateX(0)";
      }
    };
  }, [visibleSponsors]);

  if (loading) {
    return (
      <div className="py-8">
        <Loader />
      </div>
    );
  }

  if (!visibleSponsors || visibleSponsors.length === 0) {
    return null;
  }

  // Duplicate items for seamless scrolling when more than 2 sponsors
  const displayItems =
    visibleSponsors.length > 2
      ? [...visibleSponsors, ...visibleSponsors, ...visibleSponsors] // Triple for seamless effect
      : visibleSponsors;

  return (
    // Full width container - no max-width restriction on large screens
    <div className="py-8 bg-gradient-to-b from-gray-50 to-white w-full">
      {/* Text content container - still centered but full width background */}
      <div className="w-full text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Trusted by Top Brands
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We partner with industry leaders to bring you the best products
        </p>
      </div>

      {/* Sponsors container - full width */}
      <div className="relative overflow-hidden w-full">
        {/* Gradient fade edges for smooth appearance - only show when scrolling */}
        {visibleSponsors.length > 2 && (
          <>
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          </>
        )}

        <div
          ref={visibleSponsors.length > 2 ? containerRef : null}
          className={`flex items-center space-x-8 lg:space-x-12 py-4 ${
            visibleSponsors.length > 2
              ? "will-change-transform px-8"
              : "justify-center px-4 sm:px-6 lg:px-8"
          }`}
          style={visibleSponsors.length > 2 ? { willChange: "transform" } : {}}
        >
          {displayItems.map((sponsor, index) => (
            <SponsorItem key={`${sponsor._id}-${index}`} sponsor={sponsor} />
          ))}
        </div>
      </div>
    </div>
  );
};

// SponsorItem component - With rounded corners
const SponsorItem = ({ sponsor }) => (
  <div className="flex-shrink-0 relative w-64 h-32 md:w-72 md:h-36 lg:w-80 lg:h-40 xl:w-96 xl:h-48">
    {/* Sponsor Image - Simple display with rounded corners */}
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <img
        src={sponsor.image.url}
        alt={sponsor.name || "Sponsor"}
        className="w-full h-full object-contain"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-size='14' text-anchor='middle' dy='.3em' fill='%236b7280'%3EBrand%3C/text%3E%3C/svg%3E";
        }}
      />
    </div>
  </div>
);

export default Sponsors;
