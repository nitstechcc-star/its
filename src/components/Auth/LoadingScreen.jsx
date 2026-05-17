import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const loadingStages = [
  { key: 'auth', label: 'Authenticating', duration: 3000 },
  { key: 'data', label: 'Loading Data', duration: 4000 },
  { key: 'ui', label: 'Preparing Interface', duration: 3000 },
  { key: 'ready', label: 'Ready', duration: 2000 },
]

export default function LoadingScreen() {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let totalDuration = 0

    const runStages = async () => {
      for (let i = 0; i < loadingStages.length; i++) {
        setCurrentStage(i)

        // Animate progress for this stage
        const stageStart = totalDuration
        const stageEnd = totalDuration + loadingStages[i].duration
        const startProgress = (i / loadingStages.length) * 100
        const endProgress = ((i + 1) / loadingStages.length) * 100

        // Update progress every 100ms
        const interval = setInterval(() => {
          const now = Date.now()
          if (now >= stageEnd) {
            setProgress(endProgress)
            clearInterval(interval)
          } else {
            const elapsed = now - stageStart
            const stageProgress = (elapsed / loadingStages[i].duration)
            setProgress(startProgress + (stageProgress * (endProgress - startProgress)))
          }
        }, 100)

        totalDuration += loadingStages[i].duration
        await new Promise(resolve => setTimeout(resolve, loadingStages[i].duration))
      }
      setIsComplete(true)
    }

    runStages()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden relative">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Floating orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 purple-500/20 rounded-full blur-3xl"
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative">
          {/* Outer glow ring */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeOut'
            }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl"
          />

          {/* Middle ring */}
          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut'
            }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-lg"
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-24 h-24"
          >
            <img
              src="/logo.svg"
              alt="ITS Logo"
              className="w-full h-full"
            />

            {/* Scanning line - slower for 12 seconds */}
            <motion.div
              animate={{ y: [0, 90, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
            />
          </motion.div>
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ITS
          </h1>
          <p className="text-blue-300/60 text-sm mt-2 font-medium tracking-widest uppercase">
            {loadingStages[currentStage].label}
          </p>
        </motion.div>

        {/* Tech-style Progress */}
        <div className="mt-8 w-64">
          {/* Progress track */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
            {/* Grid lines on progress bar */}
            <div className="absolute inset-0 flex">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex-1 border-r border-slate-700/50 last:border-r-0" />
              ))}
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
            >
              {/* Glowing tip */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </motion.div>
          </div>

          {/* Percentage and stage info */}
          <div className="flex justify-between mt-3">
            <span className="text-xs text-blue-400/60 font-mono">
              {Math.round(progress)}%
            </span>
            <span className="text-xs text-blue-400/60 font-mono">
              {currentStage + 1}/{loadingStages.length}
            </span>
          </div>
        </div>

        {/* Status indicators with stages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex gap-6"
        >
          {loadingStages.map((stage, index) => (
            <div key={stage.key} className="flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  scale: index <= currentStage ? [1, 1.3, 1] : 1,
                  backgroundColor: index < currentStage
                    ? 'rgba(34, 197, 94, 1)'
                    : index === currentStage
                      ? 'rgba(59, 130, 246, 1)'
                      : 'rgba(100, 116, 139, 0.3)'
                }}
                transition={{
                  duration: index <= currentStage ? 0.5 : 0,
                  repeat: index === currentStage ? Infinity : 0,
                  repeatDelay: 1
                }}
                className={`w-3 h-3 rounded-full ${
                  index < currentStage
                    ? 'bg-green-500'
                    : index === currentStage
                      ? 'bg-blue-400'
                      : 'bg-slate-600/30'
                }`}
              />
              <span className={`text-xs font-mono uppercase ${
                index <= currentStage ? 'text-blue-300/60' : 'text-blue-300/20'
              }`}>
                {stage.key}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Current stage description */}
        <motion.p
          key={currentStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-sm text-blue-300/40 font-mono"
        >
          {currentStage === 0 && 'Verifying credentials and session...'}
          {currentStage === 1 && 'Fetching user data and permissions...'}
          {currentStage === 2 && 'Building dashboard components...'}
          {currentStage === 3 && 'All systems initialized successfully!'}
        </motion.p>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-blue-500/30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-blue-500/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-blue-500/30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-blue-500/30 rounded-br-lg" />

      {/* Version info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-blue-400/30 font-mono"
      >
        v1.0.0 • Secure Connection • {isComplete ? 'Complete!' : 'Loading...'}
      </motion.p>
    </div>
  )
}

