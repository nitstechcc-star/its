import React, { useState, useEffect } from 'react'
import {
  Car,
  User,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  FileText,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Truck,
  UserCheck
} from 'lucide-react'
import {
  registerDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  registerVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle
} from '../../Axios'

// Tab types
const TABS = {
  REGISTER_DRIVER: 'register_driver',
  DRIVER_LIST: 'driver_list',
  REGISTER_VEHICLE: 'register_vehicle',
  VEHICLE_LIST: 'vehicle_list'
}

// Vehicle type options (Namibia NaTIS standard)
const VEHICLE_TYPES = [
  { code: 'sedan', name: 'Sedan' },
  { code: 'suv', name: 'SUV' },
  { code: 'hatchback', name: 'Hatchback' },
  { code: 'pickup', name: 'Pickup' },
  { code: 'truck', name: 'Truck' },
  { code: 'bus', name: 'Bus' },
  { code: 'motorcycle', name: 'Motorcycle' },
  { code: 'van', name: 'Van' },
  { code: 'minibus', name: 'Minibus' },
  { code: 'other', name: 'Other' }
]

const FUEL_TYPES = [
  { code: 'petrol', name: 'Petrol' },
  { code: 'diesel', name: 'Diesel' },
  { code: 'electric', name: 'Electric' },
  { code: 'hybrid', name: 'Hybrid' },
  { code: 'other', name: 'Other' }
]

const VEHICLE_STATUSES = [
  { code: 'registered', name: 'Registered' },
  { code: 'expired', name: 'Expired' },
  { code: 'suspended', name: 'Suspended' },
  { code: 'scrapped', name: 'Scrapped' },
  { code: 'stolen', name: 'Stolen' }
]

