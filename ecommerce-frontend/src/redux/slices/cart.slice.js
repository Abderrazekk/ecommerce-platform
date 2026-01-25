import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-hot-toast'

const initialState = {
  cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
  shippingAddress: JSON.parse(localStorage.getItem('shippingAddress')) || null,
  phone: localStorage.getItem('phone') || '',
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload
      const existingItem = state.cartItems.find(i => i.product === item.product)
      
      if (existingItem) {
        existingItem.quantity += item.quantity
        toast.success('Product quantity updated in cart!')
      } else {
        state.cartItems.push(item)
        toast.success('Product added to cart!')
      }
      
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
    },
    
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        item => item.product !== action.payload
      )
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
      toast.success('Product removed from cart!')
    },
    
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload
      const item = state.cartItems.find(i => i.product === productId)
      
      if (item && quantity > 0) {
        item.quantity = quantity
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
      }
    },
    
    clearCart: (state) => {
      state.cartItems = []
      localStorage.removeItem('cartItems')
    },
    
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload))
    },
    
    savePhone: (state, action) => {
      state.phone = action.payload
      localStorage.setItem('phone', action.payload)
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  saveShippingAddress,
  savePhone,
} = cartSlice.actions

export default cartSlice.reducer