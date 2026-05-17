import React from 'react'

/**
 * Reusable Stats Card Component with modern gradient design
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {React.ComponentType} icon - Lucide icon component
 * @param {string} gradientFrom - Gradient start color (e.g., 'from-red-500')
 * @param {string} gradientTo - Gradient end color (e.g., 'to-red-600')
 * @param {string} subtitle - Optional subtitle text
 * @param {string} change - Optional change indicator (e.g., '+12%')
 * @param {boolean} trend - Optional trend direction ('up' | 'down' | 'neutral')
 */
export default function StatsCard({
  title,
  value,
  icon: Icon,
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-blue-600',
  subtitle,
  change,
  trend = 'neutral'
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br p-4 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-default"
      style={{
        background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))`,
      }}
    >
      {/* Gradient colors as CSS variables */}
      <style>{`
        .from-blue-500 { --gradient-from: #3b82f6; }
        .to-blue-600 { --gradient-to: #2563eb; }
        .from-red-500 { --gradient-from: #ef4444; }
        .to-red-600 { --gradient-to: #dc2626; }
        .from-green-500 { --gradient-from: #22c55e; }
        .to-green-600 { --gradient-from: #16a34a; }
        .from-purple-500 { --gradient-from: #a855f7; }
        .to-purple-600 { --gradient-to: #9333ea; }
        .from-amber-500 { --gradient-from: #f59e0b; }
        .to-amber-600 { --gradient-to: #d97706; }
        .from-cyan-500 { --gradient-from: #06b6d4; }
        .to-cyan-600 { --gradient-to: #0891b2; }
        .from-pink-500 { --gradient-from: #ec4899; }
        .to-pink-600 { --gradient-to: #db2777; }
        .from-indigo-500 { --gradient-from: #6366f1; }
        .to-indigo-600 { --gradient-to: #4f46e5; }
        .from-emerald-500 { --gradient-from: #10b981; }
        .to-emerald-600 { --gradient-to: #059669; }
        .from-violet-500 { --gradient-from: #8b5cf6; }
        .to-violet-600 { --gradient-to: #7c3aed; }
      `}</style>

      <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Icon className="w-4 h-4" />
            </div>
            {change && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                trend === 'up' ? 'bg-green-500/30 text-green-100' :
                trend === 'down' ? 'bg-red-500/30 text-red-100' :
                'bg-white/20 text-white'
              }`}>
                {change}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold truncate">{value}</p>
          <p className="text-white/80 text-xs font-medium truncate">
            {title}
            {subtitle && ` • ${subtitle}`}
          </p>
        </div>
      </div>
    </div>
  )
}

// Alternative bordered card style for less emphasis
export function StatsCardBordered({
  title,
  value,
  icon: Icon,
  color = 'text-blue-500',
  bgColor = 'bg-blue-50 dark:bg-blue-900/20',
  change,
  trend = 'neutral'
}) {
  const darkMode = typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true'

  return (
    <div className={`rounded-xl border p-5 backdrop-blur-sm ${
      darkMode
        ? 'bg-slate-800/50 border-slate-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-sm ${
                trend === 'up' ? 'text-green-500' :
                trend === 'down' ? 'text-red-500' :
                'text-gray-500'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )
}

