import React from 'react'
import {createPortal} from 'react-dom';
import { X } from 'lucide-react';

function SettingsButton({open, onCloseSettings}) {
  return createPortal(
    <div className={`fixed top-20 right-6 dark:bg-slate-800 w-70 h-80 z-1
    backdrop-blur-2xl rounded-2xl shadow-lg shadow-blue-500
    ${open ? 'visible dark:bg-slate-800' : 'invisible'} `}>
        <div className={`p-4 transition-colors flex-1 flex-col
            ${open ? 'scale-100 opacity-100': 'scale-0 opacity-0'}`}>
            <div className='flex items-center justify-between'>
                <h3 className='text-blue-500 text-sm font-semibold z-2'>Settings</h3>
                <button className='text-slate-300 bg-blue-500 p-1 rounded-full cursor-pointer'
                onClick={onCloseSettings}>
                    <X className='w-3 h-3'/>
                </button>
            </div>
        </div>
    </div>,
    document.getElementById('root')
  )
}

export default SettingsButton
