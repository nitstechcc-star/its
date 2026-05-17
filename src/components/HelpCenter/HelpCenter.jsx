import React, { useState } from 'react'
import {
    Search,
    BookOpen,
    Plus,
    Minus,
    MessageCircle,
    Mail,
    Phone,
    FileText,
    CreditCard,
    Shield,
    User,
    Car,
    Ticket,
    ChevronRight,
    ExternalLink
} from 'lucide-react'

function HelpCenter() {
    const [expanded, setExpand] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const accordionItems = [
        {
            id: '1',
            title: 'How do I issue a traffic ticket?',
            content: 'To issue a traffic ticket, navigate to the "Issue Ticket" section from the sidebar. Fill in the required information including vehicle details, violation type, and fine amount. Once submitted, the ticket will be recorded in the system.',
            icon: Ticket
        },
        {
            id: '2',
            title: 'How do I search for a vehicle or driver?',
            content: 'Use the search bar in the header to search for vehicles by plate number or drivers by license number. You can also access advanced search options from the NaTIS Dashboard if you have the appropriate permissions.',
            icon: Car
        },
        {
            id: '3',
            title: 'How do I manage user roles and permissions?',
            content: 'Administrators can manage user roles from the User Management section. You can assign roles such as Officer, Admin, Judiciary, or NaTIS Admin. Each role has different permissions and access levels.',
            icon: User
        },
        {
            id: '4',
            title: 'How do I view analytics and reports?',
            content: 'Navigate to the Analytics section from the sidebar. You can view overview statistics, generate reports, and analyze traffic violation data. Reports can be filtered by date range, location, and violation type.',
            icon: FileText
        },
        {
            id: '5',
            title: 'How do I process ticket payments?',
            content: 'Ticket payments can be processed through the Ticket Resolution section. Defendants can pay their fines online or at designated payment centers. Once payment is confirmed, the ticket status will be updated accordingly.',
            icon: CreditCard
        },
        {
            id: '6',
            title: 'How do I ensure data security?',
            content: 'The system implements role-based access control (RBAC) to ensure data security. All sensitive information is encrypted and access is granted based on user roles. Administrators can review and manage user permissions at any time.',
            icon: Shield
        },
    ];

    const quickLinks = [
        { id: '1', title: 'Getting Started', description: 'Learn the basics', icon: BookOpen, color: 'bg-blue-500' },
        { id: '2', title: 'Video Tutorials', description: 'Watch how-to videos', icon: MessageCircle, color: 'bg-purple-500' },
        { id: '3', title: 'Contact Support', description: 'Get help from team', icon: Mail, color: 'bg-green-500' },
        { id: '4', title: 'System Status', description: 'Check uptime', icon: Phone, color: 'bg-orange-500' },
    ];

    const filteredItems = accordionItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='space-y-6 p-4 md:p-6'>
            {/* Hero Section */}
            <div className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 md:p-12 text-white shadow-xl'>
                <div className='absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]'></div>
                <div className='relative z-10'>
                    <div className='flex items-center space-x-3 mb-4'>
                        <div className='p-3 rounded-xl bg-white/20 backdrop-blur-sm'>
                            <BookOpen className='w-8 h-8 text-white' />
                        </div>
                        <span className='text-blue-200 font-medium'>Help Center</span>
                    </div>
                    <h1 className='text-3xl md:text-4xl font-bold mb-3'>How can we help you?</h1>
                    <p className='text-blue-100 text-lg max-w-xl mb-8'>
                        Search our knowledge base or browse topics below to find answers to your questions.
                    </p>

                    {/* Search Bar */}
                    <div className='max-w-2xl'>
                        <div className='relative'>
                            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200' />
                            <input
                                type='text'
                                placeholder='Search for help...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200'
                            />
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className='absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl'></div>
                <div className='absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl'></div>
            </div>

            {/* Quick Links */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {quickLinks.map((link) => (
                    <button
                        key={link.id}
                        className='group p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left'
                    >
                        <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                            <link.icon className='w-5 h-5 text-white' />
                        </div>
                        <h3 className='font-semibold text-slate-800 dark:text-white text-sm'>{link.title}</h3>
                        <p className='text-xs text-slate-500 dark:text-slate-400'>{link.description}</p>
                    </button>
                ))}
            </div>

            {/* FAQ Section */}
            <div className='bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden'>
                <div className='p-6 border-b border-slate-200 dark:border-slate-700'>
                    <h2 className='text-2xl font-bold text-slate-800 dark:text-white flex items-center space-x-2'>
                        <MessageCircle className='w-6 h-6 text-blue-500' />
                        <span>Frequently Asked Questions</span>
                    </h2>
                    <p className='text-slate-500 dark:text-slate-400 mt-1'>Common questions about the ITS system</p>
                </div>

                <div className='divide-y divide-slate-200 dark:divide-slate-700'>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <div key={item.id} className='transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'>
                                <button
                                    onClick={() => setExpand(expanded === item.id ? null : item.id)}
                                    className='w-full px-6 py-4 flex items-center justify-between text-left'
                                >
                                    <div className='flex items-center space-x-4'>
                                        <div className='w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0'>
                                            <item.icon className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                                        </div>
                                        <span className='font-medium text-slate-800 dark:text-white'>{item.title}</span>
                                    </div>
                                    <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${expanded === item.id ? 'rotate-180 bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                        {expanded === item.id ? (
                                            <Minus className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                                        ) : (
                                            <Plus className='w-4 h-4 text-slate-600 dark:text-slate-300' />
                                        )}
                                    </div>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded === item.id ? 'max-h-48' : 'max-h-0'}`}>
                                    <div className='px-6 pb-4 pl-20'>
                                        <p className='text-slate-600 dark:text-slate-300 leading-relaxed'>{item.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='p-8 text-center'>
                            <Search className='w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3' />
                            <p className='text-slate-500 dark:text-slate-400'>No results found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Section */}
            <div className='bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white'>
                <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
                    <div>
                        <h3 className='text-xl font-bold mb-2'>Still need help?</h3>
                        <p className='text-slate-300'>Can't find what you're looking for? Contact our support team.</p>
                    </div>
                    <div className='flex space-x-3'>
                        <button className='flex items-center space-x-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors'>
                            <Mail className='w-5 h-5' />
                            <span>Email Support</span>
                        </button>
                        <button className='flex items-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors'>
                            <Phone className='w-5 h-5' />
                            <span>Call Us</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className='flex flex-wrap justify-center gap-4 text-sm'>
                <a href='#' className='flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'>
                    <span>Terms of Service</span>
                    <ExternalLink className='w-3 h-3' />
                </a>
                <span className='text-slate-300'>•</span>
                <a href='#' className='flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'>
                    <span>Privacy Policy</span>
                    <ExternalLink className='w-3 h-3' />
                </a>
                <span className='text-slate-300'>•</span>
                <a href='#' className='flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'>
                    <span>Documentation</span>
                    <ExternalLink className='w-3 h-3' />
                </a>
            </div>
        </div>
    )
}

export default HelpCenter

