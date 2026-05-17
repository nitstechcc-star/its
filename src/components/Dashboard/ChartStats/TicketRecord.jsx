import React, { useEffect, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'


const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api'

function TicketRecord() {


const [data, setData] = useState([])

  useEffect(() => {
    let es

    // initial snapshot
    fetch(`${BACKEND_BASE}/api/violations/`)
      .then((res) => res.json())
      .then((json) => {
        if (json && json.data) setData(json.data)
      })
      .catch(() => {})

    // subscribe to SSE for live updates
    try {
      es = new EventSource(`${BACKEND_BASE}/sse/violations/`)
      es.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data)
          if (parsed && parsed.data) setData(parsed.data)
        } catch {
          // ignore parse errors
        }
      }
    } catch {
      // EventSource not supported or connection failed
    }

    return () => {
      if (es) es.close()
    }
  }, [])

  const total = data.reduce((s, d) => s + (d.value || 0), 0)


  return (
    <div className="bg-slate-300 dark:bg-slate-800 backdrop-blur-2xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Road Violation Records</h3>
      </div>

      <div className="flex flex-col md:flex-col gap-2 items-center">
        <div className="w-full md:w-full h-43">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={36}
                outerRadius={70}
                paddingAngle={4}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full md:w-full h-auto">
          <ul>
            {data.map((item) => (
              <li key={item.name} className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ background: item.color }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {item.value} ({total ? ((item.value / total) * 100).toFixed(0) : 0}%)
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">Total violations: {total}</div>
        </div>
      </div>
    </div>
  )
}

export default TicketRecord
