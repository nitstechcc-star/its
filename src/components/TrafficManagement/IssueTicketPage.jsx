import { useState, useEffect } from 'react'
import {
  Plus, Car, FileText, MapPin, DollarSign,
  AlertTriangle, Save, RefreshCw, CheckCircle, MapPinned, Truck,
  User, Calendar, Clock, Navigation, Loader2, Search
} from 'lucide-react'
import { issueTicket, lookupVehicle } from '../../Axios'

// Static data for road types
const roadTypesList = [
  { code: 'national', name: 'National Road (B1, B2, B3, etc.)' },
  { code: 'district', name: 'District Road (M1, M2, etc.)' },
  { code: 'urban', name: 'Urban Road' },
  { code: 'street', name: 'Street' },
  { code: 'avenue', name: 'Avenue' },
  { code: 'other', name: 'Other' },
]

// Static violation types with fines
const violationTypesList = [
  { code: 'speeding', name: 'Speeding', fine: 500, description: 'Exceeding speed limit' },
  { code: 'red_light', name: 'Red Light Violation', fine: 750, description: 'Failure to stop at red light' },
  { code: 'illegal_parking', name: 'Illegal Parking', fine: 300, description: 'Parking in prohibited area' },
  { code: 'dui', name: 'Driving Under Influence (DUI)', fine: 5000, description: 'Driving under influence of alcohol' },
  { code: 'no_license', name: 'Driving Without License', fine: 1000, description: 'Operating vehicle without valid license' },
  { code: 'expired_license', name: 'Expired License', fine: 500, description: 'Driving with expired license' },
  { code: 'no_registration', name: 'No/Expired Registration', fine: 800, description: 'Vehicle not registered or expired' },
  { code: 'no_inspection', name: 'Failed Vehicle Inspection', fine: 600, description: 'Operating unroadworthy vehicle' },
  { code: 'cell_phone', name: 'Using Cell Phone While Driving', fine: 400, description: 'Using mobile phone while driving' },
  { code: 'seatbelt', name: 'Not Wearing Seatbelt', fine: 300, description: 'Failure to wear seatbelt' },
  { code: 'reckless', name: 'Reckless Driving', fine: 3000, description: 'Dangerous/reckless operation of vehicle' },
  { code: 'overloading', name: 'Vehicle Overloading', fine: 1500, description: 'Exceeding vehicle load capacity' },
  { code: 'one_way', name: 'One-Way Street Violation', fine: 400, description: 'Driving against one-way traffic' },
  { code: 'stop_sign', name: 'Failure to Stop at Stop Sign', fine: 500, description: 'Not stopping at stop sign' },
  { code: 'no_helmet', name: 'Motorcycle - No Helmet', fine: 400, description: 'Rider not wearing helmet' },
  { code: 'illegal_turn', name: 'Illegal Turn/U-Turn', fine: 500, description: 'Making illegal turn or U-turn' },
  { code: 'pedestrian', name: 'Pedestrian Crossing Violation', fine: 1000, description: 'Failure to yield to pedestrians' },
  { code: 'drug_driving', name: 'Driving Under Drugs', fine: 5000, description: 'Driving under influence of drugs' },
  { code: 'hit_run', name: 'Hit and Run', fine: 10000, description: 'Leaving scene of accident' },
  { code: 'unroadworthy', name: 'Unroadworthy Vehicle', fine: 1000, description: 'Operating unroadworthy vehicle' },
  { code: 'wrong_lane', name: 'Wrong Lane Usage', fine: 400, description: 'Driving in wrong lane' },
  { code: 'tailgating', name: 'Tailgating', fine: 500, description: 'Following too closely' },
  { code: 'overtaking', name: 'Illegal Overtaking', fine: 800, description: 'Illegal passing of vehicles' },
  { code: 'no_insurance', name: 'No Motor Vehicle Insurance', fine: 2000, description: 'Operating without insurance' },
  { code: 'unlicensed_vehicle', name: 'Unlicensed Vehicle', fine: 1500, description: 'Operating unregistered vehicle' },
  { code: 'noise_violation', name: 'Excessive Noise', fine: 300, description: 'Excessive vehicle noise' },
  { code: 'other', name: 'Other Offence', fine: 500, description: 'Other traffic offences' },
]

