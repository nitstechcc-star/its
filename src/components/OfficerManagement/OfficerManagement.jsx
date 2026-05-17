import { useState, useEffect } from 'react'
import {
  Search, RefreshCw, Plus, Filter, MoreVertical, Trash2, Edit,
  Shield, Badge, Calendar, UserCheck, UserX, ChevronLeft, ChevronRight,
  Users, UserCircle2, MapPin, Phone, Mail, FileText, X, AlertCircle
} from 'lucide-react'
import { get_officers, createOfficer } from '../../Axios'

export default function OfficerManagement() {
  const darkMode = localStorage.getItem('darkMode') === 'true'

  const [officers, setOfficers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedOfficer, setSelectedOfficer] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    badge: '',
    rank: 'Officer'
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    loadOfficers()
  }, [])

  const loadOfficers = async () => {
    setLoading(true)
    try {
      const result = await get_officers()
      if (result.success) {
        setOfficers(result.data || [])
      }
    } catch (error) {
      console.error('Error loading officers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOfficers = officers.filter(officer =>
    officer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.badge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)

    try {
      const result = await createOfficer(formData)
      if (result.success) {
        setFormSuccess('Officer created successfully!')
        setFormData({ username: '', password: '', badge: '', rank: 'Officer' })
        loadOfficers()
        setTimeout(() => {
          setShowAddModal(false)
          setFormSuccess('')
        }, 1500)
      } else {
        setFormError(result.error?.error || 'Failed to create officer')
      }
    } catch (error) {
      setFormError('An error occurred while creating officer')
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage)
  const paginatedOfficers = filteredOfficers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      officer: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      judiciary: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
      ministry: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    }
    return colors[role] || colors.officer
  }

  const getStatusBadge = (active) => {
    if (active) {
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        dot: 'bg-green-400',
        label: 'Active'
      }
    }
    return {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      dot: 'bg-red-400',
      label: 'Inactive'
    }
  }

  return (
    <div className="space-y-6 m-5">
      {/* Stats Cards - Modern Card Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{officers.length}</p>
            <p className="text-blue-100 text-xs font-medium">Total Officers</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{officers.filter(o => o.active).length}</p>
            <p className="text-green-100 text-xs font-medium">Active</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{officers.filter(o => !o.active).length}</p>
            <p className="text-red-100 text-xs font-medium">Inactive</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{officers.filter(o => o.role === 'admin').length}</p>
            <p className="text-purple-100 text-xs font-medium">Admins</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`rounded-xl border overflow-hidden backdrop-blur-sm ${
        darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        {/* Toolbar */}
        <div className={`p-4 border-b flex flex-col sm:flex-row gap-4 ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          {/* Search */}
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              darkMode ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search officers by name, badge, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2.5 rounded-lg w-full ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={loadOfficers}
              className={`p-2.5 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Officer
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Officer</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Badge #</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Role</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Status</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              darkMode ? 'divide-slate-700' : 'divide-gray-200'
            }`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>
                        Loading officers...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedOfficers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <UserCircle2 className={`w-12 h-12 mx-auto mb-3 ${
                      darkMode ? 'text-slate-600' : 'text-gray-300'
                    }`} />
                    <p className={darkMode ? 'text-slate-400' : 'text-gray-500'}>
                      No officers found
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedOfficers.map((officer, index) => {
                  const status = getStatusBadge(officer.active)
                  return (
                    <tr key={officer.id || index} className={`${
                      darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
                    } transition-colors`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {officer.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className={`font-medium ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {officer.name || 'Unknown'}
                            </p>
                            <p className={`text-xs ${
                              darkMode ? 'text-slate-400' : 'text-gray-500'
                            }`}>
                              ID: {officer.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`w-4 h-4 ${
                            darkMode ? 'text-slate-400' : 'text-gray-400'
                          }`} />
                          <span className={`font-mono font-medium ${
                            darkMode ? 'text-slate-300' : 'text-gray-700'
                          }`}>
                            {officer.badge || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(officer.role)}`}>
                          {officer.role?.charAt(0).toUpperCase() + officer.role?.slice(1) || 'Officer'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                          <span className={`text-sm font-medium ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? 'hover:bg-slate-600 text-slate-400 hover:text-blue-400'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'
                            }`}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? 'hover:bg-slate-600 text-slate-400 hover:text-red-400'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-red-600'
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`px-4 py-3 border-t flex items-center justify-between ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOfficers.length)} of {filteredOfficers.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : darkMode
                    ? 'hover:bg-slate-700 text-slate-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : darkMode
                      ? 'hover:bg-slate-700 text-slate-300'
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : darkMode
                    ? 'hover:bg-slate-700 text-slate-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Officer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          ></div>
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl my-4 ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          } border overflow-hidden`}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">Register New Officer</h2>
                    <p className="text-blue-100 text-xs sm:text-sm">Add officer to Nampol force</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {formSuccess && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
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
                {/* Personal Information Section */}
                <div>
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <UserCircle2 className="w-4 h-4" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        darkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstname"
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        darkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastname"
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <Phone className="w-4 h-4" />
                    Contact Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        darkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="john.doe@nampol.gov.na"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        darkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="+264 81 123 4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Official Information */}
                <div>
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <Badge className="w-4 h-4" />
                    Official Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        darkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        Badge Number *
                      </label>
                      <input
                        type="text"
                        name="badge"
                        value={formData.badge}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="NAM-001234"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        darkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        Rank
                      </label>
                      <select
                        name="rank"
                        value={formData.rank}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="Officer">Officer</option>
                        <option value="Sergeant">Sergeant</option>
                        <option value="Inspector">Inspector</option>
                        <option value="Chief Inspector">Chief Inspector</option>
                        <option value="Commander">Commander</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Station Assignment */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    darkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Station / Division
                  </label>
                  <select
                    name="station"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Select Station</option>
                    <option value="Windhoek">Windhoek Central</option>
                    <option value="Khomas">Khomas Region</option>
                    <option value="Erongo">Erongo Region</option>
                    <option value="Oshana">Oshana Region</option>
                    <option value="Ohangwena">Ohangwena Region</option>
                  </select>
                </div>

                {/* Account Credentials */}
                <div>
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <Shield className="w-4 h-4" />
                    Account Credentials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        darkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="john.doe"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        darkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setFormError('')
                      setFormSuccess('')
                    }}
                    className={`flex-1 py-2.5 rounded-xl border transition-colors font-medium text-sm ${
                      darkMode
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Register Officer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

