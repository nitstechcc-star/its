import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useAuth } from '../context/useAuth'
import { logout } from '../../Axios'
import {
  LayoutDashboard,
  Ticket,
  CheckCircle,
  BarChart3,
  Settings,
  Menu
} from 'lucide-react'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const { logout: authLogout } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      authLogout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      authLogout()
      navigate('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const mobileNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'issue_ticket', icon: Ticket, label: 'Ticket' },
    { id: 'ticket_management', icon: CheckCircle, label: 'Tickets' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 z-100 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
            <p className="text-white text-lg font-medium">Signing out...</p>
            <p className="text-slate-400 text-sm mt-1">Please wait</p>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-gradient-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 transition-all duration-500 ${darkMode && 'dark'}`}>
        <div className="hidden lg:flex h-screen">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onLogout={handleLogout}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              darkMode={darkMode}
              toggleDarkMode={() => setDarkMode(!darkMode)}
              onLogout={handleLogout}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
            <main className={`transition-colors duration-500 flex-1 overflow-y-auto overflow-x-hidden bg-slate-200 dark:bg-gray-950 ${darkMode && 'dark'}`}>
              <div className="space-y-6 p-4 sm:p-6 min-h-0">
                {children}
              </div>
            </main>
          </div>
        </div>

        <div className="lg:hidden flex flex-col h-screen">
          <Header
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(!darkMode)}
            onLogout={handleLogout}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          <main className={`flex-1 overflow-y-auto overflow-x-hidden bg-slate-200 dark:bg-gray-950 pb-20 ${darkMode && 'dark'}`}>
            <div className="space-y-6 p-4 min-h-0">
              {children}
            </div>
          </main>

          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-70 shadow-lg">
            <nav className="flex justify-around items-center h-16">
              {mobileNavItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                    <span className={`text-xs mt-1 ${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}

