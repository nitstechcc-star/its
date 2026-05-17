import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  ChevronDown,
  CheckCircle,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Ticket,
  UserX2,
  ChevronRight,
  Power,
  Scale,
  FileText,
  Users,
  UserPlus,
  Car,
  UserCheck,
  Building2,
  Shield
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'

// Default menu items for Admin - Admin manages users and views analytics/dashboard
const MenuItems = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Admin Dashboard',
    active: false,
    roles: ['admin'],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics',
    active: false,
    roles: ['admin', 'ministry'],
  },
  {
    id: 'user_management',
    icon: UserPlus,
    label: 'User Management',
    active: false,
    roles: ['admin'],
  },
  {
    id: 'natis_admin',
    icon: Car,
    label: 'NaTIS Admin',
    active: false,
    roles: ['natisadmin'],
  },
]

// Judge specific menu items
const judgeMenuItems = [
  {
    id: 'judge_dashboard',
    icon: Scale,
    label: 'Magistrate Dashboard',
    active: false,
    roles: ['judiciary'],
  },
  {
    id: 'defendant_files',
    icon: Users,
    label: 'Defendant Files',
    active: false,
    roles: ['judiciary'],
  },
]

// NaTIS Admin specific menu items
const natisAdminMenuItems = [
  {
    id: 'natis_admin',
    icon: Car,
    label: 'NaTIS Dashboard',
    active: false,
    roles: ['natisadmin'],
  },
  {
    id: 'natis_registration',
    icon: UserCheck,
    label: 'Registration',
    active: false,
    roles: ['natisadmin'],
  },
]

// Ministry specific menu items
const ministryMenuItems = [
  {
    id: 'ministry_dashboard',
    icon: Building2,
    label: 'Ministry Dashboard',
    active: false,
    roles: ['ministry'],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics',
    active: false,
    roles: ['ministry'],
  },
]

// Nampol Admin specific menu items - only for officers management, not user management
const nampolAdminMenuItems = [
  {
    id: 'nampol_dashboard',
    icon: LayoutDashboard,
    label: 'Nampol Dashboard',
    active: false,
    roles: ['nampoladmin'],
  },
  {
    id: 'Officer_management',
    icon: UserX2,
    label: 'Officer Management',
    active: false,
    roles: ['nampoladmin'],
  },
]

// Officer specific menu items
const officerMenuItems = [
  {
    id: 'officer_dashboard',
    icon: LayoutDashboard,
    label: 'Officer Dashboard',
    active: false,
    roles: ['officer'],
  },
  {
    id: 'issue_ticket',
    icon: Ticket,
    label: 'Issue Ticket',
    active: false,
    roles: ['officer'],
  },
  {
    id: 'ticket_management',
    icon: CheckCircle,
    label: 'Ticket Management',
    active: false,
    roles: ['officer'],
  },
]

const generalSidebarItems = [
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    active: false,
    roles: ['admin', 'officer', 'judiciary', 'ministry', 'natisadmin', 'nampoladmin'],
  },
  {
    id: 'help_center',
    icon: HelpCircle,
    label: 'Help',
    active: false,
    roles: ['admin', 'officer', 'judiciary', 'ministry', 'natisadmin', 'nampoladmin'],
  },
]

