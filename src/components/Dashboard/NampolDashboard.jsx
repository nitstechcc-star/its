import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  Activity,
  Users,
  Shield,
  Badge,
  Clock,
  MapPin,
  Car,
  Ticket,
  UserCheck,
  UserX,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { getAnalytics, getAuditLogs, get_officers } from '../../Axios'

// Rank configurations
const rankColors = {
  'Commander': 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
  'Chief Inspector': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  'Inspector': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  'Sergeant': 'bg-gradient-to-r from-green-500 to-teal-500 text-white',
  'Officer': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
}

export default function NampolDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')

  const [analytics, setAnalytics] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [officers, setOfficers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [analyticsData, logsData, officersData] = await Promise.all([
        getAnalytics(30),
        getAuditLogs(50),
        get_officers()
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
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setDarkMode(isDark)
        }
      })
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => {
      window.removeEventListener('storage', handleThemeChange)
      observer.disconnect()
    }
  }, [])

  // Calculate stats
  const totalOfficers = officers.length || 0
  const activeOfficers = officers.filter(o => o.active).length
  const inactiveOfficers = totalOfficers - activeOfficers
  const totalTickets = analytics?.total_tickets || 0
  const pendingTickets = analytics?.status_breakdown?.find(s => s.status === 'pending')?.count || 0
  const paidTickets = analytics?.status_breakdown?.find(s => s.status === 'paid')?.count || 0

  // Quick stats for Nampol
  const quickStats = [
    {
      id: 1,
      title: 'Total Officers',
      value: totalOfficers,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 2,
      title: 'Active Officers',
      value: activeOfficers,
      icon: UserCheck,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      id: 3,
      title: 'Tickets Issued',
      value: totalTickets,
      icon: Ticket,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      id: 4,
      title: 'Pending',
      value: pendingTickets,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ]

  // Get recent officer activity
  const recentOfficerActivity = auditLogs
    .filter(log => log.action?.includes('ticket') || log.action?.includes('issued'))
    .slice(0, 8)

  // Get officers by rank
  const officersByRank = officers.reduce((acc, officer) => {
    const rank = officer.rank || 'Officer'
    acc[rank] = (acc[rank] || 0) + 1
    return acc
  }, {})

  if (loading && !analytics) {
    return (
      <div className='space-y-6 m-5'>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error && !analytics) {
    return (
      <div className='space-y-6 m-5'>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 m-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nampol Command Center</h1>
              <p className="text-yellow-100 text-sm flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <Activity className="w-4 h-4 animate-pulse text-green-400" />
            <span className="text-sm font-medium">Live Monitoring</span>
          </div>
        </div>
      </div>

      {/* Quick Stats - Modern Card Design (Smaller) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Total Officers Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{totalOfficers}</p>
            <p className="text-blue-100 text-xs font-medium">Total Officers</p>
          </div>
        </div>

        {/* Active Officers Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{activeOfficers}</p>
            <p className="text-green-100 text-xs font-medium">Active</p>
          </div>
        </div>

        {/* Tickets Issued Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{totalTickets.toLocaleString()}</p>
            <p className="text-red-100 text-xs font-medium">Tickets Issued</p>
          </div>
        </div>

        {/* Pending Tickets Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{pendingTickets}</p>
            <p className="text-amber-100 text-xs font-medium">Pending</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Officers by Rank */}
        <div className={`rounded-xl border p-5 shadow-sm ${
          darkMode
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-lg ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Officers by Rank
            </h3>
            <button
              onClick={fetchDashboardData}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-slate-700 text-slate-400'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(officersByRank).length > 0 ? (
              Object.entries(officersByRank).map(([rank, count]) => (
                <div
                  key={rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge className={`w-5 h-5 ${
                      darkMode ? 'text-slate-400' : 'text-gray-500'
                    }`} />
                    <span className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {rank}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    rankColors[rank] || rankColors['Officer']
                  }`}>
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <p className={`text-center py-4 ${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                No officers data available
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`rounded-xl border p-5 shadow-sm lg:col-span-2 ${
          darkMode
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-lg ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Recent Ticket Activity
            </h3>
            <span className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              Last 24 hours
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentOfficerActivity.length > 0 ? (
              recentOfficerActivity.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      log.action?.includes('issued')
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <Ticket className={`w-4 h-4 ${
                        log.action?.includes('issued')
                          ? 'text-red-500'
                          : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {log.action || 'Unknown action'}
                      </p>
                      <p className={`text-xs ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        by {log.user || 'System'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${
                      darkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </p>
                    {log.ticket && (
                      <p className={`text-xs font-mono ${
                        darkMode ? 'text-slate-500' : 'text-gray-400'
                      }`}>
                        {log.ticket}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-center py-4 ${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Officer List */}
      <div className={`rounded-xl border overflow-hidden shadow-sm ${
        darkMode
          ? 'bg-slate-800/50 border-slate-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className={`p-5 border-b ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-lg ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Officer Overview
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Active: {activeOfficers}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Inactive: {inactiveOfficers}
                </span>
              </div>
            </div>
          </div>
        </div>

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
                }`}>Rank</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              darkMode ? 'divide-slate-700' : 'divide-gray-200'
            }`}>
              {officers.slice(0, 6).map((officer, index) => (
                <tr
                  key={officer.id || index}
                  className={`${
                    darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
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
                    <span className={`font-mono font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      {officer.badge || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      rankColors[officer.rank] || rankColors['Officer']
                    }`}>
                      {officer.rank || 'Officer'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {officer.active ? (
                      <span className="flex items-center gap-2 text-green-500">
                        <UserCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">Active</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-500">
                        <UserX className="w-4 h-4" />
                        <span className="text-sm font-medium">Inactive</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {officers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center">
                    <Users className={`w-12 h-12 mx-auto mb-3 ${
                      darkMode ? 'text-slate-600' : 'text-gray-300'
                    }`} />
                    <p className={darkMode ? 'text-slate-400' : 'text-gray-500'}>
                      No officers found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-xl border p-5 shadow-sm ${
          darkMode
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-bold text-lg mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Ticket Status Overview
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {analytics?.status_breakdown?.map((status) => (
              <div
                key={status.status}
                className={`p-3 rounded-lg ${
                  darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}
              >
                <p className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {status.count}
                </p>
                <p className={`text-sm capitalize ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {status.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-xl border p-5 shadow-sm ${
          darkMode
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-bold text-lg mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Revenue Collection
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Total Revenue
              </span>
              <span className={`text-2xl font-bold ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                ${(analytics?.total_revenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Paid Tickets
              </span>
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {paidTickets}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${
                darkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Pending
              </span>
              <span className={`font-medium ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              }`}>
                {pendingTickets}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

