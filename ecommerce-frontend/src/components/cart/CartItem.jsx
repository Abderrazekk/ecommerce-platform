import { useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "../../redux/slices/cart.slice";
import { formatPrice } from "../../utils/formatPrice";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      dispatch(
        updateQuantity({ productId: item.product, quantity: newQuantity }),
      );
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.product));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 mb-4">
      <div className="flex items-center gap-6">
        {/* Product Image */}
        <div className="relative flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {item.name}
          </h3>
          <p className="text-2xl font-bold text-primary-600">
            {formatPrice(item.price)}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50"
              disabled={item.quantity <= 1}
            >
              <FaMinus className="h-3 w-3 text-gray-600" />
            </button>
            <span className="w-12 text-center font-semibold text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <FaPlus className="h-3 w-3 text-gray-600" />
            </button>
          </div>

          {/* Subtotal */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Subtotal</p>
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="p-3 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          aria-label="Remove item"
        >
          <FaTrash className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
