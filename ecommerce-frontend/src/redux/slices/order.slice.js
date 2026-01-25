import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import orderService from '../../services/order.service'
import { toast } from 'react-hot-toast'

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData)
      toast.success('Order placed successfully!')
      return response.data.order
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getMyOrders()
      return response.data.orders
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getAllOrders()
      return response.data.orders
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(id, status)
      toast.success('Order status updated!')
      return response.data.order
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrder(id)
      return response.data.order
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch order')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

const initialState = {
  orders: [],
  myOrders: [],
  order: null,
  loading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = []
      state.myOrders = []
      state.order = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.order = action.payload
        state.myOrders.unshift(action.payload)
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch my orders
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrders = action.payload
      })
      // Fetch all orders (admin)
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.orders = action.payload
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        
        const myIndex = state.myOrders.findIndex(o => o._id === action.payload._id)
        if (myIndex !== -1) {
          state.myOrders[myIndex] = action.payload
        }
      })
      // Fetch order by ID
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.order = action.payload
      })
  },
})

export const { clearOrders } = orderSlice.actions
export default orderSlice.reducer