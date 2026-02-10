// ecommerce-frontend/src/pages/ProductDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProductById } from "../redux/slices/product.slice";
import {
  fetchProductComments,
  addComment,
  editComment,
  removeComment,
  fetchProductRatingSummary,
} from "../redux/slices/comment.slice";
import { checkInWishlist } from "../redux/slices/wishlist.slice";
import { ArrowLeft, CheckCircle, Package } from "lucide-react";
import Loader from "../components/common/Loader";
import ProductMedia from "../components/ProductDetails/ProductMedia";
import ProductInfo from "../components/ProductDetails/ProductInfo";
import ProductComments from "../components/ProductDetails/ProductComments";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, loading: productLoading } = useSelector(
    (state) => state.products,
  );
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const {
    commentsByProduct,
    loading: commentsLoading,
    submitting,
    error,
  } = useSelector((state) => state.comments);
  const { wishlistChecked, loading: wishlistLoading } = useSelector(
    (state) => state.wishlist,
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

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
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Share Success Toast */}
      {copySuccess && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="font-medium">Link copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* Subtle Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors mr-3">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="font-medium">Back to Collection</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Media */}
          <div>
            <ProductMedia
              product={product}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
            />
          </div>

          {/* Right Column - Product Details */}
          <div>
            <ProductInfo
              product={product}
              user={user}
              isAuthenticated={isAuthenticated}
              wishlistChecked={wishlistChecked}
              wishlistLoading={wishlistLoading}
              quantity={quantity}
              setQuantity={setQuantity}
              dispatch={dispatch}
              navigate={navigate}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <ProductComments
          commentsByProduct={commentsByProduct}
          id={id}
          user={user}
          isAuthenticated={isAuthenticated}
          commentsLoading={commentsLoading}
          submitting={submitting}
          error={error}
          dispatch={dispatch}
          navigate={navigate}
          addComment={addComment}
          editComment={editComment}
          removeComment={removeComment}
          fetchProductComments={fetchProductComments}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
