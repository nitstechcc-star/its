import {useEffect, useState} from 'react'
import axios from 'axios'
import { ArrowUpRight } from 'lucide-react'



function Table() {
  const endpoint = 'http://localhost:8000/api/officers/'
  const [officerData, setOfficerData] = useState([])
  const fetchData = async() => {
    console.log(fetchData)
    const response = await axios.get(endpoint)
    const {data} = response
    setOfficerData(data)
    return data
  }

    useEffect(() => {
      fetchData()
    }, []);

  return (
    <div className='space-y-6'>
        <div className='bg-slate-300 dark:bg-slate-800 backdrop-blur-2xl border
         border-slate-200/50 dark:border-slate-700/50 overflow-hidden rounded-2xl p-4'>
            <div className='p-2 pb-6 border-b border-slate-200/50 dark:border-slate-200/50'>
            <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-bold text-slate-700 dark:text-slate-300'>
                    Officer Activity Report
                  </h3>
                </div>
                <div className=''>
                  <button className='transition-colors duration-300 p-2 bg-slate-500 dark:bg-cyan-600 hover:bg-cyan-500
                  text-xs text-slate-300 hover:text-slate-300 font-medium rounded-full'>
                    < ArrowUpRight className='w-3 h-3' />
                  </button>
                </div>

            </div>
            </div>
            {/*Table*/}
            <div className="shadow-lg rounded-lg overflow-hidden ">
    <table className="w-full table-fixed">
        <thead>
            <tr className="border-b border-slate-700/50 dark:border-slate-200/50">
                <th className="w-1/4 py-3 px-6 text-left text-slate-600  dark:text-slate-200 font-semibold uppercase text-sm">Name</th>
                <th className="w-1/4 py-3 px-6 text-left text-slate-600  dark:text-slate-200 font-semibold uppercase text-sm">Badge</th>
                <th className="w-1/4 py-3 px-6 text-left text-slate-600  dark:text-slate-200 font-semibold uppercase text-sm">Status</th>
                <th className="w-1/4 py-3 px-6 text-left text-slate-600  dark:text-slate-200 font-semibold uppercase text-sm">Date</th>
            </tr>
        </thead>
        <tbody className="text-slate-200">
              {officerData.map((value) => {
                return (
                  <tr className='' key={value.id}>
                    <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-200  border-b border-slate-600  dark:border-gray-200">
                      <span className='flex items-center'>
                        <img src='https://i.pravatar.cc/300' alt='User Avatar' className='w-4 h-4 rounded-full ring-2
                    ring-blue-500 mr-2'/>
                        {value.name}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-xs text-slate-700 dark:text-slate-200  border-b border-slate-600  dark:border-gray-200 truncate">{value.badge}</td>
                    <td className="py-3 px-6 text-xs text-slate-700 dark:text-slate-200  border-b border-slate-600  dark:border-gray-200">
                        <span className={`py-1 px-2 rounded-full text-white ${value.active === true ? 'bg-green-500' : 'bg-slate-500/80'}`}>
                          {value.active ? 'active' : 'inactive'}
                        </span>
                    </td>
                    <td className="py-3 px-6 text-xs text-slate-700 dark:text-slate-200  border-b border-slate-600  dark:border-gray-200">{value.date}</td>
                  </tr>
                )
              })}

        </tbody>
    </table>
</div>
         </div>
    </div>
  )
}

export default  Table
