


import { React, useState, useEffect } from 'react'
import {
  LucideMessageSquareWarning,
  TicketCheck,
  TicketIcon,
  User,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { getAnalytics, get_officers } from '../../Axios'

export default function StatsGrid() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    issued_tickets: 0,
    paid_tickets: 0,
    contested_tickets: 0,
    active_officers: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [analyticsData, officersData] = await Promise.all([
          getAnalytics(30),
          get_officers()
        ])

        const analytics = analyticsData?.data || analyticsData || {}

        // Extract status breakdown
        const statusData = analytics.status_breakdown || []
        const paidCount = statusData.find(s => s.status === 'paid')?.count || 0
        const pendingCount = statusData.find(s => s.status === 'pending')?.count || 0
        const disputedCount = statusData.find(s => s.status === 'disputed')?.count || 0
        const courtCount = statusData.find(s => s.status === 'court')?.count || 0

        // Get officers count
        const officersCount = Array.isArray(officersData) ? officersData.length :
          officersData?.data?.length || 0

        setStats({
          issued_tickets: analytics.total_tickets || 0,
          paid_tickets: paidCount,
          contested_tickets: disputedCount + courtCount, // Disputed and court cases
          active_officers: officersCount
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const mainStatsItem = [
    {
      id: 'issued_tickets',
      icon: TicketCheck,
      name: 'Issued Tickets',
      value: stats.issued_tickets,
      color: '#ef4444',
    },
    {
      id: 'paid_tickets',
      icon: CheckCircle,
      name: 'Paid Tickets',
      value: stats.paid_tickets,
      color: '#06b6d4',
    },
    {
      id: 'contested_tickets',
      icon: AlertTriangle,
      name: 'Contested Tickets',
      value: stats.contested_tickets,
      color: '#b820d3',
    },
    {
      id: 'active_officers',
      icon: User,
      name: 'Active Officers',
      value: stats.active_officers,
      color: '#f59e0b',
    },
  ]

  if (loading) {
    return (
      <div className='bg-slate-300 dark:bg-slate-800 rounded-sm p-2'>
        <div className='p-2'>
          <h2 className='text-xl text-slate-800 dark:text-slate-300 font-bold'>System Overview</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 px-4 mt-2 sm:grid-cols-4 sm:px-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-400 dark:bg-slate-600 rounded-sm animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='bg-slate-300 dark:bg-slate-800 rounded-sm p-2'>
      <div className='p-2'>
        <h2 className='text-xl text-slate-800 dark:text-slate-300 font-bold'>System Overview</h2>
      </div>
      <div>
        <div className="grid grid-cols-1 gap-4 px-4 mt-2 sm:grid-cols-4 sm:px-2">
          {mainStatsItem.map((stats) => {
            return (
              <div key={stats.id} className="flex items-center bg-slate-400 dark:bg-slate-600 rounded-sm overflow-hidden shadow">
                <div className={`m-2 p-4 text-slate-800 dark:text-slate-200 ` } style={{background: stats.color}}>
                  <stats.icon className='w-fit h-fit' />
                </div>
                <div className="px-2 text-slate-800 dark:text-slate-100">
                  <h3 className="text-xs tracking-wider">{stats.name}</h3>
                  <p className="text-xl">{stats.value.toLocaleString()}</p>
                </div>
              </div>
            )
          })}
      </div>
      </div>
    </div>

  )
}

