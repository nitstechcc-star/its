import React from 'react'
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from  'recharts'

const data = [
  {month: 'Jan', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'Feb', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'Mar', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'Apr', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'May', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'Jun', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'Jul', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'Aug', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'Sep', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'Oct', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'Nov', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
  {month: 'Dec', issued: Math.floor(Math.random() * 100), contested: Math.floor(Math.random() * 20), paid: Math.floor(Math.random() * 70)},
]

function TableData() {


  return (
    <div className="bg-slate-300 dark:bg-slate-800 backdrop-blur-3xl rounded-b-xl
     border border-slate-200/50 dark:border-slate-700/50 mb-6 p-6">
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-bold text-slate-800 dark:text-slate-300'>Traffic Report</h3>
            <p className='text-xs text-shadow-slate-500 text-slate-800 dark:text-slate-300'>Monthly Violations</p>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <div className='text-xs text-slate-600 dark:text-slate-300'>
                <span>Ticket Issued</span>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
              <div className='text-xs text-slate-600 dark:text-slate-300'>
                <span>Ticket Paid</span>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
              <div className='text-xs text-slate-600 dark:text-slate-300'>
                <span>Ticket Contested</span>
              </div>
            </div>
          </div>
        </div>
        <div className='h-auto mt-6'>
          {" "}
          <ComposedChart
            style={{ width: '100%', maxWidth: '700px', maxHeight: '60vh', aspectRatio: 1.618,}}
            responsive
            data={data}
            margin={{
              top: 20,
              right: 0,
              bottom: 5,
              left: 0,
            }}
          >

            <XAxis dataKey="month" label={{ value:"", position: 'outsideBottom', offset: -90, color: 'white'}} scale="band" />
            <YAxis label={{ value: 'Tickets Issued', angle: -90, position: 'insideLeft'}} width="auto" />
            <Tooltip />
            <Legend />
            <Bar dataKey="issued" barSize={30} fill="#ef4444" />
            <Bar dataKey="contested" barSize={30} fill="#b830d3" />
            <Bar dataKey="paid" barSize={30} fill="#06b6d4" />
          </ComposedChart>
        </div>
    </div>
  )
}

export default TableData