function Sidebar({ collapsed, currentPage, onPageChange, onLogout }) {
  const { user, isJudiciary, isNaTISAdmin, isMinistry, isNampolAdmin, isOfficer } = useAuth()
  const [expandItem, setExpandItem] = useState(new Set(['']))
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Get user role
  const userRole = user?.role || 'officer'

  // Determine which menu items to show based on user role
  let menuItems = MenuItems
  let menuTitle = 'Menu'

  if (isOfficer) {
    menuItems = officerMenuItems
    menuTitle = 'Officer Menu'
  } else if (isJudiciary) {
    menuItems = judgeMenuItems
    menuTitle = 'Judge Menu'
  } else if (isNaTISAdmin) {
    menuItems = natisAdminMenuItems
    menuTitle = 'NaTIS Admin Menu'
  } else if (isNampolAdmin) {
    menuItems = nampolAdminMenuItems
    menuTitle = 'Nampol Admin Menu'
  } else if (isMinistry) {
    menuItems = ministryMenuItems
    menuTitle = 'Ministry Menu'
  } else {
    // Filter menu items based on role for admin
    menuItems = MenuItems.filter(item =>
      item.roles.includes(userRole) || item.roles.includes('admin') && userRole === 'admin'
    ).map(item => {
      // Filter submenu items based on role
      if (item.submenu) {
        return {
          ...item,
          submenu: item.submenu.filter(sub =>
            sub.roles.includes(userRole) || (sub.roles.includes('admin') && userRole === 'admin')
          )
        }
      }
      return item
    })
  }

  // Filter general sidebar items based on role
  const filteredGeneralItems = generalSidebarItems.filter(item =>
    item.roles.includes(userRole) || (item.roles.includes('admin') && userRole === 'admin')
  )

  const toggleExpandItem = (itemId) => {
    const newExpandedItem = new Set(expandItem)
    if (newExpandedItem.has(itemId)) {
      newExpandedItem.delete(itemId)
    } else {
      newExpandedItem.add(itemId)
    }
    setExpandItem(newExpandedItem)
  }

  const handleLogout = () => {
    setShowUserMenu(false)
    onLogout()
  }

  // Get role display name for logo
  const getRoleDisplay = () => {
    if (isOfficer) return 'Officer Panel'
    if (isJudiciary) return 'Judiciary'
    if (isNaTISAdmin) return 'NaTIS Admin'
    if (isNampolAdmin) return 'Nampol Admin'
    if (isMinistry) return 'Ministry'
    return 'Admin Panel'
  }

  return (
    <div className={`transition-all duration-300 ease-in-out bg-white/80 dark:bg-slate-950 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10 ${collapsed ? 'w-20' : 'w-70'}`}>
      {/* logo */}
      <div className='px-6 py-4 border-b border-slate-300/50 dark:border-slate-900'>
        <div className='flex items-center space-x-3'>
          <img src='/logo.svg' alt='ITS Logo' className='w-10 h-10 rounded-xl shadow-lg' />
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className='text-xl font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap'>ITS</h1>
            <p className='text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap'>{getRoleDisplay()}</p>
          </div>
        </div>
      </div>

      {/* navigations */}
      <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'max-h-0 opacity-0' : 'max-h-6 opacity-100'}`}>
          <p className='text-xs text-slate-700 dark:text-slate-300 p-1'>{menuTitle}</p>
        </div>
        {menuItems.map((item) => {
          // Skip items without submenus that don't match role
          if (item.submenu && item.submenu.length === 0) return null

          return (
            <div key={item.id}>
              <button
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ease-in-out cursor-pointer ${
                  currentPage === item.id
                    ? 'bg-linear-to-r from-blue-500 to-purple-700 text-white shadow-lg shadow-blue-500/50'
                    : 'text-slate-600 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
                onClick={() => {
                  if (item.submenu) {
                    toggleExpandItem(item.id)
                  } else {
                    onPageChange(item.id)
                  }
                }}
              >
                <div className='flex items-center space-x-3'>
                  <item.icon className='w-5 h-5 dark:text-white' />
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    <span className='text-sm font-medium text-slate-800 dark:text-white whitespace-nowrap'>{item.label}</span>
                  </div>
                  {!collapsed && item.badge && (
                    <span className='text-xs bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium'>
                      {item.badge}
                    </span>
                  )}
                </div>
                {!collapsed && item.submenu && <ChevronDown className={`w-4 h-4 transition-transform dark:text-white`} />}
              </button>
              {!collapsed && item.submenu && expandItem.has(item.id) && (
                <div className='ml-6 mt-1 space-y-1'>
                  {item.submenu.map((submenuItem) => (
                    <button
                      key={submenuItem.id}
                      className={`w-full text-left transition-all duration-500 ease-in-out px-4 py-2 rounded-lg text-sm ${
                        currentPage === submenuItem.id
                          ? 'bg-blue-800 text-white'
                          : 'text-slate-700 dark:text-slate-200 hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                      onClick={() => onPageChange(submenuItem.id)}
                    >
                      {submenuItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div className='py-2'></div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'max-h-0 opacity-0' : 'max-h-6 opacity-100'}`}>
          <p className='text-xs text-slate-700 dark:text-slate-300'>General</p>
        </div>

        {filteredGeneralItems.map((item) => (
          <div key={item.id}>
            <button
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ease-in-out cursor-pointer ${
                currentPage === item.id || item.active
                  ? 'bg-linear-to-r from-blue-500 to-purple-700 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => onPageChange(item.id)}
            >
              <div className='flex items-center space-x-3'>
                <item.icon className='w-5 h-5 dark:text-white' />
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  <span className='text-sm font-medium text-slate-800 dark:text-white whitespace-nowrap'>{item.label}</span>
                </div>
              </div>
            </button>
          </div>
        ))}
      </nav>

      {/* user profile with dropdown */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'} border-t border-slate-300/50 dark:border-slate-900`}>
        <div className='p-4'>
          <div className='relative'>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className='w-full flex items-center space-x-3 p-3 rounded-xl bg-slate-300 dark:bg-slate-900 transition-colors duration-500 hover:bg-slate-400 dark:hover:bg-slate-800'
            >
              <img src='https://i.pravatar.cc/300' alt='user' className='w-10 h-10 rounded-full ring-2 ring-blue-400'/>
              <div className='flex-1 min-w-0 text-left'>
                <p className='text-sm font-medium text-slate-800 dark:text-white truncate'>{user?.username || 'User'}</p>
                <p className='text-xs text-slate-500 dark:text-slate-500 truncate capitalize'>{user?.role || 'Administrator'}</p>
              </div>
              <motion.div animate={{ rotate: showUserMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className='w-4 h-4 text-slate-500' />
              </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className='absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden'
                >
                  <motion.button
                    whileHover={{ x: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    onClick={handleLogout}
                    className='w-full flex items-center space-x-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                  >
                    <Power className='w-4 h-4' />
                    <span className='text-sm font-medium'>Sign Out</span>
                    <ChevronRight className='w-4 h-4 ml-auto opacity-0 group-hover:opacity-100' />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

