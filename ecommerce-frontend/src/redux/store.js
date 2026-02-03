import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import productReducer from "./slices/product.slice";
import cartReducer from "./slices/cart.slice";
import orderReducer from "./slices/order.slice";
import heroReducer from "./slices/hero.slice";
import commentReducer from "./slices/comment.slice";
import adminReducer from "./slices/admin.slice";
import wishlistReducer from "./slices/wishlist.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    hero: heroReducer,
    comments: commentReducer,
    admin: adminReducer,
    wishlist: wishlistReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Keep this false to handle Dates in comments
    }),
});