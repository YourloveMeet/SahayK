'use client'

import React from 'react'
import { UserCircle, Settings, ShieldCheck, Award } from 'lucide-react'

export default function VolunteerProfilePage() {
  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 relative">
      {/* Background Orbs */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-gray-300/10 dark:bg-gray-700/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 md:p-8 rounded-[1rem] shadow-xl border border-gray-200 dark:border-zinc-800 relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner border-4 border-white dark:border-zinc-900 shrink-0">
           <UserCircle className="w-12 h-12 text-gray-400" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Volunteer Profile
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">Manage your personal details, verification, and settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Verification Status */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden p-6 hover:scale-[1.02] transition-transform cursor-pointer group">
          <div className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center mb-4 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Verification</h3>
          <p className="text-gray-500 font-medium text-sm flex-1">Complete your identity verification to unlock higher priority tasks and build trust.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
            <span>Status: Pending</span>
            <span className="text-blue-500 group-hover:underline">Verify Now &rarr;</span>
          </div>
        </div>

        {/* Reputation & Badges */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden p-6 hover:scale-[1.02] transition-transform cursor-pointer group">
          <div className="w-12 h-12 bg-[#b39552]/10 text-[#b39552] rounded-xl flex items-center justify-center mb-4 shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Reputation</h3>
          <p className="text-gray-500 font-medium text-sm flex-1">View your earned badges, reviews, and detailed help score breakdown.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
            <span>Level: Newbie</span>
            <span className="text-[#b39552] group-hover:underline">View Badges &rarr;</span>
          </div>
        </div>

        {/* Settings */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden p-6 hover:scale-[1.02] transition-transform cursor-pointer group">
          <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl flex items-center justify-center mb-4 shadow-md border border-gray-200 dark:border-zinc-700">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Settings</h3>
          <p className="text-gray-500 font-medium text-sm flex-1">Update your notification preferences, radius limits, and account details.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
            <span>Preferences</span>
            <span className="text-gray-500 dark:text-gray-400 group-hover:underline">Manage &rarr;</span>
          </div>
        </div>

      </div>
    </div>
  )
}
