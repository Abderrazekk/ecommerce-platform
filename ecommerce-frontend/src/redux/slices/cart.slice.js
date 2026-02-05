import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

const loadCartItems = () => {
  try {
    const items = JSON.parse(localStorage.getItem("cartItems")) || [];
    // Ensure all cart items have shippingFee property
    return items.map((item) => ({
      ...item,
      shippingFee: item.shippingFee || 0,
    }));
  } catch (error) {
    console.error("Error loading cart items:", error);
    return [];
  }
};

const initialState = {
  cartItems: loadCartItems(),
  shippingAddress: JSON.parse(localStorage.getItem("shippingAddress")) || null,
  phone: localStorage.getItem("phone") || "",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      console.log("📦 Adding to cart:", {
        product: item.product,
        name: item.name,
        shippingFee: item.shippingFee,
        hasShippingFee: item.shippingFee !== undefined,
      });

      const existingItem = state.cartItems.find(
        (i) => i.product === item.product,
      );

      if (existingItem) {
        existingItem.quantity += item.quantity;
        toast.success("Product quantity updated in cart!");
      } else {
        // Ensure shippingFee is included
        state.cartItems.push({
          product: item.product,
          name: item.name,
          price: item.price,
          discountPrice: item.discountPrice || null,
          shippingFee: item.shippingFee || 0, // Default to 0 if not provided
          image: item.image,
          quantity: item.quantity,
        });
        toast.success("Product added to cart!");
      }

      // Save to localStorage
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));

      // Debug log
      console.log(
        "🛒 Cart items after adding:",
        state.cartItems.map((i) => ({
          name: i.name,
          shippingFee: i.shippingFee,
        })),
      );
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.product !== action.payload,
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      toast.success("Product removed from cart!");
    },

    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.product === productId);

      if (item && quantity > 0) {
        item.quantity = quantity;
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("shippingAddress", JSON.stringify(action.payload));
    },

    savePhone: (state, action) => {
      state.phone = action.payload;
      localStorage.setItem("phone", action.payload);
    },

    // NEW: Debug action to check cart items
    debugCart: (state) => {
      console.log("🔍 Cart Debug Info:");
      console.log("Total items:", state.cartItems.length);
      state.cartItems.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          name: item.name,
          productId: item.product,
          shippingFee: item.shippingFee,
          price: item.price,
        });
      });
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  saveShippingAddress,
  savePhone,
  debugCart,
} = cartSlice.actions;

export default cartSlice.reducer;
