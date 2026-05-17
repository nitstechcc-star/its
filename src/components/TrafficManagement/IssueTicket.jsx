import { useState, useEffect } from 'react'
import { issueTicket } from '../../Axios'
import { X, AlertCircle, CheckCircle, Info, Car, CreditCard, MapPin, DollarSign, Calendar, FileText, User, Hash, Printer, Truck, Loader2 } from 'lucide-react'
import PrintTicketModal from '../Print/PrintTicketModal'

export default function IssueTicket({ open, onClose, onSuccess }) {
  // If no open prop provided, default to showing the form inline
  const isModal = open !== undefined;
  const [showModal, setShowModal] = useState(isModal ? open : true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Auto-detect location on component mount
  useEffect(() => {
    if (isModal) {
      setShowModal(open);
    }

    // Automatically get location when component mounts
    detectLocation();
  }, [open, isModal]);

  // Function to detect GPS coordinates using browser Geolocation API
  const detectLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          gps_coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const [formData, setFormData] = useState({
    plate_no: '',
    amount: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_color: '',
    vehicle_year: '',
    location: '',
    gps_coordinates: '',
    road_number: '',
    road_type: '',
    region: '',
    violation_type: 'speeding',
    violation_time: '',
    officer_notes: '',
    status: 'pending',
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [issuedTicketData, setIssuedTicketData] = useState(null)

  const violationTypes = [
    { code: 'speeding', name: 'Speeding' },
    { code: 'red_light', name: 'Red Light Violation' },
    { code: 'illegal_parking', name: 'Illegal Parking' },
    { code: 'dui', name: 'Driving Under Influence (DUI)' },
    { code: 'no_license', name: 'Driving Without License' },
    { code: 'expired_license', name: 'Expired License' },
    { code: 'no_registration', name: 'No/Expired Vehicle Registration' },
    { code: 'no_inspection', name: 'Failed Vehicle Inspection' },
    { code: 'cell_phone', name: 'Using Cell Phone While Driving' },
    { code: 'seatbelt', name: 'Not Wearing Seatbelt' },
    { code: 'reckless', name: 'Reckless Driving' },
    { code: 'overloading', name: 'Vehicle Overloading' },
    { code: 'one_way', name: 'One-Way Street Violation' },
    { code: 'stop_sign', name: 'Failure to Stop at Stop Sign' },
    { code: 'no_helmet', name: 'Motorcycle - No Helmet' },
    { code: 'illegal_turn', name: 'Illegal Turn/U-Turn' },
    { code: 'pedestrian', name: 'Pedestrian Crossing Violation' },
    { code: 'drug_driving', name: 'Driving Under Drugs' },
    { code: 'hit_run', name: 'Hit and Run' },
    { code: 'unroadworthy', name: 'Unroadworthy Vehicle' },
    { code: 'wrong_lane', name: 'Wrong Lane Usage' },
    { code: 'tailgating', name: 'Tailgating' },
    { code: 'overtaking', name: 'Illegal Overtaking' },
    { code: 'no_insurance', name: 'No Motor Vehicle Insurance' },
    { code: 'unlicensed_vehicle', name: 'Unlicensed Vehicle' },
    { code: 'noise_violation', name: 'Excessive Noise' },
    { code: 'other', name: 'Other Offence' },
  ]

  const roadTypes = [
    { code: 'national', name: 'National Road (B1, B2, B3, etc.)' },
    { code: 'district', name: 'District Road (M1, M2, etc.)' },
    { code: 'urban', name: 'Urban Road' },
    { code: 'street', name: 'Street' },
    { code: 'avenue', name: 'Avenue' },
    { code: 'other', name: 'Other' },
  ]

  const regions = [
    { code: 'khomas', name: 'Khomas Region' },
    { code: 'erongo', name: 'Erongo Region' },
    { code: 'omasati', name: 'Omasati Region' },
    { code: 'oshana', name: 'Oshana Region' },
    { code: 'oshikoto', name: 'Oshikoto Region' },
    { code: 'ohangwena', name: 'Ohangwena Region' },
    { code: 'kunene', name: 'Kunene Region' },
    { code: 'kavango_east', name: 'Kavango East Region' },
    { code: 'kavango_west', name: 'Kavango West Region' },
    { code: 'zambezi', name: 'Zambezi Region' },
    { code: 'hardap', name: 'Hardap Region' },
    { code: 'karas', name: 'Karas Region' },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleClose = () => {
    if (isModal) {
      onClose?.();
    } else {
      setShowModal(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    if (!formData.plate_no) {
      setError('Plate number is required')
      setLoading(false)
      return
    }

    try {
      const result = await issueTicket(formData)
      if (result.success) {
        setSuccess(true)
        setIssuedTicketData({
          ticket_issued: result.ticket_number || formData.plate_no,
          plate_no: formData.plate_no,
          violation_type: formData.violation_type,
          amount: formData.amount,
          location: formData.location,
          date: new Date().toISOString(),
          status: 'pending'
        })

        // Reset form and detect new location
        setFormData({
          plate_no: '',
          amount: '',
          vehicle_make: '',
          vehicle_model: '',
          vehicle_color: '',
          vehicle_year: '',
          location: '',
          gps_coordinates: '',
          road_number: '',
          road_type: '',
          region: '',
          violation_type: 'speeding',
          violation_time: '',
          officer_notes: '',
          status: 'pending',
        })

        // Detect location for next ticket
        detectLocation();

        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        setError(result.error?.detail || JSON.stringify(result.error) || 'Failed to issue ticket')
      }
    } catch (err) {
      setError('Error issuing ticket: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    setIssuedTicketData({
      ticket_issued: formData.plate_no,
      plate_no: formData.plate_no,
      violation_type: formData.violation_type,
      amount: formData.amount,
      location: formData.location,
      date: new Date().toISOString(),
      status: 'pending'
    });
    setPrintModalOpen(true);
  };

  // If not modal and not showing, return null
  if (!isModal && !showModal) return null;

  return (
    <>
      <div className={isModal ? 'fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-0 md:p-4' : ''}>
        <div className={`bg-white dark:bg-slate-900 rounded-t-2xl md:rounded-lg w-full md:max-w-3xl md:max-h-[90vh] overflow-hidden ${
          isModal ? 'max-h-[85vh] md:max-h-[90vh]' : ''
        } ${localStorage.getItem('darkMode') === 'true' ? 'border-slate-700' : 'border-gray-200'}`}>

          {/* Header */}
          <div className={`px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between sticky top-0 z-10 ${
            localStorage.getItem('darkMode') === 'true' ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold dark:text-white">Issue Traffic Ticket</h2>
                <p className="text-xs md:text-sm dark:text-slate-400 hidden md:block">Fill in the violation details below</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className='px-6 pt-4'>
            {error && (
              <div className='flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg mb-3'>
                <AlertCircle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
                <p className='text-red-600 dark:text-red-400 text-sm'>{error}</p>
              </div>
            )}

            {success && (
              <div className='flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg mb-3'>
                <CheckCircle className='w-5 h-5 text-green-500 shrink-0 mt-0.5' />
                <div className='flex-1'>
                  <p className='text-green-600 dark:text-green-400 font-medium'>Ticket issued successfully!</p>
                  <p className='text-green-500 dark:text-green-500 text-sm mt-1'>A unique ticket number has been generated by the system.</p>
                  <button
                    onClick={handlePrint}
                    className='mt-2 flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors'
                  >
                    <Printer className='w-4 h-4' />
                    Print Ticket
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='p-4 md:p-6 space-y-6 overflow-y-auto max-h-[60vh] md:max-h-[70vh]'>

            {/* Vehicle Information */}
            <div>
              <h3 className="text-sm font-semibold dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    name="plate_no"
                    value={formData.plate_no}
                    onChange={handleChange}
                    placeholder="ABC-123"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Vehicle Make
                  </label>
                  <input
                    type="text"
                    name="vehicle_make"
                    value={formData.vehicle_make}
                    onChange={handleChange}
                    placeholder="Toyota"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    name="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={handleChange}
                    placeholder="Corolla"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Vehicle Color
                  </label>
                  <input
                    type="text"
                    name="vehicle_color"
                    value={formData.vehicle_color}
                    onChange={handleChange}
                    placeholder="Silver"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Vehicle Year
                  </label>
                  <input
                    type="text"
                    name="vehicle_year"
                    value={formData.vehicle_year}
                    onChange={handleChange}
                    placeholder="2024"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Violation Details */}
            <div>
              <h3 className="text-sm font-semibold dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Violation Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Violation Type
                  </label>
                  <select
                    name="violation_type"
                    value={formData.violation_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {violationTypes.map(type => (
                      <option key={type.code} value={type.code}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Fine Amount (N$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-slate-500">N$</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="1.00"
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Officer Notes
                  </label>
                  <textarea
                    name="officer_notes"
                    value={formData.officer_notes}
                    onChange={handleChange}
                    placeholder="Provide detailed information about the violation..."
                    rows="3"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div>
              <h3 className="text-sm font-semibold dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Location of Violation
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter street/area name"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
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
                      className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                        <MapPin className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {locationError && (
                    <p className="text-red-500 text-xs mt-1">{locationError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Road Number
                  </label>
                  <input
                    type="text"
                    name="road_number"
                    value={formData.road_number}
                    onChange={handleChange}
                    placeholder="B1"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Road Type
                  </label>
                  <select
                    name="road_type"
                    value={formData.road_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Road Type</option>
                    {roadTypes.map(type => (
                      <option key={type.code} value={type.code}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Region
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Region</option>
                    {regions.map(region => (
                      <option key={region.code} value={region.code}>{region.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className='flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg'>
              <Info className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
              <p className='text-blue-600 dark:text-blue-400 text-sm'>
                Ticket number will be automatically generated by the system in format: <code className='px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800/30 rounded text-xs'>NAM-YYYY-XXXXXX</code>
              </p>
            </div>

            {/* Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 sm:justify-end pt-3 border-t border-slate-200 dark:border-slate-700 pb-4 md:pb-0'>
              <button
                type='button'
                onClick={handleClose}
                disabled={loading}
                className='w-full sm:w-auto px-5 py-3 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg transition-all disabled:opacity-50 font-medium'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading}
                className='w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className='w-4 h-4' />
                    Issue Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Print Modal */}
      <PrintTicketModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        ticket={issuedTicketData}
      />
    </>
  )
}

