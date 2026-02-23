import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ProductCard from "./ProductCard";
import productService from "../../services/product.service";
import Loader from "../common/Loader";

const OnSaleProducts = ({ limit = 12 }) => {
  // default changed to 12
  const { t } = useTranslation("featured");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOnSale = async () => {
      try {
        setLoading(true);
        const response = await productService.getOnSaleProducts(limit);
        setProducts(response.data.products);
      } catch (err) {
        console.error("Failed to fetch on‑sale products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOnSale();
  }, [limit]);

  if (loading) return <Loader />;
  if (error) return null;
  if (products.length === 0) return null;

  return (
    <section className="relative py-16 md:py-10 bg-white overflow-hidden min-h-screen flex flex-col justify-center">
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-left mb-8 md:mb-12 lg:mb-16">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1 md:w-1.5 h-8 md:h-10 lg:h-12 bg-green-500 rounded-full"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                {t("onSale.title")}
              </h2>
            </div>
            <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 font-medium leading-relaxed pl-3 md:pl-5 lg:pl-6">
              {t("onSale.subsubtitle")}
            </p>
          </div>
        </div>

        {/* Products Grid – responsive: 2 cols mobile, 3 sm, 4 md, 6 lg+ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {products.map((product, index) => (
            <div
              key={product._id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OnSaleProducts;
