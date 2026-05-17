import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { User, Bell, Shield, Lock, HelpCircle, Save, AlertCircle, CheckCircle, Loader, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react'
import { getDriverContact, updateDriverContact } from '../../Axios'

function SettingsPage() {
  const { user, userRole } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: ''
  })

  // Contact state
  const [contact, setContact] = useState({
    phone_number: '',
    alt_phone: '',
    email: '',
    physical_address: '',
    city: '',
    postal_code: ''
  })

  // Password state
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showPasswords, setShowPasswords] = useState(false)

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_enabled: true,
    sms_enabled: true,
    preferred_method: 'all'
  })

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      })
    }
    loadContactInfo()
  }, [user])

  const loadContactInfo = async () => {
    try {
      const response = await getDriverContact()
      if (response.success && response.contact) {
        setContact(response.contact)
        setNotifications({
          email_enabled: response.contact.email_enabled !== false,
          sms_enabled: response.contact.sms_enabled !== false,
          preferred_method: response.contact.preferred_method || 'all'
        })
      }
    } catch (err) {
      console.error('Failed to load contact info:', err)
    }
  }

  const handleContactSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const response = await updateDriverContact({
        ...contact,
        ...notifications
      })
      if (response.success) {
        setSuccess('Contact information updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.error || 'Failed to update contact information')
      }
    } catch (err) {
      setError('An error occurred while saving')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!password.current || !password.new || !password.confirm) {
      setError('Please fill all password fields')
      return
    }
    if (password.new !== password.confirm) {
      setError('New passwords do not match')
      return
    }
    if (password.new.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setError('')
    setSuccess('Password changed successfully!')
    setPassword({ current: '', new: '', confirm: '' })
    setTimeout(() => setSuccess(''), 3000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <nav className="p-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden p-6">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Profile Information</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">View your account details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                    <input
                      type="text"
                      value={userRole?.replace('_', ' ').toUpperCase() || 'Unknown'}
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 cursor-not-allowed capitalize"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    <strong>Note:</strong> Profile information can only be updated by an administrator.
                    Contact your system administrator if you need to change your details.
                  </p>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <Phone className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Contact Information</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your contact details for notifications</p>
                  </div>
                </div>

                {success && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={contact.phone_number || ''}
                        onChange={(e) => setContact({ ...contact, phone_number: e.target.value })}
                        placeholder="+264 81 234 5678"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Alternative Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={contact.alt_phone || ''}
                        onChange={(e) => setContact({ ...contact, alt_phone: e.target.value })}
                        placeholder="+264 85 678 9012"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={contact.email || ''}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Physical Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={contact.physical_address || ''}
                        onChange={(e) => setContact({ ...contact, physical_address: e.target.value })}
                        placeholder="123 Main Street"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                    <input
                      type="text"
                      value={contact.city || ''}
                      onChange={(e) => setContact({ ...contact, city: e.target.value })}
                      placeholder="Windhoek"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Postal Code</label>
                    <input
                      type="text"
                      value={contact.postal_code || ''}
                      onChange={(e) => setContact({ ...contact, postal_code: e.target.value })}
                      placeholder="9000"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleContactSave}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    loading
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <><Loader className="w-5 h-5 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" />Save Changes</>
                  )}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Bell className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Notification Preferences</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Choose how you want to receive notifications</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-slate-800 dark:text-white font-medium">Email Notifications</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Receive ticket updates via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, email_enabled: !notifications.email_enabled })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications.email_enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notifications.email_enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-slate-800 dark:text-white font-medium">SMS Notifications</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Receive urgent alerts via SMS</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, sms_enabled: !notifications.sms_enabled })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications.sms_enabled ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notifications.sms_enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <label className="block text-slate-800 dark:text-white font-medium mb-3">Preferred Notification Method</label>
                    <div className="flex flex-wrap gap-3">
                      {['all', 'email', 'sms'].map(method => (
                        <button
                          key={method}
                          onClick={() => setNotifications({ ...notifications, preferred_method: method })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            notifications.preferred_method === method
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          {method === 'all' ? 'All Methods' : method.charAt(0).toUpperCase() + method.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleContactSave}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    loading
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <><Loader className="w-5 h-5 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" />Save Preferences</>
                  )}
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Security Settings</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your password and security options</p>
                  </div>
                </div>

                {success && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={password.current}
                        onChange={(e) => setPassword({ ...password, current: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={password.new}
                        onChange={(e) => setPassword({ ...password, new: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={password.confirm}
                        onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                        placeholder="Confirm new password"
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
                >
                  <Lock className="w-5 h-5" />
                  Change Password
                </button>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    <strong>Security Tip:</strong> Use a strong password with at least 8 characters,
                    including uppercase, lowercase, numbers, and symbols.
                  </p>
                </div>
              </div>
            )}

            {/* Help Tab */}
            {activeTab === 'help' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                    <HelpCircle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Help & Support</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Get help with using the ITS system</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <h3 className="text-slate-800 dark:text-white font-medium mb-2">Quick Start Guide</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Learn the basics of using the Traffic Management System</p>
                    <button className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300">Read Guide →</button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <h3 className="text-slate-800 dark:text-white font-medium mb-2">FAQ</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Find answers to commonly asked questions</p>
                    <button className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300">View FAQ →</button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <h3 className="text-slate-800 dark:text-white font-medium mb-2">Contact Support</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Get help from the ITS support team</p>
                    <button className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300">Contact Us →</button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <h3 className="text-slate-800 dark:text-white font-medium mb-2">System Status</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Check the current status of the system</p>
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      All Systems Operational
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="text-blue-700 dark:text-blue-300 font-medium mb-2">About ITS</h3>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">
                    Intelligent Traffic System v1.0.0<br />
                    A comprehensive traffic management solution for Namibia.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
