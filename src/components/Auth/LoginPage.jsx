import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, Loader2, Ticket, Shield, BarChart3, CheckCircle, Users, MapPin, Bell } from 'lucide-react'
import { login } from '../../Axios'
import { useAuth } from '../../context/useAuth'
import LoadingScreen from './LoadingScreen'

// Carousel slides data
const carouselSlides = [
  {
    id: 1,
    icon: Ticket,
    title: "Digital Ticket Issuance",
    description: "Issue traffic violations instantly with our digital ticketing system. Generate unique ticket numbers and manage all records digitally.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    icon: Shield,
    title: "Secure Officer Management",
    description: "Manage traffic officers, track their activities, and assign tickets with role-based access control for maximum security.",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Gain insights with comprehensive analytics. Track violations, revenue, and trends with beautiful visualizations.",
    color: "from-orange-500 to-red-500"
  },
  {
    id: 4,
    icon: MapPin,
    title: "GPS Location Tracking",
    description: "Automatically capture GPS coordinates when issuing tickets. Know exactly where each violation occurred.",
    color: "from-green-500 to-teal-500"
  },
  {
    id: 5,
    icon: Bell,
    title: "Instant Notifications",
    description: "Send automated notifications to violators via SMS and email. Keep everyone informed about their violations.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: 6,
    icon: CheckCircle,
    title: "Ticket Resolution",
    description: "Streamlined ticket resolution process. Track payment status, handle disputes, and manage court dates efficiently.",
    color: "from-emerald-500 to-green-500"
  }
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login: setAuth } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(username, password)

      if (result.success) {
        setAuth({
          username: username,
          role: result.data?.role || 'admin',
          is_superuser: result.data?.is_superuser || false
        })
        setIsLoggingIn(true)
        // Reduced timeout for better UX
        setTimeout(() => {
          navigate('/')
        }, 1500)
      } else {
        // The Axios login returns { success: false, error: "error message" }
        // so result.error is the string directly, not a nested object
        setError(result.error || 'Invalid credentials')
        setLoading(false)
      }
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (isLoggingIn) {
    return <LoadingScreen />
  }

  // Animation variants
  const slideVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-15, 15, -15],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Side - Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-linear-to-br from-slate-900 via-blue-900 to-slate-900"
        >
          {/* Floating orbs */}
          <motion.div
            variants={floatVariants}
            initial="initial"
            animate="animate"
            className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            variants={floatVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 1 }}
            className="absolute bottom-20 right-20 w-96 h-96 purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            variants={floatVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
          />
        </motion.div>

        {/* Grid pattern overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ delay: 0.5 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Carousel Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 py-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-8 left-8 flex items-center gap-3"
          >
            <img
              src="/logo.svg"
              alt="ITS Logo"
              className="w-12 h-12"
            />
          </motion.div>

          {/* Carousel */}
          <div className="max-w-md w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`w-24 h-24 mx-auto mb-8 bg-linear-to-r ${carouselSlides[currentSlide].color} rounded-3xl flex items-center justify-center shadow-2xl`}
                >
                  {(() => {
                    const Icon = carouselSlides[currentSlide].icon
                    return <Icon className="w-12 h-12 text-white" />
                  })()}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-white mb-4"
                >
                  {carouselSlides[currentSlide].title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-blue-200/80 leading-relaxed"
                >
                  {carouselSlides[currentSlide].description}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* Dots indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-2 mt-10"
            >
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className="relative"
                >
                  <motion.div
                    animate={{ scale: currentSlide === index ? 1.2 : 1 }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentSlide === index
                        ? 'bg-blue-400'
                        : 'bg-white/20 hover:bg-white/40'
                    }`}
                  />
                  {currentSlide === index && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute inset-0 bg-blue-400 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-blue-400/50 text-sm"
          >
            Namibia Intelligent Traffic System © {new Date().getFullYear()}
          </motion.p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:hidden flex items-center justify-center gap-3 mb-8"
          >
            <img
              src="/logo.svg"
              alt="ITS Logo"
              className="w-14 h-14"
            />
            <span className="text-3xl font-bold text-white">ITS</span>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center justify-center">
              Welcome Back
            </h1>
            <p className="text-blue-300/70 flex items-center justify-center">
              Sign in to access the traffic management system
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Username
              </label>
              <motion.input
                whileFocus={{ scale: 1.01, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Password
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.01, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all pr-14"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  <span>Sign In</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Security note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center text-blue-400/40 text-sm"
          >
            🔒 Secured with enterprise-grade encryption
          </motion.p>

          {/* Mobile footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:hidden text-center text-blue-400/30 text-xs mt-8"
          >
            Namibia Traffic Management System © {new Date().getFullYear()}
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

