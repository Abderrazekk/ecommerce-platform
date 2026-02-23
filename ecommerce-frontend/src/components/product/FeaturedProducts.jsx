import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchFeaturedProducts } from "../../redux/slices/product.slice";
import ProductCard from "./ProductCard";
import Loader from "../common/Loader";

const FeaturedProducts = () => {
  const { t } = useTranslation("featured");
  const dispatch = useDispatch();
  const { featuredProducts, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts({ limit: 14 }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("loading.title")}
            </h2>
          </div>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50 min-h-screen w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-8 md:mb-12 lg:mb-16">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1 md:w-1.5 h-8 md:h-10 lg:h-12 bg-green-500 rounded-full"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                {t("title")}
              </h2>
            </div>
            <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 font-medium leading-relaxed pl-3 md:pl-5 lg:pl-6">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-20">
            <div className="inline-flex items-center justify-center w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-4 md:mb-6 shadow-sm">
              <svg
                className="w-8 md:w-10 h-8 md:h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg md:text-2xl font-semibold text-gray-800 mb-2 md:mb-3">
              {t("noProducts.title")}
            </h3>
            <p className="text-sm md:text-base lg:text-lg text-gray-500 max-w-md mx-auto px-4">
              {t("noProducts.message")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedProducts;
