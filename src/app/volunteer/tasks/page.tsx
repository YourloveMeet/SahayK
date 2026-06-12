'use client'

import React from 'react'
import { ListTodo, CheckCircle } from 'lucide-react'

export default function VolunteerTasksPage() {
  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 relative">
      {/* Background Orbs */}
      <div className="fixed top-20 left-0 w-[500px] h-[500px] bg-gray-300/10 dark:bg-gray-700/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 md:p-8 rounded-[1rem] shadow-xl border border-gray-200 dark:border-zinc-800 relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <ListTodo className="w-8 h-8 text-gray-900 dark:text-white" />
          My Tasks
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">Manage your active assignments and view your volunteering history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 min-h-[500px]">
        {/* Active Tasks Placeholder */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
             <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
               Active Assignments
             </h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner">
               <ListTodo className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium max-w-sm">
              You don't have any active assignments right now. Head over to the Dashboard to find requests near you.
            </p>
          </div>
        </div>

        {/* Completed History Placeholder */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
             <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
               History
             </h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner">
               <CheckCircle className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium max-w-sm">
              Your completed tasks will appear here. Build your reputation and earn badges by completing requests!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
