import React from 'react'
import TableData from './TableData'
import TicketRecord from './TicketRecord'

export default function ChartStats() {
  return (
    <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        <div className='xl:col-span-2'>
            < TableData />
        </div>
        <div className='space-y-6'>
          < TicketRecord />
        </div>
    </div>
  )
}

