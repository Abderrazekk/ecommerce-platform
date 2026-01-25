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
}

export default authService