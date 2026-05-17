import axios from "axios";


//const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/'

const isDevelopment = import.meta.env.MODE === 'development'
const baseURL = isDevelopment ? (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/') : (import.meta.env.VITE_API_URL_DEPLOY || 'https://its-backend-1.onrender.com/api/')

const LOGIN_URL = `${baseURL}login/`
const REFRESH_URL = `${baseURL}token/refresh/`
const REGISTER_URL = `${baseURL}register/`
const LOGOUT_URL = `${baseURL}logout/`
const AUTH_URL = `${baseURL}authenticate/`

const OFFICER_URL = `${baseURL}officers/`
const OFFICER_TICKETS_URL = `${baseURL}officers/tickets/`
const TICKET_URL = `${baseURL}ticket/`
const ISSUE_TICKET_URL = `${baseURL}tickets/issue/`
const SEARCH_TICKETS_URL = `${baseURL}tickets/search/`
const LOOKUP_TICKET_URL = `${baseURL}tickets/lookup/`
const ALL_TICKETS_URL = `${baseURL}tickets/all/`
const ALL_OFFICERS_TICKETS_URL = `${baseURL}tickets/all-officers/`

const ANALYTICS_URL = `${baseURL}analytics/`
const DEFENDANTS_URL = `${baseURL}defendants/`
const AUDIT_LOGS_URL = `${baseURL}audit-logs/`

const JUDGE_SCHEDULE_URL = `${baseURL}judge/schedule/`
const JUDGE_CASES_URL = `${baseURL}judge/cases/`
const JUDGE_CALENDAR_URL = `${baseURL}judge/calendar/`
const JUDGE_NOTIFICATIONS_URL = `${baseURL}judge/notifications/`
const JUDGE_STATS_URL = `${baseURL}judge/statistics/`
const JUDGE_MARK_READ_URL = `${baseURL}judge/notifications/`
const USERS_URL = `${baseURL}users/`

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// Get stored tokens
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

// Store tokens
const setTokens = (accessToken, refreshToken = null) => {
    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    }
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
}

// Clear tokens on logout
export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem('user')
}

// Create axios instance with default config
const api = axios.create({
    baseURL,
    withCredentials: true
})

