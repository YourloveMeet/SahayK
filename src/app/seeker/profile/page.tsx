'use client'

import React, { useState, useEffect } from 'react'
import { UserCircle, ShieldCheck, HelpCircle, ChevronRight, CheckCircle } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { LogoutButton } from '@/components/LogoutButton'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'

export default function SeekerProfilePage() {
  const isMobile = useIsMobile()
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', area_name: '', language: '' })

  const { data: profile, isLoading } = useQuery({
    queryKey: ['seekerProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      return { ...data, email: user.email }
    }
  })

  useEffect(() => {
    if (profile && !isEditing) {
      setForm({ 
        full_name: profile.full_name || '', 
        phone: profile.phone || '',
        area_name: profile.area_name || '',
        language: profile.language || 'English'
      })
    }
  }, [profile, isEditing])

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('profiles').update({ 
        full_name: form.full_name, 
        phone: form.phone,
        area_name: form.area_name,
        language: form.language
      }).eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seekerProfile'] })
      setIsEditing(false)
    }
  })

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  const DesktopProfile = () => (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 relative">
      {/* Background Orbs */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 md:p-8 rounded-[1rem] shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-zinc-800 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-8 text-center md:text-left flex-1">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center shadow-inner border-4 border-white dark:border-zinc-900 shrink-0">
             <UserCircle className="w-12 h-12 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {profile?.full_name || 'Seeker Profile'}
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">{profile?.email}</p>
          </div>
        </div>
        <div>
           {!isEditing ? (
             <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl transition-colors">Edit Profile</button>
           ) : (
             <div className="flex gap-3">
               <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-bold">Cancel</button>
               <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
                 className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2">
                 <CheckCircle className="w-5 h-5" /> Save Changes
               </button>
             </div>
           )}
        </div>
      </div>

      {isEditing && (
        <div className="relative z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
            <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="h-12 bg-white dark:bg-black/40 border-gray-200 dark:border-zinc-700 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Phone Number</label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-12 bg-white dark:bg-black/40 border-gray-200 dark:border-zinc-700 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Address / Area</label>
            <Input value={form.area_name} onChange={e => setForm({ ...form, area_name: e.target.value })} className="h-12 bg-white dark:bg-black/40 border-gray-200 dark:border-zinc-700 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Preferred Language</label>
            <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="w-full h-12 px-4 bg-white dark:bg-black/40 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="relative z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Phone Number</label>
            <p className="p-3 font-bold text-lg">{profile?.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Address / Area</label>
            <p className="p-3 font-bold text-lg">{profile?.area_name || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Preferred Language</label>
            <p className="p-3 font-bold text-lg">{profile?.language || 'English'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 pt-4">
        
        {/* Verification Status */}
        <div 
          onClick={() => {
            if (profile?.verification_status === 'unverified' || profile?.verification_status === 'rejected') {
              window.location.href = '/seeker/verify'
            }
          }} 
          className={`backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden p-6 hover:shadow-md transition-all ${
            (profile?.verification_status === 'unverified' || profile?.verification_status === 'rejected') ? 'cursor-pointer hover:scale-[1.02] group' : 'cursor-default'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md ${
            profile?.verification_status === 'verified' ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 
            profile?.verification_status === 'pending' ? 'bg-amber-500 text-white shadow-amber-500/20' : 
            'bg-blue-600 text-white shadow-blue-500/20'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Verification</h3>
          <p className="text-gray-500 font-medium text-sm flex-1">
            {profile?.verification_status === 'verified' ? 'Your identity is fully verified. You can now receive faster help.' :
             profile?.verification_status === 'pending' ? 'Your verification request is currently under review by an administrator.' :
             'Verify your identity to get faster help from trusted volunteers.'}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
            <span className="capitalize">Status: {profile?.verification_status || 'Unverified'}</span>
            {(profile?.verification_status === 'unverified' || profile?.verification_status === 'rejected') && (
              <span className="text-blue-600 dark:text-blue-400 group-hover:underline">Verify &rarr;</span>
            )}
            {profile?.verification_status === 'verified' && (
              <span className="text-emerald-600 dark:text-emerald-400">Verified ✓</span>
            )}
            {profile?.verification_status === 'pending' && (
              <span className="text-amber-500 dark:text-amber-400">Pending Review</span>
            )}
          </div>
        </div>

        {/* Support Options */}
        <div onClick={() => alert('Help & Support feature is coming soon!')} className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden p-6 hover:scale-[1.02] hover:shadow-md transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center mb-4 shadow-md">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Help & Support</h3>
          <p className="text-gray-500 font-medium text-sm flex-1">Contact administrators or read our frequently asked questions.</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
            <span>Resources</span>
            <span className="text-gray-500 dark:text-gray-400 group-hover:underline">Get Help &rarr;</span>
          </div>
        </div>

      </div>
    </div>
  )

  const MobileProfile = () => (
    <div className="p-4 space-y-6 bg-slate-50 dark:bg-[#0A0A0A] min-h-screen text-zinc-900 dark:text-zinc-50 pb-24">
      <div className="flex flex-col gap-1 pt-2 px-2">
        <h1 className="text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent pb-1">
          Profile
        </h1>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Your seeker account details</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-200/80 dark:border-zinc-800/80 shadow-sm p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-sm">
           {profile?.avatar_url ? (
             <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
           ) : (
             <UserCircle className="w-10 h-10 text-blue-500" />
           )}
        </div>
        <div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{profile?.full_name || 'Seeker'}</p>
          <p className="text-sm font-bold text-gray-500 mt-1">{profile?.email}</p>
        </div>
      </div>

      {!isEditing ? (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-lg">Personal Details</h3>
            <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-lg">Edit</button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-black text-gray-500 uppercase">Phone</p>
              <p className="font-bold">{profile?.phone || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-black text-gray-500 uppercase">Address</p>
              <p className="font-bold">{profile?.area_name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-black text-gray-500 uppercase">Language</p>
              <p className="font-bold">{profile?.language || 'English'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
          <h3 className="font-extrabold text-lg mb-2">Edit Details</h3>
          
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase">Full Name</label>
            <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl h-12" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase">Phone</label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl h-12" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase">Address / Area</label>
            <Input value={form.area_name} onChange={e => setForm({ ...form, area_name: e.target.value })} className="bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl h-12" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase">Preferred Language</label>
            <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="w-full h-12 px-4 bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl font-medium outline-none">
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold">Cancel</button>
            <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Save
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-4">
        <button 
          onClick={() => {
            if (profile?.verification_status === 'unverified' || profile?.verification_status === 'rejected') {
              window.location.href = '/seeker/verify'
            }
          }}
          className={`w-full flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm text-left border border-gray-100 dark:border-zinc-800 transition-transform ${
            (profile?.verification_status === 'unverified' || profile?.verification_status === 'rejected') ? 'active:scale-95' : ''
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              profile?.verification_status === 'verified' ? 'bg-emerald-600 text-white' : 
              profile?.verification_status === 'pending' ? 'bg-amber-500 text-white' : 
              'bg-blue-600 text-white'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Verification</h3>
              <p className="text-sm font-bold text-gray-500 capitalize">Status: {profile?.verification_status || 'Unverified'}</p>
            </div>
          </div>
          {(profile?.verification_status === 'unverified' || profile?.verification_status === 'rejected') ? (
            <div className="flex items-center gap-1 text-sm font-bold text-blue-600">
              Verify <ChevronRight className="w-4 h-4" />
            </div>
          ) : (
             <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <button onClick={() => alert('Help & Support feature is coming soon!')} className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm active:scale-95 transition-transform text-left border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Help & Support</h3>
              <p className="text-sm font-bold text-gray-500">Contact administrators</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="pt-8 flex justify-center pb-8">
        <LogoutButton />
      </div>
    </div>
  )

  return isMobile ? <MobileProfile /> : <DesktopProfile />
}
