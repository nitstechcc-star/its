import React, { useState, useEffect } from 'react'
import {
  Car,
  CreditCard,
  FileText,
  Search,
  User,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Printer,
  RefreshCw,
  X,
  Users,
  Ticket,
  CarFront
} from 'lucide-react'
import { lookupVehicle, verifyDriverLicense, processPayment, generateReport, getAnalytics, getVehicles, getDrivers } from '../../Axios'

// Tab types
const TABS = {
  VEHICLE_LOOKUP: 'vehicle_lookup',
  LICENSE_VERIFY: 'license_verify',
  PAYMENTS: 'payments',
  REPORTS: 'reports'
}

export default function NaTISAdminDashboard() {
  const [activeTab, setActiveTab] = useState(TABS.VEHICLE_LOOKUP)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Stats State
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalDrivers: 0,
    totalTickets: 0,
    pendingPayments: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Vehicle Lookup State
  const [plateNumber, setPlateNumber] = useState('')
  const [vehicleData, setVehicleData] = useState(null)

  // License Verification State
  const [licenseNo, setLicenseNo] = useState('')
  const [idNo, setIdNo] = useState('')
  const [driverData, setDriverData] = useState(null)

  // Payment State
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [amountPaid, setAmountPaid] = useState('')

  // Report State
  const [reportType, setReportType] = useState('traffic_summary')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reportData, setReportData] = useState(null)

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

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true)
      try {
        const [analyticsData, vehiclesData, driversData] = await Promise.all([
          getAnalytics(),
          getVehicles(),
          getDrivers()
        ])

        // Extract analytics data
        const analytics = analyticsData?.data || analyticsData || {}
        const pendingPayments = analytics?.status_breakdown?.find(s => s.status === 'pending')?.count || 0

        // Get vehicles count
        const vehiclesCount = Array.isArray(vehiclesData) ? vehiclesData.length :
          vehiclesData?.data?.length || 0

        // Get drivers count
        const driversCount = Array.isArray(driversData) ? driversData.length :
          driversData?.data?.length || 0

        setStats({
          totalVehicles: vehiclesCount,
          totalDrivers: driversCount,
          totalTickets: analytics?.total_tickets || 0,
          pendingPayments: pendingPayments
        })
      } catch (error) {
        console.error('Error fetching NaTIS stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // Vehicle Lookup Handler
  const handleVehicleLookup = async (e) => {
    e.preventDefault()
    if (!plateNumber.trim()) {
      showMessage('Please enter a plate number', 'error')
      return
    }

    setLoading(true)
    const result = await lookupVehicle(plateNumber)
    setLoading(false)

    if (result.success) {
      setVehicleData(result.data)
    } else {
      showMessage(result.error || 'Error looking up vehicle', 'error')
    }
  }

  // Driver License Verification Handler
  const handleLicenseVerify = async (e) => {
    e.preventDefault()
    if (!licenseNo.trim() && !idNo.trim()) {
      showMessage('Please enter license number or ID number', 'error')
      return
    }

    setLoading(true)
    const result = await verifyDriverLicense(licenseNo, idNo)
    setLoading(false)

    if (result.success) {
      setDriverData(result.data)
    } else {
      showMessage(result.error || 'Error verifying license', 'error')
    }
  }

  // Payment Handler
  const handlePayment = async (e) => {
    e.preventDefault()
    if (!selectedTicket) {
      showMessage('Please select a ticket to pay', 'error')
      return
    }

    const amount = parseFloat(amountPaid)
    if (!amount || amount <= 0) {
      showMessage('Please enter a valid amount', 'error')
      return
    }

    setLoading(true)
    const result = await processPayment({
      ticket_id: selectedTicket.id,
      payment_method: paymentMethod,
      reference_number: referenceNumber,
      amount_paid: amount
    })
    setLoading(false)

    if (result.success) {
      showMessage('Payment processed successfully!', 'success')
      if (vehicleData) {
        handleVehicleLookup({ preventDefault: () => {} })
      }
      setSelectedTicket(null)
      setAmountPaid('')
      setReferenceNumber('')
    } else {
      showMessage(result.error || 'Error processing payment', 'error')
    }
  }

  // Report Generation Handler
  const handleGenerateReport = async (e) => {
    e.preventDefault()

    setLoading(true)
    const result = await generateReport(reportType, dateFrom || null, dateTo || null)
    setLoading(false)

    if (result.success) {
      setReportData(result.data)
    } else {
      showMessage(result.error || 'Error generating report', 'error')
    }
  }

  // Print Report
  const printReport = () => {
    window.print()
  }

  // Status badge helper
  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      disputed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      court: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
    return colors[status] || colors.pending
  }

  // Tab buttons
  const tabs = [
    { id: TABS.VEHICLE_LOOKUP, label: 'Vehicle Lookup', icon: Car },
    { id: TABS.LICENSE_VERIFY, label: 'License Verification', icon: User },
    { id: TABS.PAYMENTS, label: 'Fine Payments', icon: CreditCard },
    { id: TABS.REPORTS, label: 'Reports', icon: FileText }
  ]

  return (
    <div className='space-y-6 m-5'>
      {/* Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 via-green-800 to-teal-900 p-6 text-white shadow-xl'>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className='flex flex-wrap items-center justify-between gap-4 relative z-10'>
          <div className='flex items-center gap-4'>
            <span className='px-4 py-1.5 bg-yellow-500 text-green-900 text-sm font-bold rounded-lg shadow-lg'>NaTIS</span>
            <div>
              <h1 className='text-2xl font-bold'>National Traffic Information System</h1>
              <p className='text-green-100 text-sm flex items-center gap-2 mt-1'>
                <Calendar className='w-4 h-4' />
                Admin Dashboard
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg'>
            <CheckCircle className='w-4 h-4 text-green-400' />
            <span className='text-sm font-medium'>System Active</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {!statsLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {/* Total Vehicles */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CarFront className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.totalVehicles.toLocaleString()}</p>
              <p className="text-blue-100 text-xs font-medium">Registered Vehicles</p>
            </div>
          </div>

          {/* Total Drivers */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.totalDrivers.toLocaleString()}</p>
              <p className="text-purple-100 text-xs font-medium">Registered Drivers</p>
            </div>
          </div>

          {/* Total Tickets */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.totalTickets.toLocaleString()}</p>
              <p className="text-red-100 text-xs font-medium">Total Tickets</p>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.pendingPayments.toLocaleString()}</p>
              <p className="text-amber-100 text-xs font-medium">Pending Payments</p>
            </div>
          </div>
        </div>
      )}

      {statsLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className={`rounded-xl border p-1 shadow-sm ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className='flex flex-wrap gap-1'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-md'
                  : darkMode
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className='w-4 h-4' />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`rounded-xl border p-6 shadow-sm ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        {/* Vehicle Lookup Tab */}
        {activeTab === TABS.VEHICLE_LOOKUP && (
          <div className='space-y-6'>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>Vehicle Registration Lookup</h2>

            <form onSubmit={handleVehicleLookup} className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1'>
                <input
                  type='text'
                  placeholder='Enter Plate Number (e.g., N123456)'
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                />
              </div>
              <button
                type='submit'
                disabled={loading}
                className='px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2'
              >
                {loading ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Search className='w-4 h-4' />}
                Search
              </button>
            </form>

            {/* Vehicle Results */}
            {vehicleData && (
              <div className={`rounded-xl border p-6 ${
                darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
              }`}>
                {!vehicleData.found ? (
                  <div className='text-center py-8'>
                    <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-500'
                    }`} />
                    <p className={`text-lg font-medium ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>{vehicleData.message}</p>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {/* Vehicle Info */}
                    <div className={`rounded-lg p-4 ${
                      darkMode ? 'bg-slate-600' : 'bg-white'
                    }`}>
                      <h3 className={`font-bold text-lg mb-4 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>Vehicle Information</h3>
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>Plate Number</p>
                          <p className={`font-bold text-lg ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{vehicleData.plate_no}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>Make</p>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{vehicleData.vehicle?.make || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>Model</p>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{vehicleData.vehicle?.model || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>Color/Year</p>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{vehicleData.vehicle?.color} {vehicleData.vehicle?.year}</p>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <div className={`rounded-lg p-4 ${
                        darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                      }`}>
                        <p className={`text-sm ${
                          darkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>Total Tickets</p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{vehicleData.summary?.total_tickets || 0}</p>
                      </div>
                      <div className={`rounded-lg p-4 ${
                        darkMode ? 'bg-red-900/30' : 'bg-red-50'
                      }`}>
                        <p className={`text-sm ${
                          darkMode ? 'text-red-300' : 'text-red-600'
                        }`}>Total Fines</p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>N${vehicleData.summary?.total_fines?.toLocaleString() || 0}</p>
                      </div>
                      <div className={`rounded-lg p-4 ${
                        darkMode ? 'bg-green-900/30' : 'bg-green-50'
                      }`}>
                        <p className={`text-sm ${
                          darkMode ? 'text-green-300' : 'text-green-600'
                        }`}>Paid</p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>N${vehicleData.summary?.paid_fines?.toLocaleString() || 0}</p>
                      </div>
                      <div className={`rounded-lg p-4 ${
                        darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
                      }`}>
                        <p className={`text-sm ${
                          darkMode ? 'text-yellow-300' : 'text-yellow-600'
                        }`}>Pending</p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>N${vehicleData.summary?.pending_fines?.toLocaleString() || 0}</p>
                      </div>
                    </div>

                    {/* Ticket List */}
                    <div>
                      <h3 className={`font-bold text-lg mb-4 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>Associated Tickets</h3>
                      <div className='overflow-x-auto'>
                        <table className='w-full'>
                          <thead>
                            <tr className={darkMode ? 'bg-slate-600' : 'bg-gray-100'}>
                              <th className={`px-4 py-3 text-left text-sm font-medium ${
                                darkMode ? 'text-slate-300' : 'text-gray-600'
                              }`}>Ticket #</th>
                              <th className={`px-4 py-3 text-left text-sm font-medium ${
                                darkMode ? 'text-slate-300' : 'text-gray-600'
                              }`}>Date</th>
                              <th className={`px-4 py-3 text-left text-sm font-medium ${
                                darkMode ? 'text-slate-300' : 'text-gray-600'
                              }`}>Violation</th>
                              <th className={`px-4 py-3 text-left text-sm font-medium ${
                                darkMode ? 'text-slate-300' : 'text-gray-600'
                              }`}>Amount</th>
                              <th className={`px-4 py-3 text-left text-sm font-medium ${
                                darkMode ? 'text-slate-300' : 'text-gray-600'
                              }`}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vehicleData.tickets?.map((ticket) => (
                              <tr key={ticket.id} className={`border-b ${
                                darkMode ? 'border-slate-600' : 'border-gray-200'
                              }`}>
                                <td className={`px-4 py-3 font-medium ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>{ticket.ticket_number}</td>
                                <td className={`px-4 py-3 ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>
                                  {ticket.date ? new Date(ticket.date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className={`px-4 py-3 ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>{ticket.violation_type}</td>
                                <td className={`px-4 py-3 font-medium ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>N${ticket.amount.toLocaleString()}</td>
                                <td className='px-4 py-3'>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                                    {ticket.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* License Verification Tab */}
        {activeTab === TABS.LICENSE_VERIFY && (
          <div className='space-y-6'>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>Driver License Verification</h2>

            <form onSubmit={handleLicenseVerify} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>License Number</label>
                  <input
                    type='text'
                    placeholder='Enter License Number'
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value.toUpperCase())}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>ID Number</label>
                  <input
                    type='text'
                    placeholder='Enter ID Number'
                    value={idNo}
                    onChange={(e) => setIdNo(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              </div>
              <button
                type='submit'
                disabled={loading}
                className='px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
              >
                {loading ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Search className='w-4 h-4' />}
                Verify License
              </button>
            </form>

            {/* Driver Results */}
            {driverData && (
              <div className={`rounded-xl border p-6 ${
                darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
              }`}>
                {!driverData.found ? (
                  <div className='text-center py-8'>
                    <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-500'
                    }`} />
                    <p className={`text-lg font-medium ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>{driverData.message}</p>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {/* Driver Info */}
                    <div className={`rounded-lg p-4 ${
                      darkMode ? 'bg-slate-600' : 'bg-white'
                    }`}>
                      <h3 className={`font-bold text-lg mb-4 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>Driver Information</h3>
                      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>Full Name</p>
                          <p className={`font-bold text-lg ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{driverData.driver?.firstname} {driverData.driver?.lastname}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>ID Number</p>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{driverData.driver?.id_no}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>License Number</p>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{driverData.driver?.license_no || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>Phone</p>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{driverData.driver?.phone_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>Email</p>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{driverData.driver?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>City</p>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{driverData.driver?.city || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Associated Tickets */}
                    {driverData.tickets && driverData.tickets.length > 0 && (
                      <div>
                        <h3 className={`font-bold text-lg mb-4 ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>Traffic Violations</h3>
                        <div className='overflow-x-auto'>
                          <table className='w-full'>
                            <thead>
                              <tr className={darkMode ? 'bg-slate-600' : 'bg-gray-100'}>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Ticket #</th>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Plate No</th>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Violation</th>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Amount</th>
                                <th className={`px-4 py-3 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {driverData.tickets.map((ticket) => (
                                <tr key={ticket.id} className={`border-b ${
                                  darkMode ? 'border-slate-600' : 'border-gray-200'
                                }`}>
                                  <td className={`px-4 py-3 font-medium ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{ticket.ticket_number}</td>
                                  <td className={`px-4 py-3 ${
                                    darkMode ? 'text-slate-300' : 'text-gray-600'
                                  }`}>{ticket.plate_no}</td>
                                  <td className={`px-4 py-3 ${
                                    darkMode ? 'text-slate-300' : 'text-gray-600'
                                  }`}>{ticket.violation_type}</td>
                                  <td className={`px-4 py-3 font-medium ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>N${ticket.amount.toLocaleString()}</td>
                                  <td className='px-4 py-3'>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                                      {ticket.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === TABS.PAYMENTS && (
          <div className='space-y-6'>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>Traffic Fine Payment</h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Payment Form */}
              <div className={`rounded-xl border p-6 ${
                darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-bold text-lg mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>Process Payment</h3>

                <form onSubmit={handlePayment} className='space-y-4'>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>Select Ticket</label>
                    <select
                      value={selectedTicket?.id || ''}
                      onChange={(e) => {
                        const ticket = vehicleData?.tickets?.find(t => t.id === parseInt(e.target.value));
                        setSelectedTicket(ticket || null);
                        if (ticket) setAmountPaid(ticket.amount.toString());
                      }}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    >
                      <option value=''>Select a ticket...</option>
                      {vehicleData?.tickets?.filter(t => t.status !== 'paid').map((ticket) => (
                        <option key={ticket.id} value={ticket.id}>
                          {ticket.ticket_number} - N${ticket.amount.toLocaleString()} ({ticket.status})
                        </option>
                      ))}
                    </select>
                    <p className={`text-xs mt-2 ${
                      darkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>First search for a vehicle to see pending tickets</p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>Amount (N$)</label>
                    <input
                      type='number'
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    >
                      <option value='cash'>Cash</option>
                      <option value='card'>Card</option>
                      <option value='bank_transfer'>Bank Transfer</option>
                      <option value='mobile_money'>Mobile Money</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>Reference Number (Optional)</label>
                    <input
                      type='text'
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder='Enter payment reference'
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    />
                  </div>

                  <button
                    type='submit'
                    disabled={loading || !selectedTicket}
                    className='w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2'
                  >
                    {loading ? <RefreshCw className='w-4 h-4 animate-spin' /> : <DollarSign className='w-4 h-4' />}
                    Process Payment
                  </button>
                </form>
              </div>

              {/* Quick Tips */}
              <div className={`rounded-xl border p-6 ${
                darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-bold text-lg mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>Payment Information</h3>

                <div className='space-y-4'>
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-slate-600' : 'bg-white'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>How to Process Payment</h4>
                    <ol className={`text-sm space-y-2 ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      <li>1. Search for vehicle using the Vehicle Lookup tab</li>
                      <li>2. Select the ticket to pay from the dropdown</li>
                      <li>3. Verify the amount and enter payment method</li>
                      <li>4. Click Process Payment</li>
                    </ol>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-slate-600' : 'bg-white'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>Payment Methods</h4>
                    <ul className={`text-sm space-y-1 ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      <li>- Cash - Pay at any traffic office</li>
                      <li>- Card - Visa/Mastercard at offices</li>
                      <li>- Bank Transfer - Direct to traffic account</li>
                      <li>- Mobile Money - Via mobile payment apps</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === TABS.REPORTS && (
          <div className='space-y-6'>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>Report Generation</h2>

            {/* Report Options */}
            <div className={`rounded-xl border p-6 ${
              darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <form onSubmit={handleGenerateReport} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option value='traffic_summary'>Traffic Summary</option>
                      <option value='payment_report'>Payment Report</option>
                      <option value='violation_report'>Violation Report</option>
                      <option value='region_report'>Region Report</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>Date From</label>
                    <input
                      type='date'
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>Date To</label>
                    <input
                      type='date'
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                <div className='flex gap-4'>
                  <button
                    type='submit'
                    disabled={loading}
                    className='px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2'
                  >
                    {loading ? <RefreshCw className='w-4 h-4 animate-spin' /> : <FileText className='w-4 h-4' />}
                    Generate Report
                  </button>
                  {reportData && (
                    <button
                      type='button'
                      onClick={printReport}
                      className='px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 flex items-center gap-2'
                    >
                      <Printer className='w-4 h-4' />
                      Print
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Report Results */}
            {reportData && (
              <div className={`rounded-xl border p-6 ${
                darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-bold text-lg mb-6 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {reportType === 'traffic_summary' && 'Traffic Summary Report'}
                  {reportType === 'payment_report' && 'Payment Report'}
                  {reportType === 'violation_report' && 'Violation Report'}
                  {reportType === 'region_report' && 'Region Report'}
                </h3>

                {/* Traffic Summary */}
                {reportType === 'traffic_summary' && (
                  <div className='space-y-6'>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <div className={`rounded-lg p-4 ${
                        darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                      }`}>
                        <p className={`text-sm ${
                          darkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>Total Tickets</p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{reportData.total_tickets || 0}</p>
                      </div>
                      <div className={`rounded-lg p-4 ${
                        darkMode ? 'bg-green-900/30' : 'bg-green-50'
                      }`}>
                        <p className={`text-sm ${
                          darkMode ? 'text-green-300' : 'text-green-600'
                        }`}>Total Revenue</p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>N${(reportData.total_revenue || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Status Breakdown */}
                    {reportData.status_breakdown && (
                      <div>
                        <h4 className={`font-medium mb-3 ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>Status Breakdown</h4>
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                          {reportData.status_breakdown.map((item) => (
                            <div key={item.status} className={`rounded-lg p-3 ${
                              darkMode ? 'bg-slate-600' : 'bg-white'
                            }`}>
                              <p className={`text-sm ${
                                darkMode ? 'text-slate-400' : 'text-gray-500'
                              }`}>{item.status}</p>
                              <p className={`text-xl font-bold ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>{item.count}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Monthly Trends */}
                    {reportData.monthly_trends && (
                      <div>
                        <h4 className={`font-medium mb-3 ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>Monthly Trends</h4>
                        <div className='overflow-x-auto'>
                          <table className='w-full'>
                            <thead>
                              <tr className={darkMode ? 'bg-slate-600' : 'bg-gray-100'}>
                                <th className={`px-4 py-2 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Month</th>
                                <th className={`px-4 py-2 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Tickets</th>
                                <th className={`px-4 py-2 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.monthly_trends.map((item, index) => (
                                <tr key={index} className={`border-b ${
                                  darkMode ? 'border-slate-600' : 'border-gray-200'
                                }`}>
                                  <td className={`px-4 py-2 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{item.month}</td>
                                  <td className={`px-4 py-2 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{item.tickets}</td>
                                  <td className={`px-4 py-2 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>N${item.revenue.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Report */}
                {reportType === 'payment_report' && (
                  <div className='space-y-6'>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                      <div className={`rounded-lg p-4 ${
                        darkMode ? 'bg-green-900/30' : 'bg-green-50'
                      }`}>
                        <p className={`text-sm ${
                          darkMode ? 'text-green-300' : 'text-green-600'
                        }`}>Paid</p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{reportData.paid?.count || 0}</p>
                        <p className={`text-sm ${
                          darkMode ? 'text-green-300' : 'text-green-600'
                        }`}>N${(reportData.paid?.total || 0).toLocaleString()}</p>
                      </div>
                      <div className={`rounded-lg p-4 ${
                        darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
                      }`}>
                        <p className={`text-sm ${
                          darkMode ? 'text-yellow-300' : 'text-yellow-600'
                        }`}>Pending</p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{reportData.pending?.count || 0}</p>
                        <p className={`text-sm ${
                          darkMode ? 'text-yellow-300' : 'text-yellow-600'
                        }`}>N${(reportData.pending?.total || 0).toLocaleString()}</p>
                      </div>
                      <div className={`rounded-lg p-4 ${
                        darkMode ? 'bg-red-900/30' : 'bg-red-50'
                      }`}>
                        <p className={`text-sm ${
                          darkMode ? 'text-red-300' : 'text-red-600'
                        }`}>Overdue</p>
                        <p className={`text-2xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{reportData.overdue?.count || 0}</p>
                        <p className={`text-sm ${
                          darkMode ? 'text-red-300' : 'text-red-600'
                        }`}>N${(reportData.overdue?.total || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Recent Payments */}
                    {reportData.recent_payments && (
                      <div>
                        <h4 className={`font-medium mb-3 ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>Recent Payments</h4>
                        <div className='overflow-x-auto'>
                          <table className='w-full'>
                            <thead>
                              <tr className={darkMode ? 'bg-slate-600' : 'bg-gray-100'}>
                                <th className={`px-4 py-2 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Ticket #</th>
                                <th className={`px-4 py-2 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Plate No</th>
                                <th className={`px-4 py-2 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Amount</th>
                                <th className={`px-4 py-2 text-left text-sm font-medium ${
                                  darkMode ? 'text-slate-300' : 'text-gray-600'
                                }`}>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.recent_payments.map((payment, index) => (
                                <tr key={index} className={`border-b ${
                                  darkMode ? 'border-slate-600' : 'border-gray-200'
                                }`}>
                                  <td className={`px-4 py-2 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{payment.ticket_number}</td>
                                  <td className={`px-4 py-2 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{payment.plate_no}</td>
                                  <td className={`px-4 py-2 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>N${payment.amount.toLocaleString()}</td>
                                  <td className={`px-4 py-2 ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Violation Report */}
                {reportType === 'violation_report' && reportData.violations && (
                  <div>
                    <h4 className={`font-medium mb-3 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>Violation Breakdown</h4>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead>
                          <tr className={darkMode ? 'bg-slate-600' : 'bg-gray-100'}>
                            <th className={`px-4 py-2 text-left text-sm font-medium ${
                              darkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}>Violation Type</th>
                            <th className={`px-4 py-2 text-left text-sm font-medium ${
                              darkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}>Count</th>
                            <th className={`px-4 py-2 text-left text-sm font-medium ${
                              darkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}>Total Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.violations.map((v, index) => (
                            <tr key={index} className={`border-b ${
                              darkMode ? 'border-slate-600' : 'border-gray-200'
                            }`}>
                              <td className={`px-4 py-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>{v.type}</td>
                              <td className={`px-4 py-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>{v.count}</td>
                              <td className={`px-4 py-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>N${v.total_amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Region Report */}
                {reportType === 'region_report' && reportData.regions && (
                  <div>
                    <h4 className={`font-medium mb-3 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>Region Breakdown</h4>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead>
                          <tr className={darkMode ? 'bg-slate-600' : 'bg-gray-100'}>
                            <th className={`px-4 py-2 text-left text-sm font-medium ${
                              darkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}>Region</th>
                            <th className={`px-4 py-2 text-left text-sm font-medium ${
                              darkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}>Count</th>
                            <th className={`px-4 py-2 text-left text-sm font-medium ${
                              darkMode ? 'text-slate-300' : 'text-gray-600'
                            }`}>Total Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.regions.map((r, index) => (
                            <tr key={index} className={`border-b ${
                              darkMode ? 'border-slate-600' : 'border-gray-200'
                            }`}>
                              <td className={`px-4 py-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>{r.region}</td>
                              <td className={`px-4 py-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>{r.count}</td>
                              <td className={`px-4 py-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>N${r.total_amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