// Request interceptor - add Authorization header
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 and haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = getRefreshToken()
                if (refreshToken) {
                    const response = await axios.post(
                        REFRESH_URL,
                        { refresh: refreshToken },
                        { withCredentials: true }
                    )

                    const { access } = response.data
                    setTokens(access, refreshToken)

                    originalRequest.headers.Authorization = `Bearer ${access}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                clearTokens()
                // Redirect to login if refresh fails
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

// ======================
// Authentication
// ======================

export const login = async (username, password) => {
    try {
        const response = await api.post(
            LOGIN_URL,
            { username, password }
        )

        // JWT token endpoint returns access and refresh tokens
        const { access, refresh, role, username: responseUsername, is_superuser } = response.data

        if (access) {
            // Store tokens
            setTokens(access, refresh)

            // Store user info in localStorage immediately
            const userData = {
                username: responseUsername || username,
                role: role || 'admin', // Default to admin for superusers
                is_active: true,
                is_superuser: is_superuser || false
            }
            localStorage.setItem('user', JSON.stringify(userData))

            return { success: true, data: response.data }
        }
        return { success: false, error: 'No access token received' }
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message)

        // Handle different error formats
        let errorMessage = 'An error occurred during login'

        if (error.response) {
            // Server responded with error
            const responseData = error.response.data
            if (typeof responseData === 'string') {
                errorMessage = responseData
            } else if (responseData.detail) {
                errorMessage = responseData.detail
            } else if (responseData.message) {
                errorMessage = responseData.message
            } else if (Array.isArray(responseData)) {
                errorMessage = responseData.join(', ')
            } else if (typeof responseData === 'object') {
                // Get first error value
                const firstKey = Object.keys(responseData)[0]
                if (firstKey) {
                    const firstError = responseData[firstKey]
                    errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
                }
            }
        } else if (error.request) {
            // Network error - no response received
            errorMessage = 'Unable to connect to server. Please check your internet connection.'
        } else {
            errorMessage = error.message || 'An unexpected error occurred'
        }

        return { success: false, error: errorMessage }
    }
}

export const registerUser = async (username, email, password, role = 'officer') => {
    try {
        const response = await api.post(
            REGISTER_URL,
            { username, email, password, role }
        )
        return response.data
    } catch (error) {
        if (error.response && error.response.data) return { success: false, error: error.response.data }
        return { success: false, error: error.message }
    }
}

export const logout = async () => {
    try {
        await api.post(LOGOUT_URL, {})
        clearTokens()
        return true
    } catch {
        clearTokens()
        return false
    }
}

export const isAuthenticated = async () => {
    try {
        const response = await api.get(AUTH_URL)
        return response.data
    } catch {
        return { authenticated: false }
    }
}

export const refresh_token = async () => {
    try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
            return false
        }

        const response = await axios.post(
            REFRESH_URL,
            { refresh: refreshToken },
            { withCredentials: true }
        )

        const { access, refresh } = response.data
        setTokens(access, refresh)
        return true
    } catch {
        clearTokens()
        return false
    }
}

// ======================
// Officers
// ======================

export const get_officers = async () => {
    try {
        const response = await api.get(OFFICER_URL)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const createOfficer = async (officerData) => {
    try {
        const response = await api.post(`${OFFICER_URL}create/`, officerData)
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getOfficerById = async (id) => {
    try {
        const response = await api.get(`${OFFICER_URL}${id}/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const updateOfficer = async (officerId, officerData) => {
    try {
        const response = await api.put(`${OFFICER_URL}${officerId}/update/`, officerData)
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const deleteOfficer = async (officerId) => {
    try {
        const response = await api.delete(`${OFFICER_URL}${officerId}/delete/`)
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

// ======================
// Tickets
// ======================

export const get_ticket = async (ticketId = null) => {
    const url = ticketId ? `${TICKET_URL}?ticket_id=${ticketId}` : TICKET_URL
    try {
        const response = await api.get(url)
        return response.data
    } catch (error) {
        if (error.response && error.response.status === 401) {
            const token_refreshed = await refresh_token()
            if (token_refreshed) {
                const retryResponse = await api.get(url)
                return retryResponse.data
            }
        }
        if (error.response && error.response.data) {
            return { error: error.response.data }
        }
        return { error: error.message }
    }
}

export const getAllTickets = async () => {
    try {
        const response = await api.get(ALL_TICKETS_URL)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getAllOfficerTickets = async () => {
    try {
        const response = await api.get(ALL_OFFICERS_TICKETS_URL)
        if (response.data.success) {
            return response.data.results || response.data.data || []
        }
        return []
    } catch (error) {
        return { error: error.response?.data || error.message }
    }
}

export const getOfficerTickets = async () => {
    try {
        const response = await api.get(OFFICER_TICKETS_URL)
        return response.data
    } catch (error) {
        return { error: error.response?.data || error.message }
    }
}

export const issueTicket = async (ticketData) => {
    try {
        const response = await api.post(ISSUE_TICKET_URL, ticketData)
        return response.data
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message
        }
    }
}

export const searchTickets = async (searchParams = {}) => {
    try {
        // Build query string from params
        const params = new URLSearchParams()

        if (searchParams.q) params.append('q', searchParams.q)
        if (searchParams.status) params.append('status', searchParams.status)
        if (searchParams.date_from) params.append('date_from', searchParams.date_from)
        if (searchParams.date_to) params.append('date_to', searchParams.date_to)

        const response = await api.get(`${SEARCH_TICKETS_URL}?${params.toString()}`)
        return response.data
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message
        }
    }
}

export const lookupTicket = async (searchQuery) => {
    try {
        const response = await api.get(`${LOOKUP_TICKET_URL}?q=${encodeURIComponent(searchQuery)}`)
        return response.data
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message
        }
    }
}

// ======================
// Court Dates (Judiciary)
// ======================

export const scheduleCourtDate = async (courtDateData) => {
    try {
        const response = await api.post(JUDGE_SCHEDULE_URL, courtDateData)
        return { success: true, data: response.data }
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message
        }
    }
}

export const getScheduledCourtDates = async () => {
    try {
        const response = await api.get(JUDGE_SCHEDULE_URL)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

// ======================
// Analytics (Ministry/Admin)
// ======================

export const getAnalytics = async (days = 30) => {
    try {
        const response = await api.get(`${ANALYTICS_URL}?days=${days}`)
        return response.data
    } catch (error) {
        return { error: error.response?.data || error.message }
    }
}

// ======================
// Defendants
// ======================

export const getDefendantInfo = async () => {
    try {
        const response = await api.get(DEFENDANTS_URL)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

// ======================
// Ticket Management
// ======================

export const getTicketManagement = async () => {
    try {
        const response = await api.get(`${baseURL}ticket-management/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const resolveTicket = async (ticketId, resolutionNotes = '', status = 'closed') => {
    try {
        const response = await api.post(`${baseURL}tickets/resolve/`, {
            ticket_id: ticketId,
            resolution_notes: resolutionNotes,
            status: status
        })
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const updateTicketStatus = async (ticketId, status) => {
    try {
        const response = await api.post(`${baseURL}tickets/update-status/`, {
            ticket_id: ticketId,
            status: status
        })
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const updateTicketManagement = async (ticketId, resolutionNotes) => {
    try {
        const response = await api.post(`${baseURL}ticket-management/`, {
            ticket_id: ticketId,
            resolution_notes: resolutionNotes
        })
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

// ======================
// Audit Logs (Ministry/Admin)
// ======================

export const getAuditLogs = async (limit = 100, action = null) => {
    try {
        const params = new URLSearchParams()
        params.append('limit', limit)
        if (action) params.append('action', action)

        const response = await api.get(`${AUDIT_LOGS_URL}?${params.toString()}`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

// ======================
// User Management (Admin)
// ======================

export const getUsers = async () => {
    try {
        const response = await api.get(USERS_URL)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(`${USERS_URL}${userId}/update/`, userData)
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`${USERS_URL}${userId}/delete/`)
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

// ======================
// Violation Types (Static Data)
// ======================

export const getViolationTypes = async () => {
    return {
        success: true,
        data: [
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
    }
}

// ======================
// Namibian Regions (Static Data)
// ======================

export const getNamibianRegions = async () => {
    return {
        success: true,
        data: [
            { code: 'khomas', name: 'Khomas Region', cities: ['Windhoek', 'Khomasdal', 'Katutura'] },
            { code: 'erongo', name: 'Erongo Region', cities: ['Walvis Bay', 'Swakopmund', 'Oshakati', 'Henties Bay'] },
            { code: 'omasati', name: 'Omasati Region', cities: ['Outapi', 'Omulonga', 'Okahao'] },
            { code: 'oshana', name: 'Oshana Region', cities: ['Oshakati', 'Ondangwa', 'Oshikango'] },
            { code: 'oshikoto', name: 'Oshikoto Region', cities: ['Tsumeb', 'Omuthiya', 'Nakambale'] },
            { code: 'ohangwena', name: 'Ohangwena Region', cities: ['Ohangwena', 'Ondobe', 'Oshikango'] },
            { code: 'omusati', name: 'Omusati Region', cities: ['Outapi', 'Ruacaca', 'Okahao'] },
            { code: 'kunene', name: 'Kunene Region', cities: ['Khorixas', 'Opuwo', 'Sesfontein'] },
            { code: 'kavango_east', name: 'Kavango East Region', cities: ['Rundu', 'Nyangana', 'Mpungu'] },
            { code: 'kavango_west', name: 'Kavango West Region', cities: ['Nkurenkuru', 'Kandjara'] },
            { code: 'zambezi', name: 'Zambezi Region', cities: ['Katima Mulilo', 'Linyanti', 'Sangwali'] },
            { code: 'hardap', name: 'Hardap Region', cities: ['Mariental', 'Rehoboth', 'Maltahöhe'] },
            { code: 'karas', name: 'Karas Region', cities: ['Keetmanshoop', 'Karasburg', 'Lüderitz'] },
        ]
    }
}

// ======================
// Notifications
// ======================

export const sendTicketNotification = async (notificationData) => {
    // This is a stub function - backend endpoint not implemented yet
    // Will return a mock success response for now
    console.log('sendTicketNotification called with:', notificationData)
    return {
        success: true,
        message: 'Notification sent successfully (stub)'
    }
}

// ======================
// Driver Contact (Settings)
// ======================

export const getDriverContact = async () => {
    try {
        const response = await axios.get(
            `${baseURL}defendants/`,
            { withCredentials: true }
        )
        // Return a proper structure even if empty
        if (response.data) {
            return {
                success: true,
                contact: response.data || {
                    phone_number: '',
                    alt_phone: '',
                    email: '',
                    physical_address: '',
                    city: '',
                    postal_code: '',
                    email_enabled: true,
                    sms_enabled: true,
                    preferred_method: 'all'
                }
            }
        }
        return {
            success: true,
            contact: {
                phone_number: '',
                alt_phone: '',
                email: '',
                physical_address: '',
                city: '',
                postal_code: '',
                email_enabled: true,
                sms_enabled: true,
                preferred_method: 'all'
            }
        }
    } catch (error) {
        console.error('getDriverContact error:', error)
        // Return default values on error so SettingsPage doesn't crash
        return {
            success: true,
            contact: {
                phone_number: '',
                alt_phone: '',
                email: '',
                physical_address: '',
                city: '',
                postal_code: '',
                email_enabled: true,
                sms_enabled: true,
                preferred_method: 'all'
            }
        }
    }
}

export const updateDriverContact = async (contactData) => {
    try {
        const response = await axios.post(
            `${baseURL}defendants/`,
            contactData,
            { withCredentials: true }
        )
        return response.data || { success: true }
    } catch (error) {
        console.error('updateDriverContact error:', error)
        return { success: false, error: error.message }
    }
}

// ======================
// Judge Dashboard APIs
// ======================

export const getJudgeCases = async (status = 'all') => {
    try {
        const response = await api.get(`${JUDGE_CASES_URL}?status=${status}`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getJudgeCaseDetail = async (caseId) => {
    try {
        const response = await api.get(`${JUDGE_CASES_URL}${caseId}/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getJudgeCalendar = async (fromDate = null, toDate = null) => {
    try {
        let url = JUDGE_CALENDAR_URL
        const params = new URLSearchParams()
        if (fromDate) params.append('from_date', fromDate)
        if (toDate) params.append('to_date', toDate)
        if (params.toString()) url += `?${params.toString()}`

        const response = await api.get(url)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getJudgeStatistics = async () => {
    try {
        const response = await api.get(JUDGE_STATS_URL)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const scheduleJudgeCourtDate = async (courtDateData) => {
    try {
        const response = await api.post(JUDGE_CALENDAR_URL, courtDateData)
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getJudgeNotifications = async () => {
    try {
        const response = await api.get(JUDGE_NOTIFICATIONS_URL)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const markJudgeNotificationRead = async (notificationId) => {
    try {
        const response = await api.post(`${JUDGE_MARK_READ_URL}${notificationId}/read/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const updateCaseJudgment = async (caseId, judgment, ruling, newStatus = 'closed') => {
    try {
        const response = await api.post(`${JUDGE_CASES_URL}judgment/`, {
            case_id: caseId,
            judgment: judgment,
            ruling: ruling,
            status: newStatus
        })
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

// ======================
// NaTIS Admin Dashboard APIs
// ======================

export const lookupVehicle = async (plateNo) => {
    try {
        const response = await api.get(`${baseURL}natis/vehicle-lookup/?plate_no=${encodeURIComponent(plateNo)}`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const verifyDriverLicense = async (licenseNo = '', idNo = '') => {
    try {
        let url = `${baseURL}natis/license-verify/`
        const params = new URLSearchParams()
        if (licenseNo) params.append('license_no', licenseNo)
        if (idNo) params.append('id_no', idNo)
        if (params.toString()) url += `?${params.toString()}`

        const response = await api.get(url)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const processPayment = async (paymentData) => {
    try {
        const response = await api.post(`${baseURL}natis/payment/`, paymentData)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const generateReport = async (reportType = 'traffic_summary', dateFrom = null, dateTo = null) => {
    try {
        let url = `${baseURL}natis/reports/?type=${reportType}`
        if (dateFrom) url += `&date_from=${dateFrom}`
        if (dateTo) url += `&date_to=${dateTo}`

        const response = await api.get(url)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

// ======================
// NaTIS Registration APIs (Vehicle & Driver Registration)
// ======================

export const registerDriver = async (driverData) => {
    try {
        const response = await api.post(`${baseURL}natis/drivers/register/`, driverData)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getDrivers = async (query = '') => {
    try {
        const url = query ? `${baseURL}natis/drivers/?q=${encodeURIComponent(query)}` : `${baseURL}natis/drivers/`
        const response = await api.get(url)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getDriverById = async (driverId) => {
    try {
        const response = await api.get(`${baseURL}natis/drivers/${driverId}/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const updateDriver = async (driverId, driverData) => {
    try {
        const response = await api.put(`${baseURL}natis/drivers/${driverId}/update/`, driverData)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const registerVehicle = async (vehicleData) => {
    try {
        const response = await api.post(`${baseURL}natis/vehicles/register/`, vehicleData)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getVehicles = async (query = '', status = '') => {
    try {
        let url = `${baseURL}natis/vehicles/`
        const params = new URLSearchParams()
        if (query) params.append('q', query)
        if (status) params.append('status', status)
        if (params.toString()) url += `?${params.toString()}`

        const response = await api.get(url)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getVehicleById = async (vehicleId) => {
    try {
        const response = await api.get(`${baseURL}natis/vehicles/${vehicleId}/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const updateVehicle = async (vehicleId, vehicleData) => {
    try {
        const response = await api.put(`${baseURL}natis/vehicles/${vehicleId}/update/`, vehicleData)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

// ======================
// Officer Dashboard APIs
// ======================

export const getOfficerDashboardSummary = async () => {
    try {
        const response = await api.get(`${baseURL}officer/dashboard/summary/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getTrafficIncidents = async () => {
    try {
        const response = await api.get(`${baseURL}officer/incidents/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const createTrafficIncident = async (incidentData) => {
    try {
        const response = await api.post(`${baseURL}officer/incidents/create/`, incidentData)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const resolveTrafficIncident = async (incidentId) => {
    try {
        const response = await api.post(`${baseURL}officer/incidents/resolve/`, { incident_id: incidentId })
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getMissingPersons = async () => {
    try {
        const response = await api.get(`${baseURL}officer/missing-persons/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getWarrantsOfArrest = async () => {
    try {
        const response = await api.get(`${baseURL}officer/warrants/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

export const getNews = async () => {
    try {
        const response = await api.get(`${baseURL}officer/news/`)
        return response.data
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
}

