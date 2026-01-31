import api from './api'

const authService = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password })
  },
  
  register: (userData) => {
    return api.post('/auth/register', userData)
  },
  
  getProfile: () => {
    return api.get('/auth/profile')
  },
  
  createAdmin: (adminData) => {
    return api.post('/admin/users', adminData)
  },
  
  getAllUsers: () => {
    return api.get('/admin/users')
  },
  
  // Updated: Toggle user ban status with reason
  toggleUserBan: (userId, data = {}) => {
    return api.put(`/admin/users/${userId}/ban`, data)
  },
  
  // New: Update user profile
  updateProfile: (userData) => {
    return api.put('/auth/profile', userData)
  },
}

export default authService