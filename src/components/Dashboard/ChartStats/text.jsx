import React, { useEffect, useState } from 'react'

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
