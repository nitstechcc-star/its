import { useState, useEffect } from 'react';
import IssueTicket from './IssueTicket';
import { Car, FileText, Search, Plus, X, Eye, RefreshCw, Clock, MapPin } from 'lucide-react';
import { getAllOfficerTickets, searchTickets, lookupTicket } from '../../Axios';

export default function TrafficManagement() {
  const darkMode = localStorage.getItem('darkMode') === 'true';

  // Modal state for IssueTicket
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Load tickets on mount
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const result = await getAllOfficerTickets();
      if (result.success || Array.isArray(result)) {
        setTickets(result.data || result || []);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTickets();
      return;
    }
    setLoading(true);
    try {
      const result = await lookupTicket(searchQuery);
      if (result.success) {
        setTickets(result.data || []);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = async (status) => {
    setStatusFilter(status);
    setLoading(true);
    try {
      if (status) {
        const result = await searchTickets({ status, q: searchQuery });
        setTickets(result.data || []);
      } else {
        loadTickets();
      }
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketIssued = () => {
    setIssueModalOpen(false);
    loadTickets();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      disputed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      court: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NA', {
      style: 'currency',
      currency: 'NAD',
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-xl border p-6 ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Ticket Management</h1>
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Issue traffic tickets and manage violations
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={loadTickets}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIssueModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Issue New Ticket
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              darkMode ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by ticket number or plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className={`pl-10 pr-4 py-2 rounded-lg w-full ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="disputed">Disputed</option>
              <option value="court">Court</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className={`rounded-xl border overflow-hidden ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        {/* Table Header */}
        <div className={`px-6 py-4 border-b ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {tickets.length} Ticket{tickets.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto hide-scrollbar scrollbar-thin">
          <table className="w-full">
            <thead className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Ticket #
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Plate No.
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Violation
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Amount
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Location
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              darkMode ? 'divide-slate-700' : 'divide-gray-200'
            }`}>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>
                        Loading tickets...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <FileText className={`w-12 h-12 mx-auto mb-3 ${
                      darkMode ? 'text-slate-600' : 'text-gray-300'
                    }`} />
                    <p className={darkMode ? 'text-slate-400' : 'text-gray-500'}>
                      No tickets found
                    </p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket, index) => (
                  <tr key={ticket.id || index} className={`${
                    darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
                  } transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-mono text-sm font-medium ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {ticket.ticket_issued || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {ticket.plate_no || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>
                        {ticket.violation_type ?
                          ticket.violation_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : '-'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {formatAmount(ticket.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className={`w-3 h-3 ${
                          darkMode ? 'text-slate-500' : 'text-gray-400'
                        }`} />
                        <span className={darkMode ? 'text-slate-300' : 'text-gray-600'}>
                          {ticket.location || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className={`w-3 h-3 ${
                          darkMode ? 'text-slate-500' : 'text-gray-400'
                        }`} />
                        <span className={darkMode ? 'text-slate-300' : 'text-gray-600'}>
                          {formatDate(ticket.date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(ticket.status)
                      }`}>
                        {ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode
                            ? 'hover:bg-slate-600 text-slate-400 hover:text-blue-400'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'
                        }`}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Ticket Modal */}
      <IssueTicket
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        onSuccess={handleTicketIssued}
      />

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
          <div className={`bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl border ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'
            }`}>
              <div>
                <h2 className={`text-lg font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Ticket Details</h2>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {selectedTicket.ticket_issued}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-200 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div className="col-span-full">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    getStatusColor(selectedTicket.status)
                  }`}>
                    {selectedTicket.status ? selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1) : 'Pending'}
                  </span>
                </div>

                {/* Vehicle Info */}
                <div>
                  <label className={`text-xs uppercase tracking-wide ${
                    darkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>Plate Number</label>
                  <p className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedTicket.plate_no || '-'}</p>
                </div>

                <div>
                  <label className={`text-xs uppercase tracking-wide ${
                    darkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>Fine Amount</label>
                  <p className={`text-lg font-semibold ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`}>{formatAmount(selectedTicket.amount)}</p>
                </div>

                {/* Vehicle Details */}
                <div>
                  <label className={`text-xs uppercase tracking-wide ${
                    darkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>Vehicle Make</label>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                    {selectedTicket.vehicle_make || '-'}
                  </p>
                </div>

                <div>
                  <label className={`text-xs uppercase tracking-wide ${
                    darkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>Vehicle Model</label>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                    {selectedTicket.vehicle_model || '-'}
                  </p>
                </div>

                <div>
                  <label className={`text-xs uppercase tracking-wide ${
                    darkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>Vehicle Color</label>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                    {selectedTicket.vehicle_color || '-'}
                  </p>
                </div>

                <div>
                  <label className={`text-xs uppercase tracking-wide ${
                    darkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>Vehicle Year</label>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                    {selectedTicket.vehicle_year || '-'}
                  </p>
                </div>

                {/* Violation */}
                <div className="col-span-full">
                  <label className={`text-xs uppercase tracking-wide ${
                    darkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>Violation Type</label>
                  <p className={`text-lg ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedTicket.violation_type ?
                      selectedTicket.violation_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : '-'
                    }
                  </p>
                </div>

                {/* Location */}
                <div className="col-span-full">
                  <label className={`text-xs uppercase tracking-wide ${
                    darkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>Location</label>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                    {selectedTicket.location || '-'}
                  </p>
                </div>

                {/* Date */}
                <div>
                  <label className={`text-xs uppercase tracking-wide ${
                    darkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>Issue Date</label>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                    {formatDate(selectedTicket.date)}
                  </p>
                </div>

                <div>
                  <label className={`text-xs uppercase tracking-wide ${
                    darkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>Due Date</label>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                    {formatDate(selectedTicket.due_date)}
                  </p>
                </div>

                {/* Officer Notes */}
                {selectedTicket.officer_notes && (
                  <div className="col-span-full">
                    <label className={`text-xs uppercase tracking-wide ${
                      darkMode ? 'text-slate-500' : 'text-gray-500'
                    }`}>Officer Notes</label>
                    <p className={`mt-1 p-3 rounded-lg ${
                      darkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-50 text-gray-700'
                    }`}>
                      {selectedTicket.officer_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${
              darkMode ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setSelectedTicket(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

