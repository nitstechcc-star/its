import { useState, useRef } from 'react'
import { Menu, Search, Sun, Settings, MoonStar, ChevronDown, LogOut, User, Ticket, FileText, X, Zap, Bell } from 'lucide-react'
import { useAuth } from '../../context/useAuth';

function Header({ onToggleSidebar, toggleDarkMode, darkMode, currentPage, onPageChange }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);
    const searchRef = useRef(null);
    const { user, logout, isJudiciary, isNaTISAdmin, isAdmin, isMinistry, isOfficer, isNampolAdmin } = useAuth();

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
        setSearchQuery('');
    };

    const handleQuickAction = (action) => {
        switch (action) {
            case 'issue_ticket': onPageChange('issue_ticket'); break;
            case 'search': searchRef.current?.querySelector('input')?.focus(); break;
            case 'report': onPageChange('reports'); break;
            case 'analytics': onPageChange('overview'); break;
            case 'officer_mgmt': onPageChange('Officer_management'); break;
            case 'user_mgmt': onPageChange('user_management'); break;
            default: break;
        }
        setQuickActionsOpen(false);
    };

    // Get page title based on user role and current page
    const getPageTitle = () => {
        // Role-specific dashboard titles
        if (isOfficer && currentPage === 'officer_dashboard') return 'Officer Dashboard';
        if (isJudiciary && currentPage === 'dashboard') return 'Judge Dashboard';
        if ((isNaTISAdmin || isNampolAdmin) && currentPage === 'dashboard') return 'NaTIS Dashboard';
        if (isMinistry && currentPage === 'dashboard') return 'Ministry Dashboard';

        const titles = {
            'dashboard': 'Dashboard',
            'officer_dashboard': 'Officer Dashboard',
            'analytics': 'Analytics',
            'overview': 'Analytics Overview',
            'reports': 'Reports',
            'statistics': 'Statistics',
            'issue_ticket': 'Issue Ticket',
            'ticket_management': 'Ticket Management',
            'Officer_management': 'Officer Management',
            'user_management': 'User Management',
            'natis_admin': 'NaTIS Dashboard',
            'natis_registration': 'Vehicle & Driver Registration',
            'judge_dashboard': 'Court Magistrate Dashboard',
            'defendant_files': 'Defendant Files',
            'settings': 'Settings',
            'notifications': 'Notifications',
            'help_center': 'Help Center',
            'ministry_dashboard': 'Ministry Dashboard'
        };
        return titles[currentPage] || 'Dashboard';
    };

    const getBreadcrumbs = () => {
        const crumbs = [{ id: 'dashboard', label: 'Home', path: 'dashboard' }];

        // Role-specific root page
        if (isOfficer) {
            crumbs[0] = { id: 'officer_dashboard', label: 'Officer Dashboard', path: 'officer_dashboard' };
        } else if (isJudiciary) {
            crumbs[0] = { id: 'judge_dashboard', label: 'Magistrate Dashboard', path: 'judge_dashboard' };
        } else if (isNaTISAdmin) {
            crumbs[0] = { id: 'natis_admin', label: 'NaTIS Dashboard', path: 'natis_admin' };
        } else if (isMinistry) {
            crumbs[0] = { id: 'ministry_dashboard', label: 'Ministry Dashboard', path: 'ministry_dashboard' };
        }

        if (['analytics', 'overview', 'reports', 'statistics'].includes(currentPage)) {
            crumbs.push({ id: 'analytics', label: 'Analytics', path: 'analytics' });
        }
        if (currentPage === 'overview') crumbs.push({ id: 'overview', label: 'Overview', path: 'overview' });
        if (currentPage === 'reports') crumbs.push({ id: 'reports', label: 'Reports', path: 'reports' });
        if (currentPage === 'statistics') crumbs.push({ id: 'statistics', label: 'Statistics', path: 'statistics' });
        if (currentPage === 'judge_dashboard') crumbs.push({ id: 'judge_dashboard', label: 'Court Magistrate Dashboard', path: 'judge_dashboard' });
        if (currentPage === 'defendant_files') crumbs.push({ id: 'defendant_files', label: 'Defendant Files', path: 'defendant_files' });
        if (currentPage === 'natis_admin') crumbs.push({ id: 'natis_admin', label: 'NaTIS Dashboard', path: 'natis_admin' });
        if (currentPage === 'natis_registration') {
            crumbs.push({ id: 'natis_admin', label: 'NaTIS Dashboard', path: 'natis_admin' });
            crumbs.push({ id: 'natis_registration', label: 'Registration', path: 'natis_registration' });
        }
        if (currentPage === 'issue_ticket') crumbs.push({ id: 'issue_ticket', label: 'Issue Ticket', path: 'issue_ticket' });
        if (currentPage === 'ticket_management') crumbs.push({ id: 'ticket_management', label: 'Ticket Management', path: 'ticket_management' });

        // Add current page if not home
        const homePages = ['dashboard', 'officer_dashboard', 'judge_dashboard', 'natis_admin', 'ministry_dashboard'];
        if (!homePages.includes(currentPage)) {
            const currentTitle = getPageTitle();
            if (!crumbs.find(c => c.id === currentPage)) {
                crumbs.push({ id: currentPage, label: currentTitle, path: currentPage });
            }
        }
        return crumbs;
    };

    const getRoleDisplay = () => {
        const roleNames = {
            'admin': 'Administrator',
            'officer': 'Traffic Officer',
            'judiciary': 'Judiciary',
            'ministry': 'Ministry',
            'natisadmin': 'NaTIS Administrator',
            'nampoladmin': 'NaTIS Administrator'
        };
        return roleNames[user?.role] || 'User';
    };

    // Role-based quick actions
    const getQuickActions = () => {
        const actions = [];

        // Officers and Admins can issue tickets
        if (isAdmin || isOfficer) {
            actions.push({ id: 'issue_ticket', icon: Ticket, label: 'Issue Ticket' });
        }

        // All users can search and view analytics
        actions.push({ id: 'search', icon: Search, label: 'Quick Search' });
        actions.push({ id: 'analytics', icon: Zap, label: 'Analytics' });

        // Only Admins can view reports and manage users/officers
        if (isAdmin) {
            actions.push({ id: 'report', icon: FileText, label: 'Reports' });
            actions.push({ id: 'officer_mgmt', icon: User, label: 'Officer Mgmt' });
            actions.push({ id: 'user_mgmt', icon: User, label: 'User Mgmt' });
        }

        // Ministry can view reports
        if (isMinistry) {
            actions.push({ id: 'report', icon: FileText, label: 'Reports' });
        }

        return actions;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className={`relative bg-white/80 dark:bg-slate-950 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-900 px-4 md:px-6 py-3 transition-colors duration-500 z-50 ${darkMode ? 'dark' : ''}`}>
            <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3 md:space-x-4'>
                    <button className='hidden lg:block p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer' onClick={onToggleSidebar}>
                        <Menu className='w-5 h-5' />
                    </button>
                    <div className='hidden md:block'>
                        <h1 className='text-xl font-bold text-slate-800 dark:text-white'>{getPageTitle()}</h1>
                        <nav className="flex items-center space-x-1 text-sm">
                            {breadcrumbs.map((crumb, index) => (
                                <div key={crumb.id} className="flex items-center">
                                    {index > 0 && <ChevronDown className="w-3 h-3 rotate-90deg text-slate-400 mx-1" />}
                                    <button onClick={() => onPageChange(crumb.path)} className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${index === breadcrumbs.length - 1 ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {crumb.label}
                                    </button>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className='hidden lg:block flex-1 max-w-md mx-4' ref={searchRef}>
                    <form onSubmit={handleSearch} className='relative'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                            <input
                                type='text'
                                placeholder={isJudiciary ? 'Search cases, defendants...' : 'Search tickets, vehicles, users...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full pl-10 pr-10 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                            />
                            {searchQuery && (
                                <button type='button' onClick={() => setSearchQuery('')} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600'>
                                    <X className='w-4 h-4' />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className='flex items-center space-x-2 md:space-x-3'>
                    {/* Quick Actions - Only show for non-judiciary roles */}
                    {!isJudiciary && (
                        <div className='relative'>
                            <button
                                className='p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-500 ease-in-out cursor-pointer'
                                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                                title="Quick Actions"
                            >
                                <Zap className='w-5 h-5' />
                            </button>
                            {quickActionsOpen && (
                                <div className='absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[100]'>
                                    <div className='px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700'>
                                        Quick Actions
                                    </div>
                                    {getQuickActions().map((action) => (
                                        <button key={action.id} onClick={() => handleQuickAction(action.id)} className='w-full flex items-center space-x-3 px-3 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'>
                                            <action.icon className='w-4 h-4' />
                                            <span className='text-sm'>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        className='p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-500 ease-in-out cursor-pointer'
                        onClick={toggleDarkMode}
                        title={darkMode ? 'Light Mode' : 'Dark Mode'}
                    >
                        {darkMode ? <Sun className='w-5 h-5' /> : <MoonStar className='w-5 h-5' />}
                    </button>

                    <div className='relative'>
                        <button
                            className='flex items-center space-x-2 pl-2 md:pl-3 border-l border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer'
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className='hidden md:block text-right'>
                                <p className='text-sm font-medium text-slate-800 dark:text-white'>{user?.username || 'User'}</p>
                                <p className='text-xs text-slate-500 dark:text-slate-400'>{getRoleDisplay()}</p>
                            </div>
                            <img src='https://i.pravatar.cc/300' alt='User Avatar' className='w-8 h-8 rounded-full ring-2 ring-blue-500' />
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {userMenuOpen && (
                            <div className='absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[100]'>
                                <div className='px-4 py-3 border-b border-slate-200 dark:border-slate-700'>
                                    <p className='text-sm font-medium text-slate-800 dark:text-white'>{user?.username || 'User'}</p>
                                    <p className='text-xs text-slate-500 dark:text-slate-400'>{user?.email || 'user@example.com'}</p>
                                </div>
                                <div className='p-2'>
                                    <button onClick={() => { onPageChange('notifications'); setUserMenuOpen(false); }} className='w-full flex items-center space-x-3 px-3 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors'>
                                        <Bell className='w-4 h-4' />
                                        <span className='text-sm'>Notifications</span>
                                    </button>
                                    <button onClick={() => { onPageChange('settings'); setUserMenuOpen(false); }} className='w-full flex items-center space-x-3 px-3 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors'>
                                        <User className='w-4 h-4' />
                                        <span className='text-sm'>Profile</span>
                                    </button>
                                    <button onClick={() => { onPageChange('settings'); setUserMenuOpen(false); }} className='w-full flex items-center space-x-3 px-3 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors'>
                                        <Settings className='w-4 h-4' />
                                        <span className='text-sm'>Settings</span>
                                    </button>
                                    <div className='my-1 border-t border-slate-200 dark:border-slate-700'></div>
                                    <button onClick={handleLogout} className='w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'>
                                        <LogOut className='w-4 h-4' />
                                        <span className='text-sm font-medium'>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='lg:hidden mt-3'>
                <form onSubmit={handleSearch} className='relative'>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                        <input
                            type='text'
                            placeholder='Search...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full pl-10 pr-10 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                        {searchQuery && (
                            <button type='button' onClick={() => setSearchQuery('')} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600'>
                                <X className='w-4 h-4' />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Header;

