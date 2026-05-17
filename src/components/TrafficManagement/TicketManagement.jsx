import { useState, useEffect } from 'react'
import {
  Search, RefreshCw, CheckCircle, XCircle, Clock,
  AlertTriangle, FileText, X, Save, Calendar, Car, MapPin, Edit
} from 'lucide-react'
import {
  getAllOfficerTickets, lookupTicket, resolveTicket,
  updateTicketStatus, getTicketManagement
} from '../../Axios'

export default function TicketManagement() {
  // State
  const [tickets, setTickets] = useState([])
  const [management, setManagement] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    overdue: 0,
    disputed: 0,
    court: 0,
    closed: 0
  })

  // Load data on mount
  useEffect(() => {
    loadTickets()
    loadManagement()
  }, [])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const result = await getAllOfficerTickets()
      if (result.success || Array.isArray(result)) {
        const ticketData = result.data || result || []
        setTickets(ticketData)
        calculateStats(ticketData)
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadManagement = async () => {
    try {
      const result = await getTicketManagement()
      if (result.success) {
        setManagement(result.data || [])
      }
    } catch (error) {
      console.error('Error loading management:', error)
    }
  }

  const calculateStats = (ticketData) => {
    const newStats = {
      total: ticketData.length,
      pending: ticketData.filter(t => t.status === 'pending').length,
      paid: ticketData.filter(t => t.status === 'paid').length,
      overdue: ticketData.filter(t => t.status === 'overdue').length,
      disputed: ticketData.filter(t => t.status === 'disputed').length,
      court: ticketData.filter(t => t.status === 'court').length,
      closed: ticketData.filter(t => t.status === 'closed').length
    }
    setStats(newStats)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTickets()
      return
    }
    setLoading(true)
    try {
      const result = await lookupTicket(searchQuery)
      if (result.success) {
        setTickets(result.data || [])
        calculateStats(result.data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedTicket || !selectedStatus) return

    setLoading(true)
    try {
      const result = await updateTicketStatus(selectedTicket.id, selectedStatus)
      if (result.success) {
        await loadTickets()
        setShowStatusModal(false)
        setSelectedTicket(null)
        setSelectedStatus('')
      }
    } catch (error) {
      console.error('Status update error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    if (!selectedTicket) return

    setLoading(true)
    try {
      const status = selectedStatus || 'closed'
      const result = await resolveTicket(selectedTicket.id, resolutionNotes, status)
      if (result.success) {
        await loadTickets()
        await loadManagement()
        setShowResolveModal(false)
        setSelectedTicket(null)
        setResolutionNotes('')
        setSelectedStatus('')
      }
    } catch (error) {
      console.error('Resolve error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openResolveModal = (ticket) => {
    setSelectedTicket(ticket)
    setShowResolveModal(true)
  }

  const openStatusModal = (ticket) => {
    setSelectedTicket(ticket)
    setSelectedStatus(ticket.status)
    setShowStatusModal(true)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      disputed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      court: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      paid: <CheckCircle className="w-4 h-4" />,
      overdue: <AlertTriangle className="w-4 h-4" />,
      disputed: <FileText className="w-4 h-4" />,
      court: <Calendar className="w-4 h-4" />,
      closed: <XCircle className="w-4 h-4" />,
    }
    return icons[status] || icons.pending
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NA', {
      style: 'currency',
      currency: 'NAD',
    }).format(amount || 0)
  }

  const statCards = [
    { key: 'total', label: 'Total', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { key: 'pending', label: 'Pending', icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { key: 'paid', label: 'Paid', icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { key: 'overdue', label: 'Overdue', icon: AlertTriangle, color: 'from-red-500 to-red-600' },
    { key: 'disputed', label: 'Disputed', icon: FileText, color: 'from-purple-500 to-purple-600' },
    { key: 'court', label: 'Court', icon: Calendar, color: 'from-indigo-500 to-indigo-600' },
    { key: 'closed', label: 'Closed', icon: XCircle, color: 'from-gray-500 to-gray-600' },
  ]

  return (
    <div className="space-y-6 m-5">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.key}
            className={`relative overflow-hidden rounded-xl p-4 bg-linear-to-br ${stat.color} shadow-lg`}
          >
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <stat.icon className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{stats[stat.key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="rounded-xl border overflow-hidden backdrop-blur-sm bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 border-gray-200 dark:border-slate-700">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets by number or plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
              }}
              className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="disputed">Disputed</option>
              <option value="court">Court</option>
              <option value="closed">Closed</option>
            </select>

            <button
              onClick={loadTickets}
              className="p-2.5 rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Ticket #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Violation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-gray-500 dark:text-slate-400">
                        Loading tickets...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
                    <p className="text-gray-500 dark:text-slate-400">
                      No tickets found
                    </p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket, index) => (
                  <tr key={ticket.id || index} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {ticket.ticket_issued || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {ticket.plate_no || '-'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-500">
                        {ticket.vehicle_make} {ticket.vehicle_model}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-gray-700 dark:text-slate-300">
                        {ticket.violation_type ?
                          ticket.violation_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : '-'
                        }
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatAmount(ticket.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 max-w-150px">
                        <MapPin className="w-3 h-3 shrink-0 text-gray-400 dark:text-slate-500" />
                        <span className="text-sm truncate text-gray-600 dark:text-slate-300">
                          {ticket.location || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-gray-600 dark:text-slate-300">
                        {formatDate(ticket.date)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openStatusModal(ticket)}
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-500 hover:text-blue-600 dark:hover:bg-slate-600 dark:text-slate-400 dark:hover:text-blue-400"
                          title="Change Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openResolveModal(ticket)}
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-500 hover:text-green-600 dark:hover:bg-slate-600 dark:text-slate-400 dark:hover:text-green-400"
                          title="Resolve Ticket"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b flex items-center justify-between border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Resolve Ticket
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {selectedTicket?.ticket_issued}
                </p>
              </div>
              <button
                onClick={() => setShowResolveModal(false)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                  Resolution Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="paid">Paid</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter resolution details..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg resize-none bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-5 py-2.5 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={loading}
                className="px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b flex items-center justify-between border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Update Status
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {selectedTicket?.ticket_issued}
                </p>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                Select New Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['pending', 'paid', 'overdue', 'disputed', 'court', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedStatus === status
                        ? getStatusColor(status) + ' ring-2 ring-offset-2 ring-blue-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-5 py-2.5 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={loading || !selectedStatus}
                className="px-5 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

