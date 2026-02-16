import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchVisibleSponsors } from "../../redux/slices/sponsor.slice";
import Loader from "../common/Loader";

const Sponsors = () => {
  const { t } = useTranslation("sponsors");
  const dispatch = useDispatch();
  const { visibleSponsors, loading } = useSelector((state) => state.sponsors);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const setWidthRef = useRef(0); // width of one full set (including trailing margin)
  const isHoveringRef = useRef(false); // track hover state to pause animation

  useEffect(() => {
    dispatch(fetchVisibleSponsors());
  }, [dispatch]);

  useEffect(() => {
    if (!visibleSponsors.length || !containerRef.current) return;

    const container = containerRef.current;
    const children = container.children;
    const originalCount = visibleSponsors.length;

    // Compute the width of the first set by measuring the offsetLeft of the first duplicated item
    const computeSetWidth = () => {
      if (children.length > originalCount) {
        // offsetLeft works because the container has `will-change: transform` making it an offsetParent
        return children[originalCount].offsetLeft;
      }
      return 0;
    };

    // Initial calculation
    setWidthRef.current = computeSetWidth();

    // Use ResizeObserver to update setWidth when sizes change (e.g., images load, window resize)
    const resizeObserver = new ResizeObserver(() => {
      setWidthRef.current = computeSetWidth();
    });
    resizeObserver.observe(container);
    // Also observe each child to catch image load changes
    Array.from(children).forEach((child) => resizeObserver.observe(child));

    if (setWidthRef.current <= 0) return;

    let currentPosition = 0;
    const speed = 0.75; // pixels per frame

    const animate = () => {
      if (!isHoveringRef.current) {
        currentPosition -= speed;

        // Reset when we've scrolled exactly one set width (with a tiny tolerance for floating points)
        if (Math.abs(currentPosition) >= setWidthRef.current - 0.5) {
          currentPosition += setWidthRef.current;
        }

        container.style.transform = `translateX(${currentPosition}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Hover pause
    const onMouseEnter = () => {
      isHoveringRef.current = true;
    };
    const onMouseLeave = () => {
      isHoveringRef.current = false;
    };
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
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

  // Three copies guarantee a seamless loop
  const displayItems = [
    ...visibleSponsors,
    ...visibleSponsors,
    ...visibleSponsors,
  ];

  return (
    <div className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50 w-full overflow-hidden">
      {/* Header */}
      <div className="w-full text-center mb-12 lg:mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {t("title")}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Scrolling container */}
      <div className="relative overflow-hidden w-full">
        {/* Gradient fade edges – always visible */}
        <div className="absolute inset-y-0 left-0 w-32 lg:w-64 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 lg:w-64 bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none" />

        <div
          ref={containerRef}
          className="flex items-center space-x-8 lg:space-x-16 xl:space-x-20 py-6 will-change-transform px-8 lg:px-12"
          style={{ willChange: "transform" }}
        >
          {displayItems.map((sponsor, index) => (
            <div
              key={`${sponsor._id}-${index}`}
              className="flex-shrink-0 relative"
            >
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-100 hover:-translate-y-2">
                <div className="relative w-48 h-24 lg:w-64 lg:h-32 xl:w-72 xl:h-36 overflow-hidden rounded-xl">
                  <img
                    src={sponsor.image?.url || ""}
                    alt={sponsor.name || t("altText")}
                    className="w-full h-full object-contain transition-transform duration-700 hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f9fafb'/%3E%3Ctext x='50' y='50' font-size='14' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Inter'%3E" +
                        encodeURIComponent(t("brandFallback")) +
                        "%3C/text%3E%3C/svg%3E";
                    }}
                  />
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
