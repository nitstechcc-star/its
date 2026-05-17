import { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, FileText, Users, Clock,
  AlertTriangle, Calendar, BarChart3, PieChart, Activity, RefreshCw,
  MapPin, Car, Filter, Download, Eye
} from 'lucide-react'
import { getAnalytics } from '../../Axios'

export default function Analytics() {
  const darkMode = localStorage.getItem('darkMode') === 'true'

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const result = await getAnalytics()
      if (result.success) {
        setAnalytics(result.data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
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

  // Calculate trends
  const totalTickets = analytics?.total_tickets || 0
  const recentTickets = analytics?.recent_tickets || 0
  const totalRevenue = analytics?.total_revenue || 0
  const recentRevenue = analytics?.recent_revenue || 0

  const ticketTrend = totalTickets > 0 && (totalTickets - recentTickets) > 0
    ? (((totalTickets - recentTickets) / (totalTickets - recentTickets)) * 100).toFixed(1)
    : 0
  const revenueTrend = totalRevenue > 0 && (totalRevenue - recentRevenue) > 0
    ? (((totalRevenue - recentRevenue) / (totalRevenue - recentRevenue)) * 100).toFixed(1)
    : 0

  // Status breakdown colors
  const statusColors = {
    pending: 'bg-yellow-500',
    paid: 'bg-green-500',
    overdue: 'bg-red-500',
    disputed: 'bg-purple-500',
    court: 'bg-blue-500',
    closed: 'bg-gray-500',
  }

  // Region colors
  const regionColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ]

  const getStatusData = () => {
    if (!analytics?.status_breakdown) return []
    return analytics.status_breakdown.map(s => ({
      name: s.status || 'Unknown',
      value: s.count || 0,
      color: statusColors[s.status] || 'bg-gray-500'
    }))
  }

  const getRegionData = () => {
    if (!analytics?.region_breakdown) return []
    return analytics.region_breakdown.slice(0, 5).map((r, i) => ({
      name: (r.region || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: r.count || 0,
      color: regionColors[i % regionColors.length]
    }))
  }

  const getViolationData = () => {
    if (!analytics?.violation_breakdown) return []
    return analytics.violation_breakdown.slice(0, 8).map(v => ({
      name: (v.violation_type || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: v.count || 0
    }))
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'regions', label: 'Regions', icon: MapPin },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Analytics Dashboard
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            View traffic violation statistics and trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAnalytics}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`flex gap-2 overflow-x-auto pb-2 ${
        darkMode ? 'border-b border-slate-700' : 'border-b border-gray-200'
      }`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? darkMode
                  ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                  : 'bg-white text-blue-600 border-b-2 border-blue-600'
                : darkMode
                  ? 'text-slate-400 hover:text-slate-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tickets */}
            <div className={`rounded-xl border p-5 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Tickets</p>
                  <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? '-' : formatNumber(totalTickets)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {Number(ticketTrend) >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${Number(ticketTrend) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {ticketTrend}%
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                      vs last period
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className={`rounded-xl border p-5 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Revenue</p>
                  <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? '-' : formatCurrency(totalRevenue)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {Number(revenueTrend) >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${Number(revenueTrend) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {revenueTrend}%
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                      vs last period
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            {/* Pending Court */}
            <div className={`rounded-xl border p-5 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Pending Court</p>
                  <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? '-' : analytics?.pending_court || 0}
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    Cases awaiting court
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Resolved */}
            <div className={`rounded-xl border p-5 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Resolved</p>
                  <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? '-' : analytics?.resolved_cases || 0}
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    Paid & closed
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Activity className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className={`rounded-xl border p-5 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Ticket Status Distribution
              </h3>
              <div className="space-y-3">
                {getStatusData().map((status, index) => {
                  const percentage = totalTickets > 0 ? (status.value / totalTickets) * 100 : 0
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium capitalize ${
                            darkMode ? 'text-slate-300' : 'text-gray-700'
                          }`}>
                            {status.name}
                          </span>
                          <span className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            {status.value} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className={`h-2 rounded-full ${
                          darkMode ? 'bg-slate-700' : 'bg-gray-100'
                        }`}>
                          <div
                            className={`h-full rounded-full ${status.color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
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
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all hover:from-blue-600 hover:to-blue-500"
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
        </>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-xl border p-5 backdrop-blur-sm ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Revenue by Month
            </h3>
            <div className="space-y-4">
              {analytics?.monthly_trends?.map((month, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className={`w-12 text-sm ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {month.month}
                  </span>
                  <div className="flex-1">
                    <div className={`h-6 rounded-md ${
                      darkMode ? 'bg-slate-700' : 'bg-gray-100'
                    } overflow-hidden`}>
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-md flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.max(5, (month.revenue / (Math.max(...(analytics.monthly_trends?.map(m => m.revenue) || [1])))) * 100)}%`
                        }}
                      >
                        <span className="text-xs text-white font-medium">
                          {formatCurrency(month.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-xl border p-5 backdrop-blur-sm ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Revenue Summary
            </h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Revenue</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Recent Revenue</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(recentRevenue)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Average per Ticket</p>
                <p className="text-2xl font-bold text-blue-500">
                  {totalTickets > 0 ? formatCurrency(totalRevenue / totalTickets) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className={`rounded-xl border p-5 backdrop-blur-sm ${
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Violation Types Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getViolationData().map((violation, index) => {
              const percentage = totalTickets > 0 ? (violation.value / totalTickets) * 100 : 0
              return (
                <div key={index} className={`p-4 rounded-lg ${
                  darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${
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
                  <div className={`h-2 rounded-full ${
                    darkMode ? 'bg-slate-600' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    {percentage.toFixed(1)}% of all violations
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Regions Tab */}
      {activeTab === 'regions' && (
        <div className={`rounded-xl border p-5 backdrop-blur-sm ${
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Tickets by Region
          </h3>
          <div className="space-y-4">
            {getRegionData().map((region, index) => {
              const maxValue = Math.max(...getRegionData().map(r => r.value))
              const percentage = maxValue > 0 ? (region.value / maxValue) * 100 : 0
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32">
                    <span className={`font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      {region.name}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className={`h-8 rounded-lg ${
                      darkMode ? 'bg-slate-700' : 'bg-gray-100'
                    } overflow-hidden`}>
                      <div
                        className="h-full rounded-lg flex items-center justify-end pr-3 transition-all"
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
                  <div className="w-20 text-right">
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
      )}
    </div>
  )
}