// Static Namibian regions
const namibianRegions = [
  { code: 'khomas', name: 'Khomas Region' },
  { code: 'erongo', name: 'Erongo Region' },
  { code: 'omasati', name: 'Omasati Region' },
  { code: 'oshana', name: 'Oshana Region' },
  { code: 'oshikoto', name: 'Oshikoto Region' },
  { code: 'ohangwena', name: 'Ohangwena Region' },
  { code: 'omusati', name: 'Omusati Region' },
  { code: 'kunene', name: 'Kunene Region' },
  { code: 'kavango_east', name: 'Kavango East Region' },
  { code: 'kavango_west', name: 'Kavango West Region' },
  { code: 'zambezi', name: 'Zambezi Region' },
  { code: 'hardap', name: 'Hardap Region' },
  { code: 'karas', name: 'Karas Region' },
]

export default function IssueTicketPage() {
  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().slice(0, 5)
    return { date, time }
  }

  const currentDateTime = getCurrentDateTime()

  // Form state
  const [formData, setFormData] = useState({
    plate_no: '',
    vin: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_color: '',
    vehicle_year: '',
    violation_type: 'speeding',
    amount: '500',
    location: '',
    road_number: '',
    road_type: '',
    region: 'khomas',
    gps_coordinates: '',
    officer_notes: '',
    violation_date: currentDateTime.date,
    violation_time: currentDateTime.time,
    // Driver details
    driver_name: '',
    driver_license_no: '',
    driver_id_no: '',
    driver_phone: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [activeStep, setActiveStep] = useState(1)

  // Location state
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)

// Vehicle lookup state
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [vehicleError, setVehicleError] = useState(null)
  const [vehicleFound, setVehicleFound] = useState(false)

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation()
  }, [])

  // Function to detect GPS coordinates using browser Geolocation API
  const detectLocation = () => {
    setLocationLoading(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const gpsCoords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`

        // Try to get location name using reverse geocoding (Nominatim API)
        let locationName = ''
        let roadType = ''
        let roadNumber = ''
        let regionCode = ''

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'ITS-Web-App/1.0'
              }
            }
          )
          if (response.ok) {
            const data = await response.json()
            if (data.address) {
              const addr = data.address

              // Build location name
              const parts = []
              if (addr.road) parts.push(addr.road)
              if (addr.suburb) parts.push(addr.suburb)
              if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village)
              if (addr.state) parts.push(addr.state)
              locationName = parts.join(', ')

              // Get road number from address
              if (addr.house_number) {
                roadNumber = addr.house_number
              }

              // Determine road type based on road classification
              if (addr.road) {
                // Check if it's a national road (B1, B2, etc.)
                if (addr.road.match(/^B\d+/i)) {
                  roadType = 'national'
                  roadNumber = addr.road.match(/B\d+/i)?.[0] || roadNumber
                } else if (addr.road.match(/^M\d+/i)) {
                  roadType = 'district'
                  roadNumber = addr.road.match(/M\d+/i)?.[0] || roadNumber
                } else if (addr.city || addr.town) {
                  // Urban road in a city
                  roadType = 'urban'
                } else {
                  roadType = 'street'
                }
              }

              // Map region name to code
              const regionMap = {
                'Khomas': 'khomas',
                'Erongo': 'erongo',
                'Oshana': 'oshana',
                'Oshikoto': 'oshikoto',
                'Ohangwena': 'ohangwena',
                'Omusati': 'omusati',
                'Omasati': 'omasati',
                'Kunene': 'kunene',
                'Kavango East': 'kavango_east',
                'Kavango West': 'kavango_west',
                'Zambezi': 'zambezi',
                'Hardap': 'hardap',
                'Karas': 'karas',
              }
              regionCode = regionMap[addr.state] || 'khomas'
            }
            if (!locationName && data.display_name) {
              locationName = data.display_name.split(',').slice(0, 3).join(', ')
            }
          }
        } catch {
          console.log('Reverse geocoding failed, using coordinates only')
        }

        setFormData(prev => ({
          ...prev,
          gps_coordinates: gpsCoords,
          location: locationName || prev.location,
          road_type: roadType || prev.road_type,
          road_number: roadNumber || prev.road_number,
          region: regionCode || prev.region
        }))
        setLocationLoading(false)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
          default:
            errorMessage = 'An unknown error occurred.'
        }
        setLocationError(errorMessage)
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Handle vehicle lookup by plate number or VIN
  const handlePlateLookup = async () => {
    const searchTerm = formData.plate_no || formData.vin
    if (!searchTerm || searchTerm.length < 3) {
      setVehicleError('Please enter a valid plate number or VIN')
      return
    }

    setVehicleLoading(true)
    setVehicleError(null)
    setVehicleFound(false)

    try {
      // First try plate number lookup
      let result = await lookupVehicle(formData.plate_no)

      // If not found by plate, try VIN lookup
      if (!result.success || !result.data?.found) {
        // Try to get vehicles by VIN from NATIS API
        result = await lookupVehicle(formData.vin)
      }

      if (result.success && result.data?.found) {
        setFormData(prev => ({
          ...prev,
          plate_no: result.data.plate_no || prev.plate_no,
          vehicle_make: result.data.vehicle?.make || prev.vehicle_make,
          vehicle_model: result.data.vehicle?.model || prev.vehicle_model,
          vehicle_color: result.data.vehicle?.color || prev.vehicle_color,
          vehicle_year: result.data.vehicle?.year || prev.vehicle_year,
        }))
        setVehicleFound(true)
      } else {
        setVehicleError('Vehicle not found in NATIS database. Please enter details manually.')
      }
    } catch {
      setVehicleError('Error looking up vehicle')
    } finally {
      setVehicleLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Auto-fill amount based on violation type
    if (name === 'violation_type') {
      const violation = violationTypesList.find(v => v.code === value)
      if (violation) {
        setFormData(prev => ({ ...prev, amount: violation.fine.toString() }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await issueTicket(formData)
      if (result.success) {
        setSuccess({
          ticketNumber: result.ticket_number,
          message: 'Ticket issued successfully!'
        })
        // Reset form with current date/time
        const newDateTime = getCurrentDateTime()
        setFormData({
          plate_no: '',
          vin: '',
          vehicle_make: '',
          vehicle_model: '',
          vehicle_color: '',
          vehicle_year: '',
          violation_type: 'speeding',
          amount: '500',
          location: '',
          road_number: '',
          road_type: '',
          region: 'khomas',
          gps_coordinates: formData.gps_coordinates, // Keep the GPS coordinates
          officer_notes: '',
          violation_date: newDateTime.date,
          violation_time: newDateTime.time,
          driver_name: '',
          driver_license_no: '',
          driver_id_no: '',
          driver_phone: '',
        })
        setActiveStep(1)
        setVehicleFound(false)
      } else {
        setError(typeof result.error === 'object' ? JSON.stringify(result.error) : result.error || 'Failed to issue ticket')
      }
    } catch {
      setError('An error occurred while issuing the ticket')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, title: 'Vehicle Info', icon: Car },
    { id: 2, title: 'Driver Details', icon: User },
    { id: 3, title: 'Violation', icon: AlertTriangle },
    { id: 4, title: 'Review & Issue', icon: FileText }
  ]

  return (
    <div className="space-y-6 overflow-hidden min-h-0">
      {/* Header */}
      <div className="rounded-xl border p-6 shrink-0 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Plus className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Issue Traffic Ticket</h1>
            <p className="text-sm mt-1 text-gray-600 dark:text-slate-400">
              Record a new traffic violation and issue a fine
            </p>
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="rounded-xl border p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <div className="flex items-center overflow-x-auto hide-scrollbar">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center shrink-0">
              <button
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeStep === step.id
                    ? 'bg-blue-500 text-white'
                    : activeStep > step.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {activeStep > step.id ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 shrink-0 ${
                  activeStep > step.id
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-slate-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border overflow-hidden bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Vehicle Info */}
          {activeStep === 1 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Vehicle Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Plate Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="plate_no"
                      value={formData.plate_no}
                      onChange={handleChange}
                      required
                      placeholder="NLD-12345"
                      className="px-4 py-2.5 rounded-lg flex-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                    <button
                      type="button"
                      onClick={handlePlateLookup}
                      disabled={vehicleLoading || (!formData.plate_no && !formData.vin)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {vehicleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {vehicleError && (
                    <p className="text-xs text-amber-500 mt-1">{vehicleError}</p>
                  )}
                  {vehicleFound && (
                    <p className="text-xs text-green-500 mt-1">✓ Vehicle found in NATIS database</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    VIN (Vehicle ID)
                  </label>
                  <input
                    type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    placeholder="VIN123456789"
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Vehicle Year
                  </label>
                  <input
                    type="text"
                    name="vehicle_year"
                    value={formData.vehicle_year}
                    onChange={handleChange}
                    placeholder="2024"
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Vehicle Make *
                  </label>
                  <input
                    type="text"
                    name="vehicle_make"
                    value={formData.vehicle_make}
                    onChange={handleChange}
                    required
                    placeholder="Toyota"
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    name="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={handleChange}
                    required
                    placeholder="Corolla"
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Vehicle Color
                  </label>
                  <input
                    type="text"
                    name="vehicle_color"
                    value={formData.vehicle_color}
                    onChange={handleChange}
                    placeholder="Silver"
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  Next Step
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Driver Details */}
          {activeStep === 2 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Driver Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    name="driver_name"
                    value={formData.driver_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="driver_license_no"
                    value={formData.driver_license_no}
                    onChange={handleChange}
                    placeholder="NLD-1234567"
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    ID Number
                  </label>
                  <input
                    type="text"
                    name="driver_id_no"
                    value={formData.driver_id_no}
                    onChange={handleChange}
                    placeholder="9201011234"
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="driver_phone"
                    value={formData.driver_phone}
                    onChange={handleChange}
                    placeholder="+264 81 123 4567"
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-6 py-2.5 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  Next Step
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Violation Details */}
          {activeStep === 3 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Violation Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Violation Type *
                  </label>
                  <select
                    name="violation_type"
                    value={formData.violation_type}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {violationTypesList.map(violation => (
                      <option key={violation.code} value={violation.code}>
                        {violation.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Fine Amount (NAD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      className="pl-10 pr-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Violation Date (Auto)
                  </label>
                  <input
                    type="date"
                    name="violation_date"
                    value={formData.violation_date}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-100 dark:bg-slate-600 border-gray-200 dark:border-slate-500 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Violation Time (Auto)
                  </label>
                  <input
                    type="time"
                    name="violation_time"
                    value={formData.violation_time}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-100 dark:bg-slate-600 border-gray-200 dark:border-slate-500 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Location Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location Description *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="Near Shopping Centre, Main Street"
                      className="pl-10 pr-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Road Number
                  </label>
                  <input
                    type="text"
                    name="road_number"
                    value={formData.road_number}
                    onChange={handleChange}
                    placeholder="B1"
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Road Type
                  </label>
                  <select
                    name="road_type"
                    value={formData.road_type}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select road type</option>
                    {roadTypesList.map(type => (
                      <option key={type.code} value={type.code}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Region
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-lg w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {namibianRegions.map(region => (
                      <option key={region.code} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    <Navigation className="w-4 h-4 inline mr-1" />
                    GPS Coordinates
                    {locationLoading && <span className="ml-2 text-blue-500 text-xs">(Detecting...)</span>}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="gps_coordinates"
                      value={formData.gps_coordinates}
                      onChange={handleChange}
                      placeholder={locationLoading ? "Detecting location..." : "-22.5597, 17.0832"}
                      disabled={locationLoading}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={locationLoading}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                      title="Get current location"
                    >
                      {locationLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {locationError && (
                    <p className="text-red-500 text-xs mt-1">{locationError}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
                    Officer Notes
                  </label>
                  <textarea
                    name="officer_notes"
                    value={formData.officer_notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional details about the violation..."
                    className="px-4 py-2.5 rounded-lg w-full resize-none bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  Review Ticket
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Issue */}
          {activeStep === 4 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Review & Issue Ticket</h2>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-500">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <span className="text-green-500 font-medium">{success.message}</span>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Ticket Number: <span className="font-mono font-bold">{success.ticketNumber}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Review Summary */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Ticket Summary</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Plate Number</span>
                    <p className="font-medium text-gray-900 dark:text-white uppercase">
                      {formData.plate_no || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Vehicle</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formData.vehicle_make} {formData.vehicle_model}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Fine Amount</span>
                    <p className="font-medium text-green-500">N${formData.amount || '0'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Violation</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {violationTypesList.find(v => v.code === formData.violation_type)?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Date & Time</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formData.violation_date} {formData.violation_time}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Location</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formData.location || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Region</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {namibianRegions.find(r => r.code === formData.region)?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">GPS</span>
                    <p className="font-medium text-gray-900 dark:text-white text-xs">
                      {formData.gps_coordinates || '-'}
                    </p>
                  </div>
                </div>

                {/* Driver Section in Summary */}
                {(formData.driver_name || formData.driver_license_no || formData.driver_id_no) && (
                  <div className="border-t border-gray-200 dark:border-slate-600 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Driver Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {formData.driver_name && (
                        <div>
                          <span className="text-gray-500 dark:text-slate-400">Name</span>
                          <p className="font-medium text-gray-900 dark:text-white">{formData.driver_name}</p>
                        </div>
                      )}
                      {formData.driver_license_no && (
                        <div>
                          <span className="text-gray-500 dark:text-slate-400">License</span>
                          <p className="font-medium text-gray-900 dark:text-white uppercase">{formData.driver_license_no}</p>
                        </div>
                      )}
                      {formData.driver_id_no && (
                        <div>
                          <span className="text-gray-500 dark:text-slate-400">ID Number</span>
                          <p className="font-medium text-gray-900 dark:text-white">{formData.driver_id_no}</p>
                        </div>
                      )}
                      {formData.driver_phone && (
                        <div>
                          <span className="text-gray-500 dark:text-slate-400">Phone</span>
                          <p className="font-medium text-gray-900 dark:text-white">{formData.driver_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Issue Ticket
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

