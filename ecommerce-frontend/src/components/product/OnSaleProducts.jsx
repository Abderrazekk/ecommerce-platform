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
  if (error) return null; // Silently fail – no section shown
  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          {t("onSale.title", "On Sale")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OnSaleProducts;
