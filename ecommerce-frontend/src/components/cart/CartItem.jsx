import { useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "../../redux/slices/cart.slice";
import { formatPrice } from "../../utils/formatPrice";
import { Minus, Plus, Trash2 } from "lucide-react";

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

  const price = item.discountPrice || item.price;
  const total = price * item.quantity;

  return (
    <div className="flex items-center py-4 border-b">
      <div className="h-20 w-20 flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover rounded"
        />
      </div>

      <div className="ml-4 flex-1">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500">{item.brand}</p>

        <div className="flex items-center mt-2">
          <div className="flex items-center border rounded">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="px-2 py-1 hover:bg-gray-100"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-4 py-1">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="px-2 py-1 hover:bg-gray-100"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="ml-4 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="text-right">
        <div className="font-semibold">{formatPrice(price)}</div>
        {item.discountPrice && (
          <div className="text-sm text-gray-500 line-through">
            {formatPrice(item.price)}
          </div>
        )}
        <div className="font-bold mt-2">{formatPrice(total)}</div>
      </div>
    </div>
  );
};

export default CartItem;
