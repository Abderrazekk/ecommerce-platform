import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSimilarProducts } from '../../redux/slices/product.slice';
import ProductCard from '../product/ProductCard';
import Loader from '../common/Loader';

const SimilarProducts = ({ productId }) => {
  const dispatch = useDispatch();
  const {
    similarProducts,
    similarProductsLoading,
    similarProductsError
  } = useSelector((state) => state.products);

  useEffect(() => {
    if (productId) {
      dispatch(fetchSimilarProducts(productId));
    }
  }, [dispatch, productId]);

  // ✅ Don't show anything while loading (prevents layout shift)
  if (similarProductsLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader />
      </div>
    );
  }

  // ✅ Silent fail – no error toast, just hide the section
  if (similarProductsError || !similarProducts?.length) {
    return null;
  }

  return (
    <section className="mt-20">
      <h2 className="text-2xl font-light text-gray-900 mb-8">
        You might also like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {similarProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;