import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/order.slice'
import { formatPrice } from '../../utils/formatPrice'
import Loader from '../../components/common/Loader'
import { toast } from 'react-hot-toast'
import { 
  Package, 
  Eye, 
  RefreshCw, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Edit
} from 'lucide-react'

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

const Orders = () => {
  const dispatch = useDispatch()
  const { orders, loading } = useSelector((state) => state.orders)
  
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchAllOrders())
  }, [dispatch])

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to update order status to "${newStatus}"?`)) {
      try {
        setStatusUpdateLoading(true)
        await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap()
        toast.success('Order status updated successfully!')
        
        // Refresh orders list
        dispatch(fetchAllOrders())
      } catch (error) {
        toast.error('Failed to update order status')
      } finally {
        setStatusUpdateLoading(false)
      }
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleUpdateStatusInModal = async (newStatus) => {
    if (!selectedOrder) return
    
    try {
      setStatusUpdateLoading(true)
      await dispatch(updateOrderStatus({ id: selectedOrder._id, status: newStatus })).unwrap()
      toast.success('Order status updated successfully!')
      
      // Update local state
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus
      })
      
      // Refresh orders list
      dispatch(fetchAllOrders())
    } catch (error) {
      toast.error('Failed to update order status')
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-blue-600" />
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status)
    return option ? option.color : 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-mono text-sm">#{order._id.slice(-8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{order.user?.name}</div>
                        <div className="text-sm text-gray-500">{order.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                          {statusOptions.find(s => s.value === order.status)?.label || order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Order Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={statusUpdateLoading}
                          className={`text-sm px-3 py-1 rounded-lg font-medium ${
                            statusOptions.find(s => s.value === order.status)?.color || 'bg-gray-100'
                          } border-0 focus:ring-2 focus:ring-primary-500 disabled:opacity-50`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found.</p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Details
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="col-span-2">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Package className="h-6 w-6 text-gray-400 mr-2" />
                          <h3 className="text-lg font-semibold">
                            Order #{selectedOrder._id.slice(-8)}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedOrder.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {statusOptions.find(s => s.value === selectedOrder.status)?.label || selectedOrder.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Placed: {formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-semibold">Total: {formatPrice(selectedOrder.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Section */}
                  <div className="bg-primary-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Edit className="h-5 w-5 mr-2" />
                      Update Status
                    </h3>
                    <div className="space-y-3">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleUpdateStatusInModal(option.value)}
                          disabled={selectedOrder.status === option.value || statusUpdateLoading}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                            selectedOrder.status === option.value
                              ? `${option.color} cursor-not-allowed`
                              : 'bg-white hover:bg-gray-100 border border-gray-200'
                          } disabled:opacity-50`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {selectedOrder.status === option.value && (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white border rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium">Name:</span>
                        <span className="ml-2">{selectedOrder.user?.name}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium">Email:</span>
                        <span className="ml-2 text-blue-600">{selectedOrder.user?.email}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium">Phone:</span>
                        <span className="ml-2">{selectedOrder.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                        <div>
                          <span className="font-medium">Delivery Address:</span>
                          <p className="text-gray-600 mt-1">{selectedOrder.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center border-b pb-4 last:border-0">
                        <div className="h-20 w-20 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover rounded"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Price: {formatPrice(item.price)} each</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-sm text-gray-500">Subtotal</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Order Summary */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">{formatPrice(selectedOrder.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      <div className="flex justify-between items-center mt-4 text-lg font-bold">
                        <span>Total Amount:</span>
                        <span className="text-primary-600">{formatPrice(selectedOrder.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Payment Information</h4>
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">COD</span>
                      </div>
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Paid: {selectedOrder.isPaid ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Order Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm">Order Created: {formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                        <div className="flex items-center">
                          <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-sm">Last Updated: {formatDate(selectedOrder.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Add functionality for printing or exporting order
                      window.print()
                    }}
                    className="btn-primary"
                  >
                    Print Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Status Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Order Status Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {statusOptions.map((status) => (
              <div key={status.value} className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${status.color.split(' ')[0]}`}></span>
                <span>{status.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders