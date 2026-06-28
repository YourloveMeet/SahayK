'use client'

import React, { useState } from 'react'
import { UserCircle, Settings, ShieldCheck, Award, ChevronRight, X, Camera, Upload } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { LogoutButton } from '@/components/LogoutButton'
import { LeaderboardWidget } from '@/components/volunteer/LeaderboardWidget'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function VolunteerProfilePage() {
  const isMobile = useIsMobile()
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const [activeModal, setActiveModal] = useState<'verification' | 'reputation' | 'settings' | null>(null)
  
  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ phone: '', area_name: '', language: '' })

  const { data: userProfile } = useQuery({
    queryKey: ['volunteerProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setSettingsForm({
          phone: data.phone || '',
          area_name: data.area_name || '',
          language: data.language || 'English'
        })
      }
      return data
    }
  })

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

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!userProfile) return
      const { error } = await supabase.from('profiles').update(updates).eq('id', userProfile.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteerProfile'] })
      setActiveModal(null)
    }
  })

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(settingsForm)
  }

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({ verification_status: 'pending' })
  }

  const getTier = (score: number) => {
    if (score >= 100) return { name: 'Gold Tier', color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200' }
    if (score >= 50) return { name: 'Silver Tier', color: 'text-slate-400', bg: 'bg-slate-100', border: 'border-slate-200' }
    if (score >= 10) return { name: 'Bronze Tier', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' }
    return { name: 'Newbie', color: 'text-zinc-500', bg: 'bg-zinc-100', border: 'border-zinc-200' }
  }
  
  const tier = userProfile ? getTier(userProfile.help_score || 0) : getTier(0)

  const VerificationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative zoom-in-95 animate-in duration-200">
        <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-black dark:text-white mb-2">Identity Verification</h2>
        
        {userProfile?.verification_status === 'verified' ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-2xl mt-6 text-center">
            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">You are verified!</h3>
            <p className="text-emerald-600/80 text-sm mt-2">Your identity has been confirmed. You now have access to high-priority requests.</p>
          </div>
        ) : userProfile?.verification_status === 'pending' ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-2xl mt-6 text-center">
            <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400">Verification Pending</h3>
            <p className="text-amber-600/80 text-sm mt-2">We are reviewing your uploaded documents. This usually takes 24-48 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleVerificationSubmit} className="mt-6 space-y-6">
            <p className="text-zinc-500 text-sm">Upload a valid Government ID (Aadhaar, PAN, or Passport) to verify your identity.</p>
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Upload className="w-10 h-10 text-zinc-400 mb-3" />
              <p className="font-bold text-sm text-zinc-600 dark:text-zinc-300">Click to upload document</p>
              <p className="text-xs text-zinc-400 mt-1">PDF, JPG, or PNG (Max 5MB)</p>
            </div>
            <button type="submit" disabled={updateProfileMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              {updateProfileMutation.isPending ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </form>
        )}
      </div>
    </div>
  )

  const ReputationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative zoom-in-95 animate-in duration-200">
        <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className={`w-16 h-16 ${tier.bg} ${tier.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-black dark:text-white mb-2">My Reputation</h2>
        <p className="text-zinc-500 text-sm mb-6">Your impact on the community is measured by your Help Score.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Help Score</p>
            <p className="text-3xl font-black text-black dark:text-white">{userProfile?.help_score || 0}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Tasks Done</p>
            <p className="text-3xl font-black text-black dark:text-white">{userProfile?.tasks_completed || 0}</p>
          </div>
        </div>

        <div className={`border ${tier.border} ${tier.bg} rounded-2xl p-6`}>
          <h3 className={`font-bold ${tier.color} text-lg mb-1`}>Current Tier: {tier.name}</h3>
          <p className="text-sm font-medium opacity-80 text-black dark:text-white">
            {tier.name === 'Gold Tier' ? 'You reached the highest tier! Thank you for your incredible service.' : 'Complete more tasks and earn high ratings to reach the next tier!'}
          </p>
        </div>
      </div>
    </div>
  )

  const SettingsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative zoom-in-95 animate-in duration-200">
        <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <Settings className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-black dark:text-white mb-6">Profile Settings</h2>
        
        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Phone Number</Label>
            <Input 
              value={settingsForm.phone} 
              onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})} 
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-12 rounded-xl focus-visible:ring-indigo-500" 
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Operating Area</Label>
            <Input 
              value={settingsForm.area_name} 
              onChange={e => setSettingsForm({...settingsForm, area_name: e.target.value})} 
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-12 rounded-xl focus-visible:ring-indigo-500" 
              placeholder="e.g. Andheri West"
            />
          </div>
          <div className="space-y-2 pb-4">
            <Label className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Preferred Language</Label>
            <select 
              value={settingsForm.language} 
              onChange={e => setSettingsForm({...settingsForm, language: e.target.value})} 
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white h-12 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
              <option>Gujarati</option>
            </select>
          </div>
          <button type="submit" disabled={updateProfileMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )

  const DesktopProfile = () => (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 relative">
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 md:p-8 rounded-[1rem] shadow-xl border border-gray-200 dark:border-zinc-800 relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner border-4 border-white dark:border-zinc-900 shrink-0 overflow-hidden relative group">
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
            <UserCircle className="w-12 h-12 text-gray-400" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            {userProfile?.full_name || 'Volunteer Profile'}
            <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-widest font-black ${tier.bg} ${tier.color} ${tier.border} border`}>
              {tier.name}
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">Manage your personal details, verification, and settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Verification Status */}
        <div onClick={() => setActiveModal('verification')} className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden p-6 hover:scale-[1.02] transition-transform cursor-pointer group">
          <div className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center mb-4 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Verification</h3>
          <p className="text-gray-500 font-medium text-sm flex-1">Complete your identity verification to unlock higher priority tasks and build trust.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
            <span>Status: <span className="capitalize">{userProfile?.verification_status || 'unverified'}</span></span>
            <span className="text-blue-500 group-hover:underline">Verify Now &rarr;</span>
          </div>
        </div>

        {/* Reputation & Badges */}
        <div onClick={() => setActiveModal('reputation')} className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden p-6 hover:scale-[1.02] transition-transform cursor-pointer group">
          <div className={`w-12 h-12 ${tier.bg} ${tier.color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Reputation</h3>
          <p className="text-gray-500 font-medium text-sm flex-1">View your earned badges, reviews, and detailed help score breakdown.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
            <span>Score: {userProfile?.help_score || 0}</span>
            <span className={`${tier.color} group-hover:underline`}>View Badges &rarr;</span>
          </div>
        </div>

        {/* Settings */}
        <div onClick={() => setActiveModal('settings')} className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden p-6 hover:scale-[1.02] transition-transform cursor-pointer group">
          <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl flex items-center justify-center mb-4 shadow-md border border-gray-200 dark:border-zinc-700">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Settings</h3>
          <p className="text-gray-500 font-medium text-sm flex-1">Update your personal information, operating area, and preferred language.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
            <span>Preferences</span>
            <span className="text-gray-500 dark:text-gray-400 group-hover:underline">Manage &rarr;</span>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {activeModal === 'verification' && <VerificationModal />}
      {activeModal === 'reputation' && <ReputationModal />}
      {activeModal === 'settings' && <SettingsModal />}
    </div>
  )

  const MobileProfile = () => (
    <div className="p-4 space-y-6 bg-slate-50 dark:bg-[#0A0A0A] min-h-screen text-zinc-900 dark:text-zinc-50">
      <div className="flex flex-col gap-1 pt-2 px-2">
        <h1 className="text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-indigo-900 to-indigo-500 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent pb-1">
          Profile
        </h1>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Your volunteer account details</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-md overflow-hidden relative">
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
             <UserCircle className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{userProfile?.full_name || 'Volunteer'}</p>
          <span className={`inline-block mt-2 px-3 py-1 ${tier.bg} ${tier.color} text-xs font-black uppercase tracking-widest rounded-md`}>
            {tier.name}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={() => setActiveModal('verification')} className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] active:scale-95 transition-transform text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Verification</h3>
              <p className="text-sm font-bold text-gray-500 capitalize">Status: {userProfile?.verification_status || 'unverified'}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={() => setActiveModal('reputation')} className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] active:scale-95 transition-transform text-left">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${tier.bg} ${tier.color} rounded-xl flex items-center justify-center`}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Reputation</h3>
              <p className="text-sm font-bold text-gray-500">Badges & Score</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={() => setActiveModal('settings')} className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] active:scale-95 transition-transform text-left">
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

      {/* Modals */}
      {activeModal === 'verification' && <VerificationModal />}
      {activeModal === 'reputation' && <ReputationModal />}
      {activeModal === 'settings' && <SettingsModal />}
    </div>
  )

  return isMobile ? <MobileProfile /> : <DesktopProfile />
}
