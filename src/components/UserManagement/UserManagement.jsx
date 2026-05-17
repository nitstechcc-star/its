import React, { useState, useEffect } from 'react'
import {
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Shield,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCircle2,
  Mail,
  X,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  Briefcase
} from 'lucide-react'
import { getUsers, deleteUser, registerUser } from '../../Axios'
import { useAuth } from '../../context/useAuth'

// Scale icon component
const Scale = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3v18" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    <path d="M17 5a3 3 0 0 1 0 6" />
    <path d="M7 19a3 3 0 0 1 0-6" />
  </svg>
)

// Role configurations
const roleConfigs = {
  admin: {
    label: 'Administrator',
    color: 'from-purple-500 to-purple-600',
    icon: Shield
  },
  natisadmin: {
    label: 'NaTIS Admin',
    color: 'from-teal-500 to-cyan-600',
    icon: Shield
  },
  nampoladmin: {
    label: 'Nampol Admin',
    color: 'from-yellow-500 to-orange-600',
    icon: Shield
  },
  judiciary: {
    label: 'Judiciary',
    color: 'from-amber-500 to-orange-600',
    icon: Scale
  },
  ministry: {
    label: 'Ministry',
    color: 'from-green-500 to-emerald-600',
    icon: Briefcase
  },
  officer: {
    label: 'Officer',
    color: 'from-blue-500 to-blue-600',
    icon: Shield
  }
}

