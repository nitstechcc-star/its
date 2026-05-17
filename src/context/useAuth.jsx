import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse stored user:', e)
      }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    userRole: user?.role || 'officer',
    isAdmin: user?.role === 'admin' || user?.is_superuser,
    isOfficer: user?.role === 'officer',
    isJudiciary: user?.role === 'judiciary',
    isMinistry: user?.role === 'ministry',
    isNaTISAdmin: user?.role === 'natisadmin',
    isNampolAdmin: user?.role === 'nampoladmin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth

