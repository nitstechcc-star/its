import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  FileText,
  Scale,
  Gavel,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  AlertCircle,
  Users,
  Car,
  MapPin,
  Phone,
  Mail,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  Eye,
  Edit,
  XCircle,
  Trash2
} from 'lucide-react'
import {
  getJudgeCases,
  getJudgeCalendar,
  getJudgeNotifications,
  getJudgeStatistics,
  getJudgeCaseDetail,
  scheduleJudgeCourtDate,
  updateCaseJudgment,
  lookupTicket,
} from '../../Axios'
import NotificationsPage from '../NotificationsPage/NotificationsPage.jsx'

// Status badge colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  court: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  disputed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  closed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  paid: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
}

// Ruling options
const rulingOptions = [
  { value: 'guilty', label: 'Guilty', color: 'text-red-600' },
  { value: 'not_guilty', label: 'Not Guilty', color: 'text-green-600' },
  { value: 'adjourned', label: 'Adjourned', color: 'text-yellow-600' },
  { value: 'dismissed', label: 'Dismissed', color: 'text-gray-600' }
]

// Calendar Component
function CalendarView({ events, onEventClick, onDateClick }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []

    // Previous month days
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      })
    }

    return days
  }

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const today = new Date()

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day.date)
          const isToday = day.date.toDateString() === today.toDateString()
          const isCurrentMonth = day.isCurrentMonth

          return (
            <div
              key={index}
              onClick={() => onDateClick(day.date)}
              className={`
                min-h-[80px] p-1 rounded-lg cursor-pointer transition-colors
                ${isCurrentMonth ? 'bg-slate-50 dark:bg-slate-700/50' : 'bg-slate-100 dark:bg-slate-800/50'}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                hover:bg-blue-50 dark:hover:bg-blue-900/20
              `}
            >
              <div className={`
                text-xs font-medium mb-1
                ${isToday ? 'text-blue-600 dark:text-blue-400' : isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}
              `}>
                {day.day}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
                    className="text-[10px] px-1 py-0.5 rounded truncate text-white cursor-pointer"
                    style={{ backgroundColor: event.color || '#3B82F6' }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Case Card Component
function CaseCard({ caseData, onClick, onScheduleCourt }) {
  const status = caseData.status || 'pending'

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white">{caseData.ticket_number}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Car className="w-3 h-3" /> {caseData.plate_no}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.pending}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <FileText className="w-4 h-4 text-blue-500" />
          <span className="capitalize">{caseData.violation_type?.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="truncate">{caseData.location || 'No location'}</span>
        </div>
        {caseData.court_date?.scheduled_date && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-green-500" />
            <span>{new Date(caseData.court_date.scheduled_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onClick() }}
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center justify-center gap-1"
        >
          <Eye className="w-4 h-4" /> View
        </button>
        {status === 'disputed' && (
          <button
            onClick={(e) => { e.stopPropagation(); onScheduleCourt(caseData) }}
            className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 flex items-center justify-center gap-1"
          >
            <Calendar className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Case Detail Modal
function CaseDetailModal({ caseData, onClose, onScheduleCourt, onRecordJudgment }) {
  const [activeTab, setActiveTab] = useState('details')

  if (!caseData) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{caseData.ticket_number}</h2>
              <p className="text-slate-300">{caseData.plate_no} • {caseData.vehicle_make} {caseData.vehicle_model}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 flex gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[caseData.status] || statusColors.pending}`}>
              {caseData.status?.charAt(0).toUpperCase() + caseData.status?.slice(1)}
            </span>
            <span className="px-3 py-1 bg-slate-600 rounded-full text-sm">
              N${caseData.amount?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-1 p-2">
            {['details', 'defendant', 'officer', 'court'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'details' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-white">Violation Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">Violation Type</label>
                    <p className="text-slate-800 dark:text-white capitalize">{caseData.violation_type?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">Location</label>
                    <p className="text-slate-800 dark:text-white">{caseData.location || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">Region</label>
                    <p className="text-slate-800 dark:text-white capitalize">{caseData.region?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-white">Vehicle & Fine</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">Vehicle</label>
                    <p className="text-slate-800 dark:text-white">{caseData.vehicle_year} {caseData.vehicle_make} {caseData.vehicle_model}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">Color</label>
                    <p className="text-slate-800 dark:text-white">{caseData.vehicle_color || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">Fine Amount</label>
                    <p className="text-slate-800 dark:text-white font-bold">N${caseData.amount?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500 dark:text-slate-400">Officer Notes</label>
                <p className="text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700 p-3 rounded-lg mt-1">
                  {caseData.officer_notes || 'No notes available'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'defendant' && (
            <div className="space-y-4">
              {caseData.defendant ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400">Full Name</label>
                        <p className="text-slate-800 dark:text-white font-medium">
                          {caseData.defendant.firstname} {caseData.defendant.lastname}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400">ID Number</label>
                        <p className="text-slate-800 dark:text-white">{caseData.defendant.id_no}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400">License Number</label>
                        <p className="text-slate-800 dark:text-white">{caseData.defendant.license_no || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400">Phone</label>
                        <p className="text-slate-800 dark:text-white flex items-center gap-2">
                          <Phone className="w-4 h-4" /> {caseData.defendant.phone_number || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400">Email</label>
                        <p className="text-slate-800 dark:text-white flex items-center gap-2">
                          <Mail className="w-4 h-4" /> {caseData.defendant.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400">Address</label>
                        <p className="text-slate-800 dark:text-white">{caseData.defendant.physical_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No defendant information on file</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'officer' && (
            <div className="space-y-4">
              {caseData.officer ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400">Badge Number</label>
                      <p className="text-slate-800 dark:text-white font-medium">{caseData.officer.badge}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400">Rank</label>
                      <p className="text-slate-800 dark:text-white">{caseData.officer.rank || 'Officer'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400">Username</label>
                      <p className="text-slate-800 dark:text-white">{caseData.officer.username}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400">Date Issued</label>
                      <p className="text-slate-800 dark:text-white">
                        {caseData.date ? new Date(caseData.date).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No officer information available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'court' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 dark:text-white mb-3">Court Information</h4>
                {caseData.court_date ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400">Scheduled Date</label>
                      <p className="text-slate-800 dark:text-white font-medium">
                        {caseData.court_date.scheduled_date ? new Date(caseData.court_date.scheduled_date).toLocaleString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400">Location</label>
                      <p className="text-slate-800 dark:text-white">{caseData.court_date.location || 'Not specified'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 dark:text-slate-400">Notes</label>
                      <p className="text-slate-800 dark:text-white">{caseData.court_date.notes || 'No notes'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No court date scheduled</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          {caseData.status === 'disputed' && (
            <button
              onClick={() => onScheduleCourt(caseData)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Schedule Court Date
            </button>
          )}
          {caseData.status === 'court' && (
            <button
              onClick={() => onRecordJudgment(caseData)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
            >
              <Gavel className="w-4 h-4" /> Record Judgment
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Schedule Court Modal
function ScheduleCourtModal({ caseData, onClose, onSchedule }) {
  const [formData, setFormData] = useState({
    scheduled_date: '',
    location: 'Windhoek Magistrate Court',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSchedule(caseData.id, formData)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Schedule Court Date</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{caseData?.ticket_number}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Court Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Court Location
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option>Windhoek Magistrate Court</option>
              <option>Swakopmund Magistrate Court</option>
              <option>Walvis Bay Magistrate Court</option>
              <option>Keetmanshoop Magistrate Court</option>
              <option>Rundu Magistrate Court</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Schedule
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Judgment Modal
function JudgmentModal({ caseData, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    judgment: '',
    ruling: '',
    status: 'closed'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(caseData.id, formData.judgment, formData.ruling, formData.status)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-500" /> Record Judgment
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{caseData?.ticket_number}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Ruling
            </label>
            <div className="grid grid-cols-2 gap-2">
              {rulingOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, ruling: option.value })}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    formData.ruling === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Judgment Notes
            </label>
            <textarea
              rows={4}
              required
              value={formData.judgment}
              onChange={(e) => setFormData({ ...formData, judgment: e.target.value })}
              placeholder="Enter judgment details..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Final Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="closed">Closed - Case Resolved</option>
              <option value="paid">Paid - Fine Settled</option>
              <option value="court">Re-scheduled</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.ruling}
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
              Record Judgment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Create Event Modal
function CreateEventModal({ selectedDate, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate ? selectedDate.toISOString().slice(0, 16) : '',
    location: '',
    description: '',
    color: '#3B82F6'
  })
  const [loading, setLoading] = useState(false)

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue', bg: 'bg-blue-500' },
    { value: '#10B981', label: 'Green', bg: 'bg-green-500' },
    { value: '#F59E0B', label: 'Amber', bg: 'bg-amber-500' },
    { value: '#EF4444', label: 'Red', bg: 'bg-red-500' },
    { value: '#8B5CF6', label: 'Purple', bg: 'bg-purple-500' },
    { value: '#EC4899', label: 'Pink', bg: 'bg-pink-500' },
    { value: '#06B6D4', label: 'Cyan', bg: 'bg-cyan-500' },
    { value: '#F97316', label: 'Orange', bg: 'bg-orange-500' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.date) {
      alert('Please fill in required fields')
      return
    }
    setLoading(true)
    await onSave(formData)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" /> Create Event
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a date'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Event Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: option.value })}
                  className={`w-8 h-8 rounded-full ${option.bg} transition-transform ${
                    formData.color === option.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                  }`}
                  title={option.label}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create Event
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main Judge Dashboard Component
export default function JudgeDashboard() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [customEvents, setCustomEvents] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [error, setError] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Modals
  const [selectedCase, setSelectedCase] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showJudgmentModal, setShowJudgmentModal] = useState(false)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [scheduleForCase, setScheduleForCase] = useState(null)
  const [judgmentForCase, setJudgmentForCase] = useState(null)

  // Current view
  const [view, setView] = useState('dashboard') // dashboard, cases, calendar

  // Load custom events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('judge_custom_events')
    if (savedEvents) {
      try {
        setCustomEvents(JSON.parse(savedEvents))
      } catch (e) {
        console.error('Error loading custom events:', e)
      }
    }
  }, [])

  // Save custom events to localStorage
  const saveCustomEvents = (events) => {
    localStorage.setItem('judge_custom_events', JSON.stringify(events))
    setCustomEvents(events)
  }

  // Add new custom event
  const handleCreateEvent = (eventData) => {
    const newEvent = {
      id: `custom_${Date.now()}`,
      title: eventData.title,
      date: new Date(eventData.date).toISOString(),
      location: eventData.location,
      description: eventData.description,
      color: eventData.color,
      isCustom: true
    }
    const updatedEvents = [...customEvents, newEvent]
    saveCustomEvents(updatedEvents)
    setShowCreateEventModal(false)
    setSelectedDate(null)
  }

  // Delete custom event
  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = customEvents.filter(e => e.id !== eventId)
      saveCustomEvents(updatedEvents)
    }
  }

  // Merge custom events with calendar events (court dates)
  const allEvents = [
    ...calendarEvents.map(e => ({ ...e, isCustom: false })),
    ...customEvents
  ]

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [casesData, calendarData, statsData, notificationsData] = await Promise.all([
        getJudgeCases(statusFilter),
        getJudgeCalendar(),
        getJudgeStatistics(),
        getJudgeNotifications()
      ])

      if (casesData.success !== false) {
        setCases(casesData.data || casesData || [])
      }

      if (calendarData.success !== false) {
        setCalendarEvents(calendarData.data || calendarData || [])
      }

      if (statsData.success !== false) {
        setStatistics(statsData.data || statsData)
      }

      if (notificationsData.success !== false && notificationsData.data) {
        setNotifications(notificationsData.data || [])
        setUnreadCount(notificationsData.unread_count || 0)
      }
    } catch (err) {
      console.error('Error fetching judge data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [statusFilter])

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

  // Filter and paginate cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = !searchQuery ||
      c.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.plate_no?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage)
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handlers
  const handleScheduleCourt = async (caseId, data) => {
    const result = await scheduleJudgeCourtDate({
      ticket_id: caseId,
      scheduled_date: data.scheduled_date,
      location: data.location,
      notes: data.notes
    })

    if (result.success) {
      setShowScheduleModal(false)
      setScheduleForCase(null)
      fetchData()
    } else {
      alert(result.error || 'Failed to schedule court date')
    }
  }

  const handleRecordJudgment = async (caseId, judgment, ruling, status) => {
    const result = await updateCaseJudgment(caseId, judgment, ruling, status)

    if (result.success) {
      setShowJudgmentModal(false)
      setJudgmentForCase(null)
      fetchData()
    } else {
      alert(result.error || 'Failed to record judgment')
    }
  }

  const handleEventClick = async (event) => {
    // Check if it's a custom event
    if (event.isCustom) {
      // Show custom event details or handle differently
      alert(`Custom Event: ${event.title}\n\nLocation: ${event.location || 'Not specified'}\nDescription: ${event.description || 'No description'}`)
      return
    }
    // For court dates, get case details
    const result = await getJudgeCaseDetail(event.id)
    if (result.success) {
      setSelectedCase(result.data)
    }
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setShowCreateEventModal(true)
  }

  // Stats - Modern gradient cards
  const stats = [
    {
      title: 'Pending Court',
      value: statistics?.pending_court || 0,
      icon: Clock,
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600'
    },
    {
      title: 'Disputed Cases',
      value: statistics?.disputed || 0,
      icon: AlertCircle,
      gradientFrom: 'from-red-500',
      gradientTo: 'to-red-600'
    },
    {
      title: 'Resolved',
      value: statistics?.resolved || 0,
      icon: Check,
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-600'
    },
    {
      title: 'This Month',
      value: statistics?.this_month || 0,
      icon: Calendar,
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600'
    }
  ]

  // Render stat card
  const renderStatCard = (stat) => (
    <div
      key={stat.title}
      className={`group relative overflow-hidden rounded-xl bg-linear-to-br ${stat.gradientFrom} ${stat.gradientTo} p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <stat.icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold">{stat.value}</p>
        <p className="text-white/80 text-xs font-medium">{stat.title}</p>
      </div>
    </div>
  )

  if (loading && !cases.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 bg-yellow-500 text-amber-900 text-sm font-bold rounded-lg shadow-lg flex items-center gap-2">
              <Scale className="w-4 h-4" /> Traffic Court Magistrate
            </span>
            <div>
              <h1 className="text-2xl font-bold">Traffic Court Magistrate Dashboard</h1>
              <p className="text-amber-100 text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('notifications')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                view === 'notifications' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setView('cases')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'cases' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Cases
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'calendar' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Modern Gradient Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map(renderStatCard)}
      </div>

      {/* Notifications View */}
      {view === 'notifications' && (
        <NotificationsPage />
      )}

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <CalendarView
              events={allEvents}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          </div>

          {/* Upcoming Hearings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" /> Upcoming Events
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {allEvents
                .filter(e => new Date(e.date) >= new Date())
                .slice(0, 5)
                .map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white text-sm">{event.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{event.location}</p>
                      </div>
                      {event.isCustom ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id) }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[event.status] || statusColors.pending}`}>
                          {event.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                ))}
              {allEvents.filter(e => new Date(e.date) >= new Date()).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-slate-500 dark:text-slate-400">No upcoming events</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click on a date to create one</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cases View */}
      {view === 'cases' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search cases..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="court">Court</option>
                <option value="disputed">Disputed</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <button
                onClick={fetchData}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCases.map(caseItem => (
              <CaseCard
                key={caseItem.id}
                caseData={caseItem}
                onClick={() => setSelectedCase(caseItem)}
                onScheduleCourt={(c) => { setScheduleForCase(c); setShowScheduleModal(true) }}
              />
            ))}
          </div>

          {paginatedCases.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No cases found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCases.length)} of {filteredCases.length} cases
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <CalendarView
          events={allEvents}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onScheduleCourt={(c) => { setSelectedCase(null); setScheduleForCase(c); setShowScheduleModal(true) }}
          onRecordJudgment={(c) => { setSelectedCase(null); setJudgmentForCase(c); setShowJudgmentModal(true) }}
        />
      )}

      {/* Schedule Court Modal */}
      {showScheduleModal && scheduleForCase && (
        <ScheduleCourtModal
          caseData={scheduleForCase}
          onClose={() => { setShowScheduleModal(false); setScheduleForCase(null) }}
          onSchedule={handleScheduleCourt}
        />
      )}

      {/* Judgment Modal */}
      {showJudgmentModal && judgmentForCase && (
        <JudgmentModal
          caseData={judgmentForCase}
          onClose={() => { setShowJudgmentModal(false); setJudgmentForCase(null) }}
          onSubmit={handleRecordJudgment}
        />
      )}

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <CreateEventModal
          selectedDate={selectedDate}
          onClose={() => { setShowCreateEventModal(false); setSelectedDate(null) }}
          onSave={handleCreateEvent}
        />
      )}
    </div>
  )
}

