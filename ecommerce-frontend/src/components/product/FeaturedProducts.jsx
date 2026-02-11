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
    dispatch(fetchFeaturedProducts({ limit: 8 }));
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
    <div className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header Section */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-full mb-6">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">
              Premium Selection
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Products Grid */}
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-6 shadow-sm">
              <svg
                className="w-10 h-10 text-gray-400"
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
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              {t("noProducts.title")}
            </h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              {t("noProducts.message")}
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="mt-16 lg:mt-20 text-center">
          <a
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold rounded-xl text-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            View All Products
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
          </a>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
