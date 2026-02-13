import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductById } from "../redux/slices/product.slice";
import {
  fetchProductComments,
  fetchProductRatingSummary,
} from "../redux/slices/comment.slice";
import { checkInWishlist } from "../redux/slices/wishlist.slice";
import { ArrowLeft, Package } from "lucide-react";
import Loader from "../components/common/Loader";
import ProductMedia from "../components/ProductDetails/ProductMedia";
import ProductInfo from "../components/ProductDetails/ProductInfo";
import ProductComments from "../components/ProductDetails/ProductComments";
import SimilarProducts from "../components/ProductDetails/SimilarProducts";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, loading: productLoading } = useSelector(
    (state) => state.products,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistChecked, loading: wishlistLoading } = useSelector(
    (state) => state.wishlist,
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchProductComments({ productId: id }));
    dispatch(fetchProductRatingSummary(id));

    if (isAuthenticated && id) {
      dispatch(checkInWishlist(id));
    }
  }, [dispatch, id, isAuthenticated]);

  if (productLoading) return <Loader />;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-button hover:shadow-button-hover"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Full‑width main content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left column – Product Media */}
          <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-5 sm:p-6">
            <ProductMedia
              product={product}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor} // ✅ Added
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
            />
          </div>

          {/* Right column – Product Info */}
          <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-5 sm:p-6">
            <ProductInfo
              product={product}
              wishlistChecked={wishlistChecked}
              wishlistLoading={wishlistLoading}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
            />
          </div>

          {/* Left column (second row) – Similar Products */}
          <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-5 sm:p-6">
            <SimilarProducts productId={id} />
          </div>

          {/* Right column (second row) – Product Comments */}
          <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-5 sm:p-6">
            <ProductComments productId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
