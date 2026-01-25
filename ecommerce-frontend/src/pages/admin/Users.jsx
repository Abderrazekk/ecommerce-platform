import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import authService from '../../services/auth.service'
import { toast } from 'react-hot-toast'
import { Users, UserPlus, Shield, Mail, Phone, MapPin } from 'lucide-react'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await authService.getAllUsers()
      setUsers(response.data.users)
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    try {
      await authService.createAdmin(newAdmin)
      toast.success('Admin created successfully!')
      setShowCreateModal(false)
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
      })
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin')
    }
  }

  const handleInputChange = (e) => {
    setNewAdmin({
      ...newAdmin,
      [e.target.name]: e.target.value,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600">Manage users and create admin accounts</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Create Admin
          </button>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {user.role === 'admin' ? (
                      <Shield className="h-6 w-6" />
                    ) : (
                      <Users className="h-6 w-6" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                
                {user.address && (
                  <div className="flex items-start text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-1" />
                    <span className="text-sm">{user.address}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Create Admin Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Create New Admin
                </h2>
                
                <form onSubmit={handleCreateAdmin}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newAdmin.name}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newAdmin.email}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="admin@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={newAdmin.password}
                        onChange={handleInputChange}
                        required
                        minLength="6"
                        className="input-field"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={newAdmin.phone}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={newAdmin.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="input-field"
                        placeholder="123 Main St, City, Country"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Create Admin
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersPage