import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import authService from '../services/auth.service'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  AlertTriangle,
  Edit2,
  Save,
  X,
  Lock,
  Package,
  Heart,
  CreditCard
} from 'lucide-react'

const ProfilePage = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const { user: currentUser } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await authService.getProfile()
      setUserData(response.data.user)
      setEditForm({
        name: response.data.user.name,
        phone: response.data.user.phone || '',
        address: response.data.user.address || ''
      })
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = () => {
    if (editing) {
      // Reset form
      setEditForm({
        name: userData.name,
        phone: userData.phone || '',
        address: userData.address || ''
      })
    }
    setEditing(!editing)
  }

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveProfile = async () => {
    try {
      const response = await authService.updateProfile(editForm)
      setUserData(response.data.user)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const getMembershipDuration = () => {
    if (!userData?.createdAt) return 'N/A'
    const joinDate = new Date(userData.createdAt)
    const now = new Date()
    const diffTime = Math.abs(now - joinDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${diffDays} days`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
    return `${Math.floor(diffDays / 365)} years`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <p className="text-gray-600 mt-2">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Status Card */}
            {userData.isBanned ? (
              <div className="bg-white rounded-lg shadow-lg border-l-4 border-red-500 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                    <div>
                      <h3 className="text-xl font-bold text-red-700">Account Banned</h3>
                      <p className="text-red-600">Your account has been suspended</p>
                    </div>
                  </div>
                  
                  {userData.banReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-red-800 mb-2">Ban Reason:</h4>
                      <p className="text-red-700">{userData.banReason}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {userData.bannedAt && (
                      <div>
                        <span className="font-medium text-gray-700">Banned on:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(userData.bannedAt).toLocaleDateString()} at{' '}
                          {new Date(userData.bannedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    
                    {userData.bannedBy && (
                      <div>
                        <span className="font-medium text-gray-700">Banned by:</span>
                        <span className="ml-2 text-gray-900">
                          {userData.bannedBy.name} ({userData.bannedBy.email})
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-red-700 text-sm">
                      <strong>Note:</strong> If you believe this ban was made in error, please contact our support team.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Account Active</h3>
                    <p className="text-green-100">Your account is in good standing</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>
              </div>
            )}

            {/* Profile Information Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center px-4 py-2 rounded-md ${editing ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
                >
                  {editing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{userData.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{userData.email}</span>
                      <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-md">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{userData.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Role
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <Shield className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900 capitalize">{userData.role}</span>
                      <span className={`ml-auto text-xs px-2 py-1 rounded ${userData.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {userData.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address
                  </label>
                  {editing ? (
                    <textarea
                      name="address"
                      value={editForm.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="123 Main St, City, Country, ZIP Code"
                    />
                  ) : (
                    <div className="flex items-start p-3 bg-gray-50 rounded-md">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                      <span className="text-gray-900">{userData.address || 'No address saved'}</span>
                    </div>
                  )}
                </div>

                {editing && (
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Orders</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getMembershipDuration()}
                  </div>
                  <div className="text-sm text-gray-600">Member for</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {userData.isBanned ? 'Banned' : 'Active'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Details */}
          <div className="space-y-8">
            {/* Account Details Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Account ID</div>
                  <div className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">
                    {userData.id}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Member Since</div>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{new Date(userData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{new Date(userData.updatedAt || userData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Change Password</span>
                  </div>
                  <span>→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Payment Methods</span>
                  </div>
                  <span>→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-3" />
                    <span>Order History</span>
                  </div>
                  <span>→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-gray-400 mr-3" />
                    <span>My Wishlist</span>
                  </div>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Security Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Password Strength</span>
                  <span className="text-sm font-medium text-green-600">Strong</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">2FA Enabled</span>
                  <span className="text-sm font-medium text-red-600">No</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Login Activity</span>
                  <span className="text-sm font-medium text-blue-600">View</span>
                </div>
              </div>
              <button className="w-full mt-6 px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors">
                Report Suspicious Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage