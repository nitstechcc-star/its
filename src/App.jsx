
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/useAuth'
import { logout } from './Axios'

// Layout Components
import Sidebar from './components/layouts/Sidebar'
import Header from './components/layouts/Header'

// Icons
import {
  LayoutDashboard,
  Ticket,
  CheckCircle,
  BarChart3,
  Settings,
  Scale,
  Users,
  UserPlus,
  Car,
} from 'lucide-react'

// Pages
import Dashboard from './components/Dashboard/AdminDashboard'
import OfficerDashboard from './components/Dashboard/OfficerDashboard'
import SettingsPage from './components/SettingsPage/SettingsPage'
import IssueTicketPage from './components/TrafficManagement/IssueTicketPage'
import TicketManagement from './components/TrafficManagement/TicketManagement'
import OfficerManagement from './components/OfficerManagement/OfficerManagement'
import AnalyticsOverview from './components/Analytics/AnalyticsOverview'
import HelpCenter from './components/HelpCenter/HelpCenter'
import JudgeDashboard from './components/Dashboard/JudgeDashboard'
import DefendantFile from './components/Dashboard/DefendantFile'
import UserManagement from './components/UserManagement/UserManagement'
import NaTISAdminDashboard from './components/Dashboard/NaTISAdminDashboard'
import NampolDashboard from './components/Dashboard/NampolDashboard'
import MinistryDashboard from './components/Dashboard/MinistryDashboard'
import RegistrationPage from './components/NaTISRegistration/RegistrationPage'
import NotificationsPage from './components/NotificationsPage/NotificationsPage'

// Auth Components
import LoginPage from './components/Auth/LoginPage'
import ProtectedRoute from './components/Auth/ProtectedRoute'

// Main Layout Component
function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : false;
  })
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('currentPage');
    return saved || 'dashboard';
  })
  const [darkMode, setDarkMode] = useState(() => {
    // Get dark mode preference from localStorage or default to true (dark mode)
    const savedMode = localStorage.getItem('darkMode');
    const isDark = savedMode !== null ? JSON.parse(savedMode) : true;
    // Apply dark class on initial load
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    return isDark;
  });
  const navigate = useNavigate()
  const { logout: authLogout, isJudiciary, isNaTISAdmin, isMinistry, isNampolAdmin, isOfficer } = useAuth()

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Toggle dark class on HTML element for Tailwind's dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    await logout()
    authLogout()
    navigate('/login')
  }

  // Mobile bottom navigation items - show different items based on role
  const mobileNavItems = isOfficer
    ? [
        { id: 'officer_dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'issue_ticket', icon: Ticket, label: 'Ticket' },
        { id: 'ticket_management', icon: CheckCircle, label: 'Tickets' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ]
    : isJudiciary
    ? [
        { id: 'judge_dashboard', icon: Scale, label: 'Cases' },
        { id: 'defendant_files', icon: Users, label: 'Files' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ]
    : isNaTISAdmin
    ? [
        { id: 'natis_admin', icon: Car, label: 'NaTIS' },
        { id: 'natis_registration', icon: UserPlus, label: 'Register' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ]
    : isNampolAdmin
    ? [
        { id: 'nampol_dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'Officer_management', icon: Users, label: 'Officers' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ]
    : isMinistry
    ? [
        { id: 'ministry_dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ]
    : [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'user_management', icon: UserPlus, label: 'Users' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ]

  const renderPage = () => {
    // If user is officer, show officer pages
    if (isOfficer) {
      switch (currentPage) {
        case 'officer_dashboard':
          return <OfficerDashboard onPageChange={setCurrentPage} />
        case 'issue_ticket':
          return <IssueTicketPage />
        case 'ticket_management':
          return <TicketManagement />
        case 'settings':
          return <SettingsPage />
        case 'notifications':
          return <NotificationsPage />
        case 'help_center':
          return <HelpCenter />
        default:
          return <OfficerDashboard onPageChange={setCurrentPage} />
      }
    }

    // If user is judiciary, show judge dashboard
    if (isJudiciary) {
      switch (currentPage) {
        case 'judge_dashboard':
          return <JudgeDashboard />
        case 'defendant_files':
          return <DefendantFile />
        case 'settings':
          return <SettingsPage />
        case 'notifications':
          return <NotificationsPage />
        case 'help_center':
          return <HelpCenter />
        default:
          return <JudgeDashboard />
      }
    }

    // If user is ministry, show ministry dashboard
    if (isMinistry) {
      switch (currentPage) {
        case 'ministry_dashboard':
          return <MinistryDashboard />
        case 'analytics':
          return <AnalyticsOverview />
        case 'settings':
          return <SettingsPage />
        case 'notifications':
          return <NotificationsPage />
        case 'help_center':
          return <HelpCenter />
        default:
          return <MinistryDashboard />
      }
    }

    // If user is natisadmin, show NaTIS dashboard
    if (isNaTISAdmin) {
      switch (currentPage) {
        case 'natis_admin':
          return <NaTISAdminDashboard />
        case 'natis_registration':
          return <RegistrationPage />
        case 'settings':
          return <SettingsPage />
        case 'notifications':
          return <NotificationsPage />
        case 'help_center':
          return <HelpCenter />
        default:
          return <NaTISAdminDashboard />
      }
    }

    // If user is nampoladmin, show Nampol dashboard - only for officer management, NOT user management
    if (isNampolAdmin) {
      switch (currentPage) {
        case 'nampol_dashboard':
          return <NampolDashboard />
        case 'Officer_management':
          return <OfficerManagement />
        case 'settings':
          return <SettingsPage />
        case 'notifications':
          return <NotificationsPage />
        case 'help_center':
          return <HelpCenter />
        default:
          return <NampolDashboard />
      }
    }

    // Regular admin pages - Admin manages users and views analytics/dashboard
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'settings':
        return <SettingsPage />
      case 'notifications':
        return <NotificationsPage />
      case 'user_management':
        return <UserManagement />
      case 'analytics':
        return <AnalyticsOverview />
      case 'natis_admin':
        return <NaTISAdminDashboard />
      case 'overview':
      case 'reports':
      case 'statistics':
        return <AnalyticsOverview />
      case 'help_center':
        return <HelpCenter />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-br from-slate-50 via-blue-50
    to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950
    transition-all duration-500 ${darkMode ? 'dark' : ''}`}>

      {/* Desktop Layout */}
      <div className='hidden lg:flex h-screen overflow-hidden'>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
        />
        <div className='flex-1 flex flex-col overflow-hidden'>
          <Header
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(!darkMode)}
            onLogout={handleLogout}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <main className={`transition-colors duration-500 flex-1 overflow-y-auto bg-slate-200 dark:bg-gray-950 ${darkMode ? 'dark' : ''}`}>
            <div className='space-y-6 p-4 sm:p-6'>
              {renderPage()}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout with Bottom Nav */}
      <div className='lg:hidden flex flex-col h-screen'>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          onLogout={handleLogout}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        <main className={`flex-1 overflow-y-auto bg-slate-200 dark:bg-gray-950 pb-20 ${darkMode ? 'dark' : ''}`}>
          <div className='space-y-6 p-4'>
            {renderPage()}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className='fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-70 shadow-lg'>
          <nav className='flex justify-around items-center h-16'>
            {mobileNavItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400'
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
  )
}

// App Routes Component
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App


