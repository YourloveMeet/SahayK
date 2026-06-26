'use client'

import React from 'react'
import { UserCircle, Settings, ShieldCheck, Award, ChevronRight } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { LogoutButton } from '@/components/LogoutButton'
import { LeaderboardWidget } from '@/components/volunteer/LeaderboardWidget'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

export default function VolunteerProfilePage() {
  const isMobile = useIsMobile()
  const supabase = createClient()

  // Fetch Leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, help_score, tasks_completed, avatar_url, phone')
        .order('help_score', { ascending: false, nullsFirst: false })
        .limit(5)
      if (error) throw error
      return data
    }
  })

  const DesktopProfile = () => (
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
        <div onClick={() => alert('Verification feature is coming soon!')} className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden p-6 hover:scale-[1.02] transition-transform cursor-pointer group">
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
        <div onClick={() => alert('Reputation feature is coming soon!')} className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden p-6 hover:scale-[1.02] transition-transform cursor-pointer group">
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
        <div onClick={() => alert('Settings feature is coming soon!')} className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden p-6 hover:scale-[1.02] transition-transform cursor-pointer group">
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

  const MobileProfile = () => (
    <div className="p-4 space-y-6 bg-slate-50 dark:bg-[#0A0A0A] min-h-screen text-zinc-900 dark:text-zinc-50">
      <div className="flex flex-col gap-1 pt-2 px-2">
        <h1 className="text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent pb-1">
          Profile
        </h1>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Your volunteer account details</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-md">
           <UserCircle className="w-10 h-10 text-gray-400" />
        </div>
        <div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">Volunteer</p>
          <span className="inline-block mt-2 px-3 py-1 bg-[#b39552]/10 text-[#b39552] text-xs font-black uppercase tracking-widest rounded-md">Newbie Level</span>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={() => alert('Verification feature is coming soon!')} className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] active:scale-95 transition-transform text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Verification</h3>
              <p className="text-sm font-bold text-gray-500">Status: Pending</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={() => alert('Reputation feature is coming soon!')} className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] active:scale-95 transition-transform text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#b39552]/10 text-[#b39552] rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Reputation</h3>
              <p className="text-sm font-bold text-gray-500">Badges & Score</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={() => alert('Settings feature is coming soon!')} className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] active:scale-95 transition-transform text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Settings</h3>
              <p className="text-sm font-bold text-gray-500">Preferences & Radius</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="pt-2">
        <LeaderboardWidget leaders={leaderboard as any || []} />
      </div>

      <div className="pt-4 flex justify-center pb-8">
        <LogoutButton />
      </div>
    </div>
  )

  return isMobile ? <MobileProfile /> : <DesktopProfile />
}
