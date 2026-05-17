import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Users,
  FileWarning,
  Newspaper,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Ticket,
  TrendingUp,
  AlertCircle,
  Calendar,
  Shield
} from 'lucide-react'

// Mock data for demonstration - in production this would come from the API
const mockIncidents = [
  { id: 1, type: 'traffic_jam', title: 'Heavy Traffic', location: 'Independence Ave, Windhoek', severity: 'high', time: '10 min ago' },
  { id: 2, type: 'accident', title: 'Vehicle Collision', location: 'B1 Road, Okahandja', severity: 'critical', time: '25 min ago' },
  { id: 3, type: 'police_check', title: 'Police Checkpoint', location: 'Mandume Street', severity: 'low', time: '5 min ago' },
  { id: 4, type: 'construction', title: 'Road Works', location: 'Sam Nujoma Drive', severity: 'medium', time: '1 hour ago' },
]

const mockMissingPersons = [
  { id: 1, name: 'John Smith', age: 35, gender: 'male', lastSeen: 'Katutura, Windhoek', time: '2 days ago', photo: null },
  { id: 2, name: 'Maria Kang', age: 28, gender: 'female', lastSeen: 'Swakopmund', time: '1 week ago', photo: null },
]

const mockWarrants = [
  { id: 1, name: 'Peter //Kxui', warrantNo: 'WAR-2026-001', offense: 'Outstanding Traffic Fines', issueDate: '2026-01-15' },
  { id: 2, name: 'Hans K.,', warrantNo: 'WAR-2026-002', offense: 'Hit and Run', issueDate: '2026-02-20' },
]

const mockNews = [
  { id: 1, title: 'New Traffic Regulations', category: 'policy', priority: 'high', time: '2 hours ago' },
  { id: 2, title: 'Road Closure Update', category: 'traffic', priority: 'medium', time: '5 hours ago' },
  { id: 3, title: 'Weather Alert: Heavy Rains', category: 'weather', priority: 'high', time: '1 day ago' },
]

