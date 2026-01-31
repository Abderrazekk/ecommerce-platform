import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import authService from '../../services/auth.service'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Ban, 
  CheckCircle,
  Loader2,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  FileText,
  Eye,
  Calendar
} from 'lucide-react'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [banFilter, setBanFilter] = useState('all') // 'all', 'banned', 'unbanned'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banningUserId, setBanningUserId] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [banReason, setBanReason] = useState('')
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  })
  const [showUserDetails, setShowUserDetails] = useState(null)

  const { user: currentUser } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users whenever searchQuery, banFilter, or users change
  useEffect(() => {
    let result = users
    
    // Apply ban filter
    if (banFilter === 'banned') {
      result = result.filter(user => user.isBanned)
    } else if (banFilter === 'unbanned') {
      result = result.filter(user => !user.isBanned)
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query)) ||
        (user.address && user.address.toLowerCase().includes(query)) ||
        (user.banReason && user.banReason.toLowerCase().includes(query)) ||
        (user.role && user.role.toLowerCase().includes(query))
      )
    }
    
    setFilteredUsers(result)
  }, [users, searchQuery, banFilter])

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

  const handleBanUser = (user) => {
    setSelectedUser(user)
    setBanReason(user.banReason || '')
    setShowBanModal(true)
  }

  const handleToggleBan = async (userId, reason = null) => {
    const userToUpdate = users.find(user => user._id === userId)
    if (!userToUpdate) return

    // Prevent self-banning
    if (userId === currentUser._id) {
      toast.error('You cannot ban yourself')
      return
    }

    // Optimistic update for better UX
    const updatedUsers = users.map(user =>
      user._id === userId ? { 
        ...user, 
        isBanned: !user.isBanned,
        ...(reason && { banReason: reason }),
        ...(!user.isBanned && { bannedAt: new Date().toISOString() }),
        ...(user.isBanned && { banReason: null, bannedAt: null, bannedBy: null })
      } : user
    )
    setUsers(updatedUsers)
    setBanningUserId(userId)

    try {
      const response = await authService.toggleUserBan(userId, { banReason: reason })
      toast.success(response.data.message)
      
      // Update with server response for accuracy
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? response.data.user : user
        )
      )
      
      // Close modal if open
      if (showBanModal) {
        setShowBanModal(false)
        setBanReason('')
        setSelectedUser(null)
      }
    } catch (error) {
      // Revert on error
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, isBanned: userToUpdate.isBanned, banReason: userToUpdate.banReason } : user
        )
      )
      toast.error(error.response?.data?.message || 'Failed to update ban status')
    } finally {
      setBanningUserId(null)
    }
  }

  const handleUnbanUser = async (userId) => {
    const userToUpdate = users.find(user => user._id === userId)
    if (!userToUpdate) return

    // Prevent self-banning
    if (userId === currentUser._id) {
      toast.error('You cannot ban/unban yourself')
      return
    }

    // Optimistic update
    const updatedUsers = users.map(user =>
      user._id === userId ? { 
        ...user, 
        isBanned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null
      } : user
    )
    setUsers(updatedUsers)
    setBanningUserId(userId)

    try {
      const response = await authService.toggleUserBan(userId)
      toast.success(response.data.message)
      
      // Update with server response
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? response.data.user : user
        )
      )
    } catch (error) {
      // Revert on error
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { 
            ...user, 
            isBanned: userToUpdate.isBanned,
            banReason: userToUpdate.banReason,
            bannedAt: userToUpdate.bannedAt,
            bannedBy: userToUpdate.bannedBy
          } : user
        )
      )
      toast.error(error.response?.data?.message || 'Failed to update ban status')
    } finally {
      setBanningUserId(null)
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

  const handleSubmitBan = () => {
    if (!banReason.trim()) {
      toast.error('Please provide a ban reason')
      return
    }
    handleToggleBan(selectedUser._id, banReason)
  }

  const handleExportUsers = () => {
    const dataToExport = filteredUsers.map(user => ({
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Status: user.isBanned ? 'Banned' : 'Active',
      'Ban Reason': user.banReason || 'N/A',
      'Banned Date': user.bannedAt ? new Date(user.bannedAt).toLocaleDateString() : 'N/A',
      'Banned By': user.bannedBy?.name || 'N/A',
      Phone: user.phone || 'N/A',
      Address: user.address || 'N/A',
      'Joined Date': new Date(user.createdAt).toLocaleDateString(),
    }))

    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).map(value => 
        `"${String(value).replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Users exported successfully!')
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setBanFilter('all')
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.length
    const bannedUsers = users.filter(u => u.isBanned).length
    const activeUsers = totalUsers - bannedUsers
    
    return { totalUsers, bannedUsers, activeUsers }
  }, [users])

  const toggleUserDetails = (userId) => {
    setShowUserDetails(showUserDetails === userId ? null : userId)
  }

  const handleQuickBan = (reason, user) => {
    setSelectedUser(user)
    setBanReason(reason)
    handleToggleBan(user._id, reason)
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600">Manage users, search, filter, and create admin accounts</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Create Admin
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div 
            onClick={() => setBanFilter('all')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${banFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Total Users</div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="text-xs text-gray-500 mt-2">Click to filter</div>
          </div>
          
          <div 
            onClick={() => setBanFilter('unbanned')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${banFilter === 'unbanned' ? 'ring-2 ring-green-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Active Users</div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {stats.activeUsers}
            </div>
            <div className="text-xs text-gray-500 mt-2">Click to filter</div>
          </div>
          
          <div 
            onClick={() => setBanFilter('banned')}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${banFilter === 'banned' ? 'ring-2 ring-red-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Banned Users</div>
              <Ban className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">
              {stats.bannedUsers}
            </div>
            <div className="text-xs text-gray-500 mt-2">Click to filter</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Showing</div>
              <Filter className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {filteredUsers.length}
            </div>
            <div className="text-xs text-gray-500 mt-2">Filtered users</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name, email, phone, address, or role..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="relative">
                <select
                  value={banFilter}
                  onChange={(e) => setBanFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="unbanned">Active Only</option>
                  <option value="banned">Banned Only</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
              
              <button
                onClick={handleClearFilters}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Clear
              </button>
              
              <button
                onClick={handleExportUsers}
                disabled={filteredUsers.length === 0}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
          
          {/* Active filters indicator */}
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Search: "{searchQuery}"
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </span>
            )}
            {banFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Filter: {banFilter === 'banned' ? 'Banned Users' : 'Active Users'}
                <button 
                  onClick={() => setBanFilter('all')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length} of {users.length})
            </h2>
            {filteredUsers.length === 0 && (
              <p className="text-sm text-gray-500">No users match your search criteria</p>
            )}
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No users match "${searchQuery}". Try a different search term or clear filters.`
                : banFilter === 'banned' 
                  ? 'No banned users found'
                  : 'No users found in the system'
              }
            </p>
            {(searchQuery || banFilter !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div 
                key={user._id} 
                className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-200 ${
                  user.isBanned ? 'border-l-4 border-red-500 bg-red-50' : 'hover:shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${
                      user.role === 'admin' 
                        ? user.isBanned ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
                        : user.isBanned ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {user.isBanned ? (
                        <Ban className="h-6 w-6" />
                      ) : user.role === 'admin' ? (
                        <Shield className="h-6 w-6" />
                      ) : (
                        <Users className="h-6 w-6" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-lg">{user.name}</h3>
                        {user.isBanned && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                            BANNED
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.isBanned
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isBanned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleUserDetails(user._id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="View details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.address && (
                    <div className="flex items-start text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm line-clamp-2">{user.address}</span>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {showUserDetails === user._id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        {user.isBanned && user.bannedAt && (
                          <div className="flex items-center text-sm">
                            <Ban className="h-4 w-4 mr-2 text-red-400" />
                            <span>Banned: {new Date(user.bannedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {user.bannedBy && (
                          <div className="text-sm">
                            <span className="font-medium">Banned by: </span>
                            <span>{user.bannedBy.name || user.bannedBy.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {user.isBanned && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-red-800">Account Banned</div>
                          {user.banReason && (
                            <div className="text-sm text-red-700 mt-1">
                              <span className="font-semibold">Reason:</span> {user.banReason}
                            </div>
                          )}
                          {user.bannedAt && (
                            <div className="text-xs text-red-600 mt-2">
                              Banned on: {new Date(user.bannedAt).toLocaleDateString()}
                              {user.bannedBy && user.bannedBy.name && (
                                <span> by {user.bannedBy.name}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex space-x-2">
                    {user.isBanned ? (
                      <button
                        onClick={() => handleUnbanUser(user._id)}
                        disabled={banningUserId === user._id || user._id === currentUser?._id}
                        className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {banningUserId === user._id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unban
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBanUser(user)}
                        disabled={banningUserId === user._id || user._id === currentUser?._id}
                        className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination or Results Count */}
        <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold">{users.length}</span> users
          </div>
          {filteredUsers.length > 0 && (
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                Active
              </span>
              <span className="flex items-center">
                <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                Banned
              </span>
              <span className="flex items-center">
                <div className="h-3 w-3 bg-purple-500 rounded-full mr-2"></div>
                Admin
              </span>
            </div>
          )}
        </div>

        {/* Ban Reason Modal */}
        {showBanModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Ban User
                  </h2>
                  <button
                    onClick={() => {
                      setShowBanModal(false)
                      setBanReason('')
                      setSelectedUser(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <div className="font-medium text-yellow-800">Banning User: {selectedUser.name}</div>
                        <div className="text-sm text-yellow-700">{selectedUser.email}</div>
                        <div className="text-xs text-yellow-600 mt-1">
                          Role: {selectedUser.role} | Status: {selectedUser.isBanned ? 'Banned' : 'Active'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ban Reason *
                      <span className="text-xs text-gray-500 ml-2">(This will be visible to the user)</span>
                    </label>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter the reason for banning this user (e.g., Violation of terms, suspicious activity, etc.)"
                      required
                      autoFocus
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Provide a clear and specific reason for the ban. This will be displayed on the user's profile.
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Ban Reasons:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Violation of terms of service',
                        'Suspicious/fraudulent activity',
                        'Inappropriate content or behavior',
                        'Multiple policy violations',
                        'Spam or abusive behavior',
                        'Account sharing/selling'
                      ].map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => setBanReason(reason)}
                          className="text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">What happens when a user is banned?</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-start">
                        <Ban className="h-3 w-3 mr-2 mt-0.5 text-red-500" />
                        <span>Cannot log in to their account</span>
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="h-3 w-3 mr-2 mt-0.5 text-yellow-500" />
                        <span>Cannot access any protected API endpoints</span>
                      </li>
                      <li className="flex items-start">
                        <FileText className="h-3 w-3 mr-2 mt-0.5 text-blue-500" />
                        <span>Ban reason will be displayed on their profile</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBanModal(false)
                      setBanReason('')
                      setSelectedUser(null)
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitBan}
                    disabled={!banReason.trim() || banningUserId === selectedUser._id}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {banningUserId === selectedUser._id ? (
                      <>
                        <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                        Banning...
                      </>
                    ) : (
                      'Confirm Ban'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Admin Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create New Admin
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123 Main St, City, Country"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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