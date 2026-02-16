import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ProductCard from "./ProductCard";
import productService from "../../services/product.service";
import Loader from "../common/Loader";

const OnSaleProducts = ({ limit = 8 }) => {
  const { t } = useTranslation("home");
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
    <section className="relative py-16 md:py-10 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            {t("onSale.title", "On Sale")}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t(
              "onSale.description",
              "Discover our handpicked selection of premium products on special discount.",
            )}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