export default function UserManagement() {
  const { isAdmin } = useAuth()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: isAdmin ? 'admin' : 'officer'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Check access
  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = localStorage.getItem('darkMode') === 'true' || document.documentElement.classList.contains('dark')
      setDarkMode(isDark)
    }
    window.addEventListener('storage', handleThemeChange)
    const observer = new MutationObserver(handleThemeChange)
    observer.observe(document.documentElement, { attributes: true })
    return () => {
      window.removeEventListener('storage', handleThemeChange)
      observer.disconnect()
    }
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const result = await getUsers()
      if (result.success) {
        setUsers(result.data || [])
      }
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Render access denied if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  // Determine available roles based on user type
  const availableRoles = isAdmin ? [
    { value: 'admin', label: 'Administrator' },
    { value: 'natisadmin', label: 'NaTIS Admin' },
    { value: 'nampoladmin', label: 'Nampol Admin' },
    { value: 'judiciary', label: 'Judiciary' },
    { value: 'ministry', label: 'Ministry' }
  ] : [
    { value: 'officer', label: 'Officer' }
  ]

  // Get all users from backend (exclude admin from display)
  const filteredUsers = users.filter(user =>
    user.role !== 'admin' && (
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormError('')
  }

  const validateForm = () => {
    if (!formData.username || !formData.password || !formData.email) {
      setFormError('All fields are required')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    setFormError('')

    try {
      const result = await registerUser(
        formData.username,
        formData.email,
        formData.password,
        formData.role
      )

      if (result.success) {
        setFormSuccess('User created successfully!')
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: isAdmin ? 'admin' : 'officer'
        })
        loadUsers()
        setTimeout(() => {
          setShowAddModal(false)
          setFormSuccess('')
        }, 1500)
      } else {
        setFormError(result.error?.error || result.error || 'Failed to create user')
      }
    } catch {
      setFormError('An error occurred while creating user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const result = await deleteUser(userId)
      if (result.success) {
        loadUsers()
        setShowDeleteConfirm(null)
      }
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  }

  const getRoleBadge = (role) => {
    const config = roleConfigs[role] || roleConfigs.admin
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${config.color} text-white`}>
        {config.label}
      </span>
    )
  }

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="flex items-center gap-1.5 text-sm text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Active
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1.5 text-sm text-red-400">
        <span className="w-2 h-2 rounded-full bg-red-400"></span>
        Inactive
      </span>
    )
  }

  // Stats
  const stats = [
    { title: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
    { title: 'Administrators', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
    { title: 'Judiciary', value: users.filter(u => u.role === 'judiciary').length, icon: Scale, color: 'text-amber-500', bgColor: 'bg-amber-500/20' },
    { title: 'Ministry', value: users.filter(u => u.role === 'ministry').length, icon: Briefcase, color: 'text-green-500', bgColor: 'bg-green-500/20' },
    { title: 'NaTIS Admin', value: users.filter(u => u.role === 'natisadmin').length, icon: Shield, color: 'text-teal-500', bgColor: 'bg-teal-500/20' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 bg-yellow-500 text-slate-900 text-sm font-bold rounded-lg shadow-lg flex items-center gap-2">
              <Shield className="w-4 h-4" /> ADMIN
            </span>
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-slate-300 text-sm">Manage system users and their roles</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25">
            <Plus className="w-5 h-5" /> Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`rounded-xl border p-4 backdrop-blur-sm ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{stat.title}</p>
                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className={`rounded-xl border overflow-hidden backdrop-blur-sm ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
        {/* Toolbar */}
        <div className={`p-4 border-b flex flex-col sm:flex-row gap-4 ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
            <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} className={`pl-10 pr-4 py-2.5 rounded-lg w-full ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} border focus:outline-none focus:ring-2 focus:ring-blue-500`} />
          </div>
          <div className="flex gap-2">
            <button onClick={loadUsers} className={`p-2.5 rounded-lg transition-colors ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} title="Refresh">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }} className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>User</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Email</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Role</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Status</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <UserCircle2 className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                    <p className={darkMode ? 'text-slate-400' : 'text-gray-500'}>No users found</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr key={user.id || index} className={`${darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.username || 'Unknown'}</p>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                        <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>{user.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-4">{getStatusBadge(user.is_active)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setShowDeleteConfirm(user)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-600 text-slate-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-600'}`} title="Delete User">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-4 py-3 border-t flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-2 rounded-lg transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'}`}><ChevronLeft className="w-5 h-5" /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-500 text-white' : darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-2 rounded-lg transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'}`}><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl my-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border overflow-hidden`}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-6 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">Create New User</h2>
                    <p className="text-purple-100 text-xs sm:text-sm">Add a new system user</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {formSuccess && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 text-sm">{formSuccess}</p>
                </div>
              )}
              {formError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 text-sm">{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Personal Information */}
                <div>
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    <UserCircle2 className="w-4 h-4" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>First Name *</label>
                      <input type="text" name="firstname" className={`w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="John" />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Last Name *</label>
                      <input type="text" name="lastname" className={`w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="Doe" />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    <Mail className="w-4 h-4" />
                    Contact Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Email Address *</label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="john.doe@government.na" />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Phone Number</label>
                      <input type="tel" name="phone" className={`w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="+264 81 123 4567" />
                    </div>
                  </div>
                </div>

                {/* Account Role */}
                <div>
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    <Shield className="w-4 h-4" />
                    User Role
                  </h3>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Select Role *</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className={`w-full px-3 py-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
                      {availableRoles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                      {formData.role === 'admin' && 'Full system access with all privileges'}
                      {formData.role === 'natisadmin' && 'Access to NaTIS vehicle registration system'}
                      {formData.role === 'nampoladmin' && 'Access to officer management and traffic operations'}
                      {formData.role === 'judiciary' && 'Access to case files and court scheduling'}
                      {formData.role === 'ministry' && 'Access to analytics and reports'}
                      {formData.role === 'officer' && 'Access to ticket issuance and management'}
                    </p>
                  </div>
                </div>

                {/* Account Credentials */}
                <div>
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    <Key className="w-4 h-4" />
                    Account Credentials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Username *</label>
                      <div className="relative">
                        <UserCircle2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                        <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="john.doe" />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Password *</label>
                      <div className="relative">
                        <Key className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} required className={`w-full pl-10 pr-12 py-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Confirm Password *</label>
                    <div className="relative">
                      <Key className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                      <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowAddModal(false); setFormError(''); setFormSuccess('') }} className={`flex-1 py-2.5 rounded-xl border transition-colors font-medium text-sm ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                    {submitting ? <><RefreshCw className="w-4 h-4 animate-spin" />Creating...</> : <><Shield className="w-4 h-4" />Create User</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}></div>
          <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border p-6`}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center"><AlertCircle className="w-8 h-8 text-red-500" /></div>
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Delete User?</h3>
              <p className={`text-sm mb-6 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Are you sure you want to delete <span className="font-semibold text-white">{showDeleteConfirm.username}</span>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className={`flex-1 py-2.5 rounded-lg border transition-colors ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
                <button onClick={() => handleDeleteUser(showDeleteConfirm.id)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" />Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