// Carousel Section Component - defined outside to avoid recreation on render
function CarouselSection({ title, icon: Icon, items, page, setPage, renderItem, emptyMessage, darkMode }) {
  const itemsPerPage = 3
  const totalPages = Math.ceil(items.length / itemsPerPage) || 1
  const visibleItems = items.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

  const nextPage = () => setPage((p) => (p + 1) % totalPages)
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages)

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-500" />
          <span className={`font-bold text-lg ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>{title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevPage} className={`p-1 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
          }`}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className={`text-xs ${
            darkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>{page + 1}/{totalPages}</span>
          <button onClick={nextPage} className={`p-1 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
          }`}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className={`text-center py-4 ${
            darkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>{emptyMessage}</p>
        ) : (
          visibleItems.map((item) => renderItem(item, darkMode))
        )}
      </div>
    </div>
  )
}

export default function OfficerDashboard({ onPageChange }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    tickets_today: 0,
    total_tickets: 0,
    active_incidents: 0,
    missing_persons: 0,
    active_warrants: 0,
    recent_news: 0
  })

  // Carousel states
  const [incidentsPage, setIncidentsPage] = useState(0)
  const [missingPage, setMissingPage] = useState(0)
  const [warrantsPage, setWarrantsPage] = useState(0)
  const [newsPage, setNewsPage] = useState(0)

  // Initialize dark mode on mount
  useEffect(() => {
    // Check both localStorage and document class
    const checkDarkMode = () => {
      const stored = localStorage.getItem('darkMode')
      const isDark = stored === 'true' || document.documentElement.classList.contains('dark')
      setDarkMode(isDark)
    }

    // Initial check
    checkDarkMode()

    // Listen for changes
    const handleStorage = () => checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)

    window.addEventListener('storage', handleStorage)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    // Also poll periodically in case class changes without storage event
    const interval = setInterval(checkDarkMode, 500)

    return () => {
      window.removeEventListener('storage', handleStorage)
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setSummary({
        tickets_today: 12,
        total_tickets: 156,
        active_incidents: mockIncidents.length,
        missing_persons: mockMissingPersons.length,
        active_warrants: mockWarrants.length,
        recent_news: mockNews.length
      })
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'traffic_jam': return <AlertCircle className="w-4 h-4" />
      case 'accident': return <AlertTriangle className="w-4 h-4" />
      case 'police_check': return <Users className="w-4 h-4" />
      case 'construction': return <MapPin className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  // Render functions for carousel items
  const renderIncidentItem = (item, isDark) => (
    <div key={item.id} className={`p-3 rounded-lg ${
      isDark ? 'bg-slate-700/50' : 'bg-gray-50'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${getSeverityColor(item.severity)}/20`}>
            {getCategoryIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>{item.title}</p>
            <p className={`text-xs truncate ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>{item.location}</p>
          </div>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${
          getSeverityColor(item.severity)}/20 ${getSeverityColor(item.severity)} text-white
        }`}>
          {item.severity}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
        <Clock className="w-3 h-3" />
        {item.time}
      </div>
    </div>
  )

  const renderMissingPersonItem = (item, isDark) => (
    <div key={item.id} className={`p-3 rounded-lg ${
      isDark ? 'bg-slate-700/50' : 'bg-gray-50'
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
          {item.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>{item.name}</p>
          <p className={`text-xs ${
            isDark ? 'text-slate-400' : 'text-gray-500'
          }`}>Age: {item.age} • {item.gender}</p>
          <p className={`text-xs truncate ${
            isDark ? 'text-slate-500' : 'text-gray-400'
          }`}>{item.lastSeen}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
        <Clock className="w-3 h-3" />
        Last seen: {item.time}
      </div>
    </div>
  )

  const renderWarrantItem = (item, isDark) => (
    <div key={item.id} className={`p-3 rounded-lg ${
      isDark ? 'bg-slate-700/50' : 'bg-gray-50'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>{item.name}</p>
          <p className={`text-xs font-mono ${
            isDark ? 'text-purple-400' : 'text-purple-600'
          }`}>{item.warrantNo}</p>
        </div>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-500">
          Active
        </span>
      </div>
      <p className={`text-xs mt-1.5 truncate ${
        isDark ? 'text-slate-400' : 'text-gray-500'
      }`}>{item.offense}</p>
      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
        <Clock className="w-3 h-3" />
        Issued: {item.issueDate}
      </div>
    </div>
  )

  const renderNewsItem = (item, isDark) => (
    <div key={item.id} className={`p-3 rounded-lg ${
      isDark ? 'bg-slate-700/50' : 'bg-gray-50'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>{item.title}</p>
          <p className={`text-xs capitalize ${
            isDark ? 'text-slate-400' : 'text-gray-500'
          }`}>{item.category}</p>
        </div>
        {item.priority === 'high' && (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-500">
            Urgent
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
        <Clock className="w-3 h-3" />
        {item.time}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className='space-y-6 m-5'>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className='text-2xl font-bold'>Officer Dashboard</h1>
              <p className='text-slate-300 text-sm flex items-center gap-2 mt-1'>
                <Calendar className='w-4 h-4' />
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => window.location.reload()}
              className='flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors'
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className='text-sm font-medium'>Refresh</span>
            </button>
            <div className='flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-xl px-4 py-2'>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className='text-sm font-medium'>On Duty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
        {/* Today */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{summary.tickets_today}</p>
            <p className="text-blue-100 text-xs font-medium">Tickets Today</p>
          </div>
        </div>

        {/* Total Tickets */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{summary.total_tickets}</p>
            <p className="text-emerald-100 text-xs font-medium">Total Tickets</p>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{summary.active_incidents}</p>
            <p className="text-orange-100 text-xs font-medium">Active Incidents</p>
          </div>
        </div>

        {/* Missing Persons */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{summary.missing_persons}</p>
            <p className="text-red-100 text-xs font-medium">Missing Persons</p>
          </div>
        </div>

        {/* Warrants */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileWarning className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{summary.active_warrants}</p>
            <p className="text-purple-100 text-xs font-medium">Active Warrants</p>
          </div>
        </div>

        {/* News */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Newspaper className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{summary.recent_news}</p>
            <p className="text-indigo-100 text-xs font-medium">News Updates</p>
          </div>
        </div>
      </div>

      {/* Carousels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traffic Incidents Carousel */}
        <CarouselSection
          title="Traffic Incidents"
          icon={AlertTriangle}
          items={mockIncidents}
          page={incidentsPage}
          setPage={setIncidentsPage}
          emptyMessage="No active incidents"
          renderItem={renderIncidentItem}
          darkMode={darkMode}
        />

        {/* Missing Persons Carousel */}
        <CarouselSection
          title="Missing Persons"
          icon={Users}
          items={mockMissingPersons}
          page={missingPage}
          setPage={setMissingPage}
          emptyMessage="No missing persons"
          renderItem={renderMissingPersonItem}
          darkMode={darkMode}
        />

        {/* Warrants of Arrest Carousel */}
        <CarouselSection
          title="Warrants of Arrest"
          icon={FileWarning}
          items={mockWarrants}
          page={warrantsPage}
          setPage={setWarrantsPage}
          emptyMessage="No active warrants"
          renderItem={renderWarrantItem}
          darkMode={darkMode}
        />

        {/* News Carousel */}
        <CarouselSection
          title="Current News"
          icon={Newspaper}
          items={mockNews}
          page={newsPage}
          setPage={setNewsPage}
          emptyMessage="No news available"
          renderItem={renderNewsItem}
          darkMode={darkMode}
        />
      </div>

      {/* Quick Actions */}
      <div className={`rounded-xl border p-5 shadow-sm ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`font-bold text-lg mb-4 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onPageChange && onPageChange('issue_ticket')}
            className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
              darkMode ? 'bg-slate-700/50 border-slate-600 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-500'
            }`}
          >
            <Ticket className={`w-6 h-6 mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Issue Ticket</p>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Create new ticket</p>
          </button>

          <button
            onClick={() => onPageChange && onPageChange('ticket_management')}
            className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
              darkMode ? 'bg-slate-700/50 border-slate-600 hover:border-orange-500' : 'bg-gray-50 border-gray-200 hover:border-orange-500'
            }`}
          >
            <AlertTriangle className={`w-6 h-6 mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Manage Tickets</p>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>View & manage tickets</p>
          </button>

          <button
            onClick={() => onPageChange && onPageChange('natis_admin')}
            className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
              darkMode ? 'bg-slate-700/50 border-slate-600 hover:border-purple-500' : 'bg-gray-50 border-gray-200 hover:border-purple-500'
            }`}
          >
            <MapPin className={`w-6 h-6 mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>NaTIS</p>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Vehicle & license</p>
          </button>

          <button
            onClick={() => onPageChange && onPageChange('settings')}
            className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
              darkMode ? 'bg-slate-700/50 border-slate-600 hover:border-green-500' : 'bg-gray-50 border-gray-200 hover:border-green-500'
            }`}
          >
            <Shield className={`w-6 h-6 mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Settings</p>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Profile & settings</p>
          </button>
        </div>
      </div>
    </div>
  )
}

