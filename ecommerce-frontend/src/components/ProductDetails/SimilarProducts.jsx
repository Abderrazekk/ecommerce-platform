// ecommerce-frontend/src/components/ProductDetails/SimilarProducts.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSimilarProducts } from "../../redux/slices/product.slice";
import ProductCard from "../product/ProductCard";
import Loader from "../common/Loader";

const SimilarProducts = ({ productId }) => {
  const dispatch = useDispatch();
  const {
    similarProducts,
    similarProductsLoading,
    similarProductsError,
  } = useSelector((state) => state.products);

  useEffect(() => {
    if (productId) {
      dispatch(fetchSimilarProducts(productId));
    }
  }, [dispatch, productId]);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-medium text-gray-900">You might also like</h3>

      {similarProductsLoading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : similarProductsError ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            Unable to load similar products.
          </p>
        </div>
      ) : !similarProducts?.length ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No similar products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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