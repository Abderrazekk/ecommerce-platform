import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchSimilarProducts } from "../../redux/slices/product.slice";
import ProductCard from "../product/ProductCard";
import Loader from "../common/Loader";

const SimilarProducts = ({ productId }) => {
  const { t } = useTranslation("productdetails");
  const dispatch = useDispatch();
  const { similarProducts, similarProductsLoading, similarProductsError } =
    useSelector((state) => state.products);

  useEffect(() => {
    if (productId) {
      dispatch(fetchSimilarProducts(productId));
    }
  }, [dispatch, productId]);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-medium text-gray-900">
        {t("similarProducts.title")}
      </h3>

      {similarProductsLoading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : similarProductsError ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">{t("similarProducts.error")}</p>
        </div>
      ) : !similarProducts?.length ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">{t("similarProducts.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {similarProducts.map((product) => (
            <div
              key={product._id}
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimilarProducts;
