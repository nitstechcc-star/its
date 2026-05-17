import { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, FileText, AlertTriangle, Calendar,
  BarChart3, PieChart, Activity, RefreshCw, MapPin, Clock, Target,
  AlertCircle, CheckCircle, Car, Shield, Zap
} from 'lucide-react'
import { getAnalytics, getAllTickets } from '../../Axios'

export default function MinistryDashboard() {
  const darkMode = localStorage.getItem('darkMode') === 'true'

  const [analytics, setAnalytics] = useState(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeOfDayData, setTimeOfDayData] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [analyticsResult, ticketsResult] = await Promise.all([
        getAnalytics(),
        getAllTickets()
      ])

      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data)
      }

      if (ticketsResult.success) {
        setRecentTickets(ticketsResult.data || [])
        // Process tickets by time of day
        processTimeOfDayData(ticketsResult.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processTimeOfDayData = (tickets) => {
    // Group tickets by hour of day
    const hours = Array(24).fill(0)
    const dayOfWeek = Array(7).fill(0)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    tickets.forEach(ticket => {
      if (ticket.created_at) {
        const date = new Date(ticket.created_at)
        const hour = date.getHours()
        const day = date.getDay()
        hours[hour]++
        dayOfWeek[day]++
      }
    })

    // Define time periods
    const timePeriods = [
      { name: 'Morning Rush (6-9 AM)', start: 6, end: 9, count: hours.slice(6, 10).reduce((a, b) => a + b, 0) },
      { name: 'Midday (10 AM-12 PM)', start: 10, end: 12, count: hours.slice(10, 13).reduce((a, b) => a + b, 0) },
      { name: 'Afternoon (1-4 PM)', start: 13, end: 16, count: hours.slice(13, 17).reduce((a, b) => a + b, 0) },
      { name: 'Evening Rush (5-7 PM)', start: 17, end: 19, count: hours.slice(17, 20).reduce((a, b) => a + b, 0) },
      { name: 'Night (8 PM-11 PM)', start: 20, end: 23, count: hours.slice(20, 24).reduce((a, b) => a + b, 0) },
      { name: 'Late Night (12 AM-5 AM)', start: 0, end: 5, count: hours.slice(0, 6).reduce((a, b) => a + b, 0) },
    ]

    setTimeOfDayData({
      byHour: hours,
      byDayOfWeek: dayOfWeek.map((count, i) => ({ day: days[i], count })),
      periods: timePeriods
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NA', {
      style: 'currency',
      currency: 'NAD',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-NA').format(num || 0)
  }

  // Calculate key metrics
  const totalTickets = analytics?.total_tickets || 0
  const totalRevenue = analytics?.total_revenue || 0
  const pendingCourt = analytics?.pending_court || 0
  const resolvedCases = analytics?.resolved_cases || 0

  // Get status breakdown
  const statusColors = {
    pending: 'bg-yellow-500',
    paid: 'bg-green-500',
    overdue: 'bg-red-500',
    disputed: 'bg-purple-500',
    court: 'bg-blue-500',
    closed: 'bg-gray-500',
  }

  const getStatusData = () => {
    if (!analytics?.status_breakdown) return []
    return analytics.status_breakdown.map(s => ({
      name: s.status || 'Unknown',
      value: s.count || 0,
      color: statusColors[s.status] || 'bg-gray-500'
    }))
  }

  // Find peak hours
  const getPeakHours = () => {
    if (!timeOfDayData.byHour) return []
    const hours = timeOfDayData.byHour.map((count, hour) => ({ hour, count }))
    return hours.sort((a, b) => b.count - a.count).slice(0, 3)
  }

  // Get violation breakdown
  const getViolationData = () => {
    if (!analytics?.violation_breakdown) return []
    return analytics.violation_breakdown.slice(0, 6).map(v => ({
      name: (v.violation_type || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: v.count || 0
    }))
  }

  // Get region breakdown
  const regionColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  const getRegionData = () => {
    if (!analytics?.region_breakdown) return []
    return analytics.region_breakdown.slice(0, 5).map((r, i) => ({
      name: (r.region || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: r.count || 0,
      color: regionColors[i % regionColors.length]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ministry Dashboard</h1>
              <p className="text-emerald-100 text-sm">Traffic Violation Analytics & Monitoring</p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Key Metrics - Modern Card Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Total Tickets Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{loading ? '-' : formatNumber(totalTickets)}</p>
            <p className="text-red-100 text-xs font-medium">Total Tickets</p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{loading ? '-' : formatCurrency(totalRevenue)}</p>
            <p className="text-green-100 text-xs font-medium">Revenue</p>
          </div>
        </div>

        {/* Pending Court Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{loading ? '-' : pendingCourt}</p>
            <p className="text-blue-100 text-xs font-medium">Pending Court</p>
          </div>
        </div>

        {/* Resolved Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{loading ? '-' : resolvedCases}</p>
            <p className="text-purple-100 text-xs font-medium">Resolved</p>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className={`rounded-xl border p-5 backdrop-blur-sm ${
        darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Key Insights & Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Peak Hours Alert */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-amber-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className={`font-medium ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                Peak Incident Times
              </span>
            </div>
            {loading ? (
              <p className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Loading...</p>
            ) : (
              <div className="space-y-1">
                {getPeakHours().map((peak, i) => (
                  <p key={i} className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    {peak.hour}:00 - {peak.hour + 1}:00 ({peak.count} tickets)
                  </p>
                ))}
              </div>
            )}
            <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
              Consider increasing patrol during these hours
            </p>
          </div>

          {/* Top Violations */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                Top Violations
              </span>
            </div>
            {loading ? (
              <p className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Loading...</p>
            ) : (
              <div className="space-y-1">
                {getViolationData().slice(0, 3).map((v, i) => (
                  <p key={i} className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    {v.name}: {v.value}
                  </p>
                ))}
              </div>
            )}
            <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
              Focus awareness campaigns on these violations
            </p>
          </div>

          {/* Status Overview */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                Case Status
              </span>
            </div>
            {loading ? (
              <p className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Loading...</p>
            ) : (
              <div className="space-y-1">
                {getStatusData().slice(0, 3).map((s, i) => (
                  <p key={i} className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    {s.name}: {s.value}
                  </p>
                ))}
              </div>
            )}
            <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
              {((getStatusData().find(s => s.name === 'pending')?.value || 0) / totalTickets * 100).toFixed(1)}% pending action
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time of Day Analysis */}
        <div className={`rounded-xl border p-5 backdrop-blur-sm ${
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Incidents by Time of Day
          </h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="flex items-end gap-1 h-32">
                {timeOfDayData.byHour?.map((count, hour) => {
                  const maxCount = Math.max(...timeOfDayData.byHour)
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0
                  const isPeakHour = getPeakHours().some(p => p.hour === hour)
                  return (
                    <div
                      key={hour}
                      className={`flex-1 rounded-t transition-all ${isPeakHour ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${hour}:00 - ${count} tickets`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
              </div>

              {/* Time Periods Summary */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {timeOfDayData.periods?.slice(0, 4).map((period, i) => (
                  <div key={i} className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{period.name}</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{period.count}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Monthly Trends */}
        <div className={`rounded-xl border p-5 backdrop-blur-sm ${
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Trends
          </h3>
          <div className="flex items-end gap-2 h-40">
            {analytics?.monthly_trends?.map((month, index) => {
              const maxTickets = Math.max(...(analytics.monthly_trends?.map(m => m.tickets) || [1]))
              const height = maxTickets > 0 ? (month.tickets / maxTickets) * 100 : 0
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all hover:from-emerald-600 hover:to-teal-500"
                    style={{ height: `${height}%`, minHeight: month.tickets > 0 ? '8px' : '0' }}
                  ></div>
                  <span className={`text-xs ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {month.month}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-4">
            <div className="text-center">
              <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics?.monthly_trends?.reduce((sum, m) => sum + m.tickets, 0) || 0}
              </p>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold text-green-500`}>
                {formatCurrency(analytics?.monthly_trends?.reduce((sum, m) => sum + m.revenue, 0) || 0)}
              </p>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation Breakdown */}
        <div className={`rounded-xl border p-5 backdrop-blur-sm ${
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Violation Types Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getViolationData().map((violation, index) => {
              const percentage = totalTickets > 0 ? (violation.value / totalTickets) * 100 : 0
              return (
                <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium text-sm ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      {violation.name}
                    </span>
                    <span className={`text-sm font-bold ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {violation.value}
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className={`rounded-xl border p-5 backdrop-blur-sm ${
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Tickets by Region
            </h3>
            <MapPin className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
          </div>
          <div className="space-y-3">
            {getRegionData().map((region, index) => {
              const maxValue = Math.max(...getRegionData().map(r => r.value))
              const percentage = maxValue > 0 ? (region.value / maxValue) * 100 : 0
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-32">
                    <span className={`font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      {region.name}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className={`h-6 rounded-md ${
                      darkMode ? 'bg-slate-700' : 'bg-gray-100'
                    } overflow-hidden`}>
                      <div
                        className="h-full rounded-md flex items-center justify-end pr-2 transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: region.color
                        }}
                      >
                        <span className="text-xs text-white font-bold">
                          {region.value}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className={`text-sm ${
                      darkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      {totalTickets > 0 ? ((region.value / totalTickets) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className={`rounded-xl border p-5 backdrop-blur-sm ${
        darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Ticket Status Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {getStatusData().map((status, index) => {
            const percentage = totalTickets > 0 ? (status.value / totalTickets) * 100 : 0
            return (
              <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  <span className={`text-sm font-medium capitalize ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    {status.name}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {status.value}
                </p>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                  {percentage.toFixed(1)}%
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

