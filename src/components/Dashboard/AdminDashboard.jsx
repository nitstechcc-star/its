import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Calendar,
  Activity,
  Users,
  DollarSign,
  FileText,
  Shield,
  Settings,
  Database,
  Server,
  RefreshCw,
  UserPlus,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity as ActivityIcon,
  Car
} from 'lucide-react'
import { getAnalytics, getAuditLogs, get_officers, getUsers, getDrivers, getVehicles } from '../../Axios'

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')

  // Real-time data states
  const [analytics, setAnalytics] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [officers, setOfficers] = useState([])
  const [users, setUsers] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [analyticsData, logsData, officersData, usersData, driversData, vehiclesData] = await Promise.all([
        getAnalytics(30),
        getAuditLogs(50),
        get_officers(),
        getUsers(),
        getDrivers(),
        getVehicles()
      ])

      if (analyticsData.success !== false) {
        setAnalytics(analyticsData.data || analyticsData)
      }

      if (logsData.success !== false) {
        setAuditLogs(logsData.data || logsData)
      }

      if (officersData.success !== false) {
        setOfficers(officersData.data || [])
      }

      if (usersData.success !== false) {
        setUsers(usersData.data || [])
      }

      if (driversData?.success !== false) {
        setDrivers(Array.isArray(driversData) ? driversData : (driversData.data || []))
      }

      if (vehiclesData?.success !== false) {
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData.data || []))
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = localStorage.getItem('darkMode') === 'true'
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

  // Calculate stats
  const totalTickets = analytics?.total_tickets || 0
  const totalRevenue = analytics?.total_revenue || 0
  const totalOfficers = officers.length || 0
  const totalUsers = users.length || 0
  const totalDrivers = drivers.length || 0
  const totalVehicles = vehicles.length || 0

  // Get status breakdown
  const statusData = analytics?.status_breakdown || []
  const pendingTickets = statusData.find(s => s.status === 'pending')?.count || 0
  const paidTickets = statusData.find(s => s.status === 'paid')?.count || 0
  const disputedTickets = statusData.find(s => s.status === 'disputed')?.count || 0

  // Get users by role
  const usersByRole = users.reduce((acc, user) => {
    const role = user.role || 'default'
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {})

  // Loading state
  if (loading && !analytics) {
    return (
      <div className='space-y-6 m-5'>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !analytics) {
    return (
      <div className='space-y-6 m-5'>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
            <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6 m-5'>
      {/* Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-6 text-white shadow-xl'>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className='flex flex-wrap items-center justify-between gap-4 relative z-10'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-white/20 backdrop-blur-sm rounded-xl'>
              <Settings className="w-8 h-8" />
            </div>
            <div>
              <h1 className='text-2xl font-bold'>System Administration</h1>
              <p className='text-slate-300 text-sm flex items-center gap-2 mt-1'>
                <Calendar className='w-4 h-4' />
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={fetchDashboardData}
              className='flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors'
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className='text-sm font-medium'>Refresh</span>
            </button>
            <div className='flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-xl px-4 py-2'>
              <Server className='w-4 h-4 text-green-400' />
              <span className='text-sm font-medium'>System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Total Users */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{totalUsers}</p>
            <p className="text-blue-100 text-xs font-medium">Total Users</p>
          </div>
        </div>

        {/* Active Officers */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{totalOfficers}</p>
            <p className="text-violet-100 text-xs font-medium">Traffic Officers</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            <p className="text-emerald-100 text-xs font-medium">Total Revenue</p>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{pendingTickets}</p>
            <p className="text-amber-100 text-xs font-medium">Pending Actions</p>
          </div>
        </div>
      </div>

      {/* Second Row - Quick Actions & System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Role */}
        <div className={`rounded-xl border p-5 shadow-sm ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-bold text-lg mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>Users by Role</h3>
          <div className="space-y-3">
            {Object.entries(usersByRole).length > 0 ? (
              Object.entries(usersByRole).map(([role, count]) => (
                <div key={role} className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      role === 'admin' ? 'bg-red-500' :
                      role === 'officer' ? 'bg-blue-500' :
                      role === 'judge' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className={`capitalize font-medium ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>{role}</span>
                  </div>
                  <span className={`font-bold ${
                    darkMode ? 'text-slate-300' : 'text-gray-600'
                  }`}>{count}</span>
                </div>
              ))
            ) : (
              <p className={`text-center py-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                No users found
              </p>
            )}
          </div>
        </div>

        {/* Ticket Status Overview */}
        <div className={`rounded-xl border p-5 shadow-sm ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-bold text-lg mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>Ticket Status</h3>
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Total Tickets</span>
              <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{totalTickets}</span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Paid</span>
              <span className={`font-bold text-green-500`}>{paidTickets}</span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Pending</span>
              <span className={`font-bold text-yellow-500`}>{pendingTickets}</span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Disputed</span>
              <span className={`font-bold text-red-500`}>{disputedTickets}</span>
            </div>
          </div>
        </div>

        {/* System Quick Stats */}
        <div className={`rounded-xl border p-5 shadow-sm ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-bold text-lg mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>System Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                <span className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Registered Vehicles</span>
              </div>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{totalVehicles}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                <span className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Registered Drivers</span>
              </div>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{totalDrivers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                <span className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Database Status</span>
              </div>
              <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                <span className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>API Status</span>
              </div>
              <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`rounded-xl border p-5 shadow-sm ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className='flex items-center justify-between mb-4'>
          <h3 className={`font-bold text-lg ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>Recent System Activity</h3>
          <button
            onClick={fetchDashboardData}
            className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
              darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        <div className='space-y-2 max-h-80 overflow-y-auto'>
          {auditLogs.length > 0 ? (
            auditLogs.slice(0, 10).map((log, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
              }`}>
                <div className='flex items-center gap-3'>
                  <div className={`p-2 rounded-full ${
                    log.action?.includes('issued') ? 'bg-red-100 dark:bg-red-900/30' :
                    log.action?.includes('paid') ? 'bg-green-100 dark:bg-green-900/30' :
                    log.action?.includes('login') ? 'bg-blue-100 dark:bg-blue-900/30' :
                    log.action?.includes('create') ? 'bg-purple-100 dark:bg-purple-900/30' :
                    'bg-gray-100 dark:bg-gray-900/30'
                  }`}>
                    <ActivityIcon className={`w-4 h-4 ${
                      log.action?.includes('issued') ? 'text-red-500' :
                      log.action?.includes('paid') ? 'text-green-500' :
                      log.action?.includes('login') ? 'text-blue-500' :
                      log.action?.includes('create') ? 'text-purple-500' :
                      'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>{log.action || 'Unknown action'}</p>
                    <p className={`text-xs ${
                      darkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>by {log.user || 'System'}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className={`text-xs ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className={`text-center py-8 ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>No recent activity</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
          darkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500'
        }`}>
          <UserPlus className={`w-6 h-6 mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add User</p>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Create new account</p>
        </button>

        <button className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
          darkMode ? 'bg-slate-800 border-slate-700 hover:border-green-500' : 'bg-white border-gray-200 hover:border-green-500'
        }`}>
          <Shield className={`w-6 h-6 mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Manage Officers</p>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>View & edit officers</p>
        </button>

        <button className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
          darkMode ? 'bg-slate-800 border-slate-700 hover:border-purple-500' : 'bg-white border-gray-200 hover:border-purple-500'
        }`}>
          <BarChart3 className={`w-6 h-6 mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Analytics</p>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>View reports</p>
        </button>

        <button className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
          darkMode ? 'bg-slate-800 border-slate-700 hover:border-amber-500' : 'bg-white border-gray-200 hover:border-amber-500'
        }`}>
          <Settings className={`w-6 h-6 mb-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Settings</p>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>System config</p>
        </button>
      </div>
    </div>
  )
}

