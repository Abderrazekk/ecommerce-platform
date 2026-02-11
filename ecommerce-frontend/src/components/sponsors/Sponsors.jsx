import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchVisibleSponsors } from "../../redux/slices/sponsor.slice";
import Loader from "../common/Loader";

const Sponsors = () => {
  const { t } = useTranslation('sponsors');
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
      <div className="py-12">
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
    <div className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50 w-full overflow-hidden">
      {/* Text content container - still centered but full width background */}
      <div className="w-full text-center mb-12 lg:mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {t('title')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Sponsors container - full width */}
      <div className="relative overflow-hidden w-full">
        {/* Gradient fade edges for smooth appearance - only show when scrolling */}
        {visibleSponsors.length > 2 && (
          <>
            <div className="absolute inset-y-0 left-0 w-32 lg:w-64 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 lg:w-64 bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none" />
          </>
        )}

        <div
          ref={visibleSponsors.length > 2 ? containerRef : null}
          className={`flex items-center space-x-8 lg:space-x-16 xl:space-x-20 py-6 ${visibleSponsors.length > 2
              ? "will-change-transform px-8 lg:px-12"
              : "justify-center px-4 sm:px-6 lg:px-8"
            }`}
          style={visibleSponsors.length > 2 ? { willChange: "transform" } : {}}
        >
          {displayItems.map((sponsor, index) => (
            <div
              key={`${sponsor._id}-${index}`}
              className="flex-shrink-0 relative"
            >
              {/* Sponsor Card */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-100 hover:-translate-y-2">
                {/* Sponsor Image - Premium display with hover effects */}
                <div className="relative w-48 h-24 lg:w-64 lg:h-32 xl:w-72 xl:h-36 overflow-hidden rounded-xl">
                  <img
                    src={sponsor.image?.url || ""}
                    alt={sponsor.name || t('altText')}
                    className="w-full h-full object-contain transition-transform duration-700 hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f9fafb'/%3E%3Ctext x='50' y='50' font-size='14' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Inter'%3E" +
                        encodeURIComponent(t('brandFallback')) +
                        "%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sponsors;