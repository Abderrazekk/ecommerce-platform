import { useTranslation } from "react-i18next";
import Hero from "../components/hero/Hero";
import FeaturedProducts from "../components/product/FeaturedProducts";
import Sponsors from "../components/sponsors/Sponsors";
import PromoBanner from "../components/promo/PromoBanner";

const Home = () => {
  const { t } = useTranslation("home");

  return (
    <div className="min-h-screen">
      <Hero />

      <div>
        <FeaturedProducts />
        <PromoBanner />
        <Sponsors />
      </div>

      {/* Premium Features Section */}
      <div className="relative bg-white py-20 lg:py-28 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Refined header with decorative elements */}
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-gray-900 mb-5">
              Premium Shopping
              <span className="font-semibold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent ml-2">
                Experience
              </span>
            </h2>
            <p className="text-gray-500 text-lg font-light leading-relaxed">
              Discover why thousands of discerning shoppers choose us for their
              premium shopping needs
            </p>
          </div>

          {/* Elegant feature cards - Centered content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Fast Delivery */}
            <div className="group text-center">
              {/* Icon with refined design */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary-500/5 blur-xl rounded-full scale-150 group-hover:bg-primary-500/10 transition-all duration-500" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-200/50 shadow-sm group-hover:scale-110 group-hover:border-primary-300 transition-all duration-500">
                  <svg
                    className="h-10 w-10 text-primary-600 group-hover:text-primary-700 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                {t("features.fastDelivery.title")}
              </h3>
              <p className="text-gray-500 text-base leading-relaxed font-light max-w-xs mx-auto">
                {t("features.fastDelivery.description")}
              </p>
            </div>

            {/* Secure Payment */}
            <div className="group text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary-500/5 blur-xl rounded-full scale-150 group-hover:bg-primary-500/10 transition-all duration-500" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-200/50 shadow-sm group-hover:scale-110 group-hover:border-primary-300 transition-all duration-500">
                  <svg
                    className="h-10 w-10 text-primary-600 group-hover:text-primary-700 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                {t("features.securePayment.title")}
              </h3>
              <p className="text-gray-500 text-base leading-relaxed font-light max-w-xs mx-auto">
                {t("features.securePayment.description")}
              </p>
            </div>

            {/* Easy Returns */}
            <div className="group text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary-500/5 blur-xl rounded-full scale-150 group-hover:bg-primary-500/10 transition-all duration-500" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-200/50 shadow-sm group-hover:scale-110 group-hover:border-primary-300 transition-all duration-500">
                  <svg
                    className="h-10 w-10 text-primary-600 group-hover:text-primary-700 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                {t("features.easyReturns.title")}
              </h3>
              <p className="text-gray-500 text-base leading-relaxed font-light max-w-xs mx-auto">
                {t("features.easyReturns.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