export default function RegistrationPage() {
  const [activeTab, setActiveTab] = useState(TABS.REGISTER_DRIVER)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Driver State
  const [drivers, setDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [driverSearchQuery, setDriverSearchQuery] = useState('')

  // Driver Form State
  const [driverForm, setDriverForm] = useState({
    firstname: '',
    lastname: '',
    id_no: '',
    license_no: '',
    phone_number: '',
    alt_phone: '',
    email: '',
    physical_address: '',
    city: '',
    postal_code: ''
  })

  // Vehicle State
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('')
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('')

  // Vehicle Form State
  const [vehicleForm, setVehicleForm] = useState({
    plate_no: '',
    vin: '',
    engine_no: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_color: '',
    vehicle_year: '',
    vehicle_type: 'sedan',
    fuel_type: 'petrol',
    owner_id: '',
    registration_expiry: '',
    roadworthy_cert_no: '',
    roadworthy_expiry: '',
    insurance_company: '',
    insurance_policy_no: '',
    insurance_expiry: '',
    seating_capacity: 5,
    gross_vehicle_mass: '',
    tare_mass: ''
  })

  // Owner selection modal state
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [ownerSearch, setOwnerSearch] = useState('')

  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = localStorage.getItem('darkMode') === 'true'
      setDarkMode(isDark)
    }

    window.addEventListener('storage', handleThemeChange)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setDarkMode(isDark)
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })

    return () => {
      window.removeEventListener('storage', handleThemeChange)
      observer.disconnect()
    }
  }, [])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // ======================
  // DRIVER FUNCTIONS
  // ======================

  const loadDrivers = async () => {
    setLoading(true)
    const result = await getDrivers(driverSearchQuery)
    setLoading(false)
    if (result.success) {
      setDrivers(result.data)
    } else {
      showMessage(result.error || 'Error loading drivers', 'error')
    }
  }

  const handleDriverSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!driverForm.firstname.trim() || !driverForm.lastname.trim()) {
      showMessage('First name and last name are required', 'error')
      return
    }
    if (!driverForm.id_no.trim()) {
      showMessage('ID number is required', 'error')
      return
    }

    setLoading(true)
    const result = await registerDriver(driverForm)
    setLoading(false)

    if (result.success) {
      showMessage('Driver registered successfully!', 'success')
      setDriverForm({
        firstname: '',
        lastname: '',
        id_no: '',
        license_no: '',
        phone_number: '',
        alt_phone: '',
        email: '',
        physical_address: '',
        city: '',
        postal_code: ''
      })
      loadDrivers()
    } else {
      showMessage(result.error || 'Error registering driver', 'error')
    }
  }

  const handleDriverSelect = async (driver) => {
    setLoading(true)
    const result = await getDriverById(driver.id)
    setLoading(false)
    if (result.success) {
      setSelectedDriver(result.data)
    }
  }

  const handleDriverUpdate = async () => {
    if (!selectedDriver) return

    setLoading(true)
    const result = await updateDriver(selectedDriver.id, {
      firstname: selectedDriver.firstname,
      lastname: selectedDriver.lastname,
      id_no: selectedDriver.id_no,
      license_no: selectedDriver.license_no,
      phone_number: selectedDriver.phone_number,
      alt_phone: selectedDriver.alt_phone,
      email: selectedDriver.email,
      physical_address: selectedDriver.physical_address,
      city: selectedDriver.city,
      postal_code: selectedDriver.postal_code
    })
    setLoading(false)

    if (result.success) {
      showMessage('Driver updated successfully!', 'success')
      loadDrivers()
    } else {
      showMessage(result.error || 'Error updating driver', 'error')
    }
  }

  // ======================
  // VEHICLE FUNCTIONS
  // ======================

  const loadVehicles = async () => {
    setLoading(true)
    const result = await getVehicles(vehicleSearchQuery, vehicleStatusFilter)
    setLoading(false)
    if (result.success) {
      setVehicles(result.data)
    } else {
      showMessage(result.error || 'Error loading vehicles', 'error')
    }
  }

  useEffect(() => {
    loadDrivers()
  }, [driverSearchQuery])

  useEffect(() => {
    loadVehicles()
  }, [vehicleSearchQuery, vehicleStatusFilter])

  const handleVehicleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!vehicleForm.plate_no.trim()) {
      showMessage('Plate number is required', 'error')
      return
    }
    if (!vehicleForm.vin.trim()) {
      showMessage('VIN is required', 'error')
      return
    }
    if (!vehicleForm.vehicle_make.trim() || !vehicleForm.vehicle_model.trim()) {
      showMessage('Vehicle make and model are required', 'error')
      return
    }
    if (!vehicleForm.owner_id) {
      showMessage('Please select an owner', 'error')
      return
    }

    setLoading(true)
    const result = await registerVehicle(vehicleForm)
    setLoading(false)

    if (result.success) {
      showMessage('Vehicle registered successfully!', 'success')
      setVehicleForm({
        plate_no: '',
        vin: '',
        engine_no: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_color: '',
        vehicle_year: '',
        vehicle_type: 'sedan',
        fuel_type: 'petrol',
        owner_id: '',
        registration_expiry: '',
        roadworthy_cert_no: '',
        roadworthy_expiry: '',
        insurance_company: '',
        insurance_policy_no: '',
        insurance_expiry: '',
        seating_capacity: 5,
        gross_vehicle_mass: '',
        tare_mass: ''
      })
      loadVehicles()
    } else {
      showMessage(result.error || 'Error registering vehicle', 'error')
    }
  }

  const handleSelectOwner = (driver) => {
    setVehicleForm(prev => ({ ...prev, owner_id: driver.id }))
    setShowOwnerModal(false)
    setOwnerSearch('')
  }

  // Tab buttons
  const tabs = [
    { id: TABS.REGISTER_DRIVER, label: 'Register Driver', icon: UserCheck },
    { id: TABS.DRIVER_LIST, label: 'Driver List', icon: Users },
    { id: TABS.REGISTER_VEHICLE, label: 'Register Vehicle', icon: Truck },
    { id: TABS.VEHICLE_LIST, label: 'Vehicle List', icon: Car }
  ]

  return (
    <div className='space-y-6 m-5'>
      {/* Header */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 text-white shadow-xl'>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className='flex flex-wrap items-center justify-between gap-4 relative z-10'>
          <div className='flex items-center gap-4'>
            <span className='px-4 py-1.5 bg-yellow-500 text-blue-900 text-sm font-bold rounded-lg shadow-lg'>NaTIS</span>
            <div>
              <h1 className='text-2xl font-bold'>Vehicle & Driver Registration</h1>
              <p className='text-blue-100 text-sm flex items-center gap-2 mt-1'>
                <FileText className='w-4 h-4' />
                Registration Management
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg'>
            <CheckCircle className='w-4 h-4 text-green-400' />
            <span className='text-sm font-medium'>System Active</span>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className={`rounded-xl border p-1 shadow-sm ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <div className='flex flex-wrap gap-1'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : darkMode
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className='w-4 h-4' />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`rounded-xl border p-6 shadow-sm ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>

        {/* Register Driver Tab */}
        {activeTab === TABS.REGISTER_DRIVER && (
          <div className='space-y-6'>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>Register New Driver</h2>

            <form onSubmit={handleDriverSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {/* Personal Information */}
                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Personal Information</h3>

                  <div className='space-y-4'>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>First Name *</label>
                      <input
                        type='text'
                        value={driverForm.firstname}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, firstname: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Last Name *</label>
                      <input
                        type='text'
                        value={driverForm.lastname}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, lastname: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>ID Number *</label>
                      <input
                        type='text'
                        value={driverForm.id_no}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, id_no: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder='e.g., 9201010001'
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Driver's License Number</label>
                      <input
                        type='text'
                        value={driverForm.license_no}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, license_no: e.target.value.toUpperCase() }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder='e.g., N123456'
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Contact Information</h3>

                  <div className='space-y-4'>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Phone Number</label>
                      <div className='relative'>
                        <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                          darkMode ? 'text-slate-400' : 'text-gray-400'
                        }`} />
                        <input
                          type='tel'
                          value={driverForm.phone_number}
                          onChange={(e) => setDriverForm(prev => ({ ...prev, phone_number: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                            darkMode
                              ? 'bg-slate-600 border-slate-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder='+264812345678'
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Alternative Phone</label>
                      <input
                        type='tel'
                        value={driverForm.alt_phone}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, alt_phone: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Email Address</label>
                      <div className='relative'>
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                          darkMode ? 'text-slate-400' : 'text-gray-400'
                        }`} />
                        <input
                          type='email'
                          value={driverForm.email}
                          onChange={(e) => setDriverForm(prev => ({ ...prev, email: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                            darkMode
                              ? 'bg-slate-600 border-slate-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder='email@example.com'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Address Information</h3>

                  <div className='space-y-4'>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Physical Address</label>
                      <div className='relative'>
                        <MapPin className={`absolute left-3 top-3 w-4 h-4 ${
                          darkMode ? 'text-slate-400' : 'text-gray-400'
                        }`} />
                        <textarea
                          value={driverForm.physical_address}
                          onChange={(e) => setDriverForm(prev => ({ ...prev, physical_address: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                            darkMode
                              ? 'bg-slate-600 border-slate-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          rows={2}
                          placeholder='Street address'
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>City</label>
                      <input
                        type='text'
                        value={driverForm.city}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, city: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder='e.g., Windhoek'
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Postal Code</label>
                      <input
                        type='text'
                        value={driverForm.postal_code}
                        onChange={(e) => setDriverForm(prev => ({ ...prev, postal_code: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder='e.g., 10001'
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
                >
                  {loading ? <RefreshCw className='w-4 h-4 animate-spin' /> : <UserCheck className='w-4 h-4' />}
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Driver List Tab */}
        {activeTab === TABS.DRIVER_LIST && (
          <div className='space-y-6'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Registered Drivers</h2>

              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    darkMode ? 'text-slate-400' : 'text-gray-400'
                  }`} />
                  <input
                    type='text'
                    value={driverSearchQuery}
                    onChange={(e) => setDriverSearchQuery(e.target.value)}
                    placeholder='Search drivers...'
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <button
                  onClick={loadDrivers}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className={darkMode ? 'bg-slate-700' : 'bg-gray-100'}>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>Name</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>ID Number</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>License No</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>Phone</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>City</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>Vehicles</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id} className={`border-b ${
                      darkMode ? 'border-slate-600' : 'border-gray-200'
                    }`}>
                      <td className={`px-4 py-3 font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {driver.firstname} {driver.lastname}
                      </td>
                      <td className={`px-4 py-3 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>{driver.id_no}</td>
                      <td className={`px-4 py-3 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>{driver.license_no || 'N/A'}</td>
                      <td className={`px-4 py-3 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>{driver.phone_number || 'N/A'}</td>
                      <td className={`px-4 py-3 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>{driver.city || 'N/A'}</td>
                      <td className={`px-4 py-3 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {driver.vehicle_count || 0}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <button
                          onClick={() => handleDriverSelect(driver)}
                          className={`p-1 rounded ${
                            darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                          }`}
                        >
                          <Edit2 className='w-4 h-4 text-blue-500' />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {drivers.length === 0 && (
                    <tr>
                      <td colSpan={7} className={`px-4 py-8 text-center ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        No drivers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Driver Edit Modal */}
            {selectedDriver && (
              <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                <div className={`rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
                  darkMode ? 'bg-slate-800' : 'bg-white'
                }`}>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className={`text-lg font-bold ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>Edit Driver</h3>
                    <button
                      onClick={() => setSelectedDriver(null)}
                      className={`p-1 rounded ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
                    >
                      <X className='w-5 h-5' />
                    </button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>First Name</label>
                      <input
                        type='text'
                        value={selectedDriver.firstname}
                        onChange={(e) => setSelectedDriver(prev => ({ ...prev, firstname: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Last Name</label>
                      <input
                        type='text'
                        value={selectedDriver.lastname}
                        onChange={(e) => setSelectedDriver(prev => ({ ...prev, lastname: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>ID Number</label>
                      <input
                        type='text'
                        value={selectedDriver.id_no}
                        onChange={(e) => setSelectedDriver(prev => ({ ...prev, id_no: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>License Number</label>
                      <input
                        type='text'
                        value={selectedDriver.license_no || ''}
                        onChange={(e) => setSelectedDriver(prev => ({ ...prev, license_no: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Phone</label>
                      <input
                        type='text'
                        value={selectedDriver.phone_number || ''}
                        onChange={(e) => setSelectedDriver(prev => ({ ...prev, phone_number: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Email</label>
                      <input
                        type='email'
                        value={selectedDriver.email || ''}
                        onChange={(e) => setSelectedDriver(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>City</label>
                      <input
                        type='text'
                        value={selectedDriver.city || ''}
                        onChange={(e) => setSelectedDriver(prev => ({ ...prev, city: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className='flex justify-end gap-4 mt-6'>
                    <button
                      onClick={() => setSelectedDriver(null)}
                      className={`px-4 py-2 rounded-lg ${
                        darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDriverUpdate}
                      disabled={loading}
                      className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Register Vehicle Tab */}
        {activeTab === TABS.REGISTER_VEHICLE && (
          <div className='space-y-6'>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>Register New Vehicle</h2>

            <form onSubmit={handleVehicleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {/* Vehicle Identification */}
                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Vehicle Identification *</h3>

                  <div className='space-y-4'>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Plate Number *</label>
                      <input
                        type='text'
                        value={vehicleForm.plate_no}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, plate_no: e.target.value.toUpperCase() }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder='e.g., N123456'
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>VIN *</label>
                      <input
                        type='text'
                        value={vehicleForm.vin}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder='Vehicle Identification Number'
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Engine Number</label>
                      <input
                        type='text'
                        value={vehicleForm.engine_no}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, engine_no: e.target.value.toUpperCase() }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Vehicle Details *</h3>

                  <div className='space-y-4'>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Make *</label>
                      <input
                        type='text'
                        value={vehicleForm.vehicle_make}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_make: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder='e.g., Toyota'
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Model *</label>
                      <input
                        type='text'
                        value={vehicleForm.vehicle_model}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_model: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder='e.g., Corolla'
                        required
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          darkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>Color *</label>
                        <input
                          type='text'
                          value={vehicleForm.vehicle_color}
                          onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_color: e.target.value }))}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode
                              ? 'bg-slate-600 border-slate-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder='e.g., Silver'
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          darkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>Year *</label>
                        <input
                          type='text'
                          value={vehicleForm.vehicle_year}
                          onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_year: e.target.value }))}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode
                              ? 'bg-slate-600 border-slate-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder='e.g., 2023'
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Type & Fuel */}
                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Type & Fuel</h3>

                  <div className='space-y-4'>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Vehicle Type</label>
                      <select
                        value={vehicleForm.vehicle_type}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_type: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        {VEHICLE_TYPES.map(type => (
                          <option key={type.code} value={type.code}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Fuel Type</label>
                      <select
                        value={vehicleForm.fuel_type}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, fuel_type: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        {FUEL_TYPES.map(type => (
                          <option key={type.code} value={type.code}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Seating Capacity</label>
                      <input
                        type='number'
                        value={vehicleForm.seating_capacity}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, seating_capacity: parseInt(e.target.value) || 5 }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        min={1}
                      />
                    </div>
                  </div>
                </div>

                {/* Owner Selection */}
                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Owner Information *</h3>

                  <div className='space-y-4'>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Owner</label>
                      <button
                        type='button'
                        onClick={() => setShowOwnerModal(true)}
                        className={`w-full px-4 py-2 rounded-lg border text-left ${
                          vehicleForm.owner_id
                            ? 'bg-green-900/30 border-green-600 text-green-400'
                            : darkMode
                            ? 'bg-slate-600 border-slate-500 text-slate-300'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {vehicleForm.owner_id ? 'Owner Selected ✓' : 'Select Owner...'}
                      </button>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Registration Expiry</label>
                      <div className='relative'>
                        <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                          darkMode ? 'text-slate-400' : 'text-gray-400'
                        }`} />
                        <input
                          type='date'
                          value={vehicleForm.registration_expiry}
                          onChange={(e) => setVehicleForm(prev => ({ ...prev, registration_expiry: e.target.value }))}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                            darkMode
                              ? 'bg-slate-600 border-slate-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Roadworthy & Insurance */}
                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Roadworthy Certificate</h3>

                  <div className='space-y-4'>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Certificate Number</label>
                      <input
                        type='text'
                        value={vehicleForm.roadworthy_cert_no}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, roadworthy_cert_no: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Expiry Date</label>
                      <input
                        type='date'
                        value={vehicleForm.roadworthy_expiry}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, roadworthy_expiry: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance */}
                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-bold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Insurance Information</h3>

                  <div className='space-y-4'>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Insurance Company</label>
                      <input
                        type='text'
                        value={vehicleForm.insurance_company}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, insurance_company: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Policy Number</label>
                      <input
                        type='text'
                        value={vehicleForm.insurance_policy_no}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, insurance_policy_no: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>Expiry Date</label>
                      <input
                        type='date'
                        value={vehicleForm.insurance_expiry}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, insurance_expiry: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
                >
                  {loading ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Truck className='w-4 h-4' />}
                  Register Vehicle
                </button>
              </div>
            </form>

            {/* Owner Selection Modal */}
            {showOwnerModal && (
              <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                <div className={`rounded-xl p-6 w-full max-w-md ${
                  darkMode ? 'bg-slate-800' : 'bg-white'
                }`}>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className={`text-lg font-bold ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>Select Vehicle Owner</h3>
                    <button
                      onClick={() => setShowOwnerModal(false)}
                      className={`p-1 rounded ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
                    >
                      <X className='w-5 h-5' />
                    </button>
                  </div>

                  <div className='relative mb-4'>
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      darkMode ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <input
                      type='text'
                      value={ownerSearch}
                      onChange={(e) => setOwnerSearch(e.target.value)}
                      placeholder='Search by name or ID...'
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      autoFocus
                    />
                  </div>

                  <div className={`max-h-64 overflow-y-auto rounded-lg border ${
                    darkMode ? 'border-slate-600' : 'border-gray-200'
                  }`}>
                    {drivers
                      .filter(d =>
                        !ownerSearch ||
                        d.firstname.toLowerCase().includes(ownerSearch.toLowerCase()) ||
                        d.lastname.toLowerCase().includes(ownerSearch.toLowerCase()) ||
                        d.id_no.includes(ownerSearch)
                      )
                      .map(driver => (
                        <button
                          key={driver.id}
                          onClick={() => handleSelectOwner(driver)}
                          className={`w-full text-left p-3 border-b ${
                            darkMode
                              ? 'border-slate-600 hover:bg-slate-700'
                              : 'border-gray-200 hover:bg-gray-50'
                          } ${driver.id === vehicleForm.owner_id ? 'bg-blue-900/30' : ''}`}
                        >
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{driver.firstname} {driver.lastname}</p>
                          <p className={`text-sm ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>ID: {driver.id_no}</p>
                        </button>
                      ))}
                    {drivers.filter(d =>
                      !ownerSearch ||
                      d.firstname.toLowerCase().includes(ownerSearch.toLowerCase()) ||
                      d.lastname.toLowerCase().includes(ownerSearch.toLowerCase()) ||
                      d.id_no.includes(ownerSearch)
                    ).length === 0 && (
                      <p className={`p-4 text-center ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>No drivers found</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vehicle List Tab */}
        {activeTab === TABS.VEHICLE_LIST && (
          <div className='space-y-6'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Registered Vehicles</h2>

              <div className='flex items-center gap-4'>
                <select
                  value={vehicleStatusFilter}
                  onChange={(e) => setVehicleStatusFilter(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">All Statuses</option>
                  {VEHICLE_STATUSES.map(status => (
                    <option key={status.code} value={status.code}>{status.name}</option>
                  ))}
                </select>

                <div className='relative'>
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    darkMode ? 'text-slate-400' : 'text-gray-400'
                  }`} />
                  <input
                    type='text'
                    value={vehicleSearchQuery}
                    onChange={(e) => setVehicleSearchQuery(e.target.value)}
                    placeholder='Search vehicles...'
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <button
                  onClick={loadVehicles}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className={darkMode ? 'bg-slate-700' : 'bg-gray-100'}>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>Plate No</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>Vehicle</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>Type</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>VIN</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>Owner</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>Status</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>Reg. Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className={`border-b ${
                      darkMode ? 'border-slate-600' : 'border-gray-200'
                    }`}>
                      <td className={`px-4 py-3 font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>{vehicle.plate_no}</td>
                      <td className={`px-4 py-3 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>
                        {vehicle.vehicle_year} {vehicle.vehicle_make} {vehicle.vehicle_model}
                      </td>
                      <td className={`px-4 py-3 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          darkMode ? 'bg-slate-600' : 'bg-gray-200'
                        }`}>
                          {vehicle.vehicle_type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {vehicle.vin?.substring(0, 8)}...
                      </td>
                      <td className={`px-4 py-3 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>
                        {vehicle.owner?.name || 'N/A'}
                      </td>
                      <td className='px-4 py-3'>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === 'registered'
                            ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                            : vehicle.status === 'expired'
                            ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                            : darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>
                        {vehicle.registration_expiry ? new Date(vehicle.registration_expiry).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {vehicles.length === 0 && (
                    <tr>
                      <td colSpan={7} className={`px-4 py-8 text-center ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        No vehicles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper component for Users icon
function Users({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

