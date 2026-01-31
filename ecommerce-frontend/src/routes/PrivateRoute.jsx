import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user is banned (should be caught by API interceptor, but just in case)
  if (user?.isBanned) {
    return <Navigate to="/login?message=Your account has been banned" replace />
  }

  // Check for admin-only routes
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute