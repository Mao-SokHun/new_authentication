import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'

const AuthLoading = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div
      className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"
      aria-hidden
    />
  </div>
)

/**
 * Wraps routes that require authentication and/or a specific role.
 *
 * Props:
 *   role        'student' | 'teacher' | 'admin' | null
 *               null = any authenticated user may access
 *
 * Behaviour:
 *   - Not logged in + admin route      → /admin/login
 *   - Not logged in + other route      → /login
 *   - Wrong role (non-admin route)     → redirect to own home
 *   - Admin trying student/teacher     → /admin
 *   - Correct role                     → render children
 */
const ProtectedRoute = ({ role, children }) => {
  const { user, loading } = useAuth()

  if (loading) return <AuthLoading />

  if (!user) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />
  }

  // Admin trying to access non-admin areas
  if (user.role === 'admin' && role !== 'admin' && role !== null) {
    return <Navigate to="/admin" replace />
  }

  // Student/teacher trying to access admin
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  // Student trying to access teacher routes or vice-versa
  if (role && role !== 'admin' && user.role !== role) {
    if (user.role === 'teacher') return <Navigate to="/teacher/home" replace />
    if (user.role === 'admin')   return <Navigate to="/admin" replace />
    return <Navigate to="/home" replace />
  }

  return children
}

export default ProtectedRoute
