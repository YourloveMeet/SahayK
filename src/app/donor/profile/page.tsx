'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  UserCircle, CheckCircle, Heart
} from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'

const MOCK_CAUSES = ['Education', 'Healthcare', 'Elderly Care', 'Animal Welfare', 'Disaster Relief']

export default function DonorProfilePage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [localCauses, setLocalCauses] = useState<string[]>([])

  const { data: profile, isLoading } = useQuery({
    queryKey: ['donorProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      return { ...data, email: user.email }
    }
  })

  useEffect(() => {
    if (profile && !isEditing) {
      setForm({ full_name: profile.full_name || '', phone: profile.phone || '' })
      setLocalCauses(profile.preferred_causes || [])
    }
  }, [profile, isEditing])

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('profiles').update({ 
        full_name: form.full_name, 
        phone: form.phone,
        preferred_causes: localCauses
      }).eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donorProfile'] })
      setIsEditing(false)
    }
  })

  const toggleCause = (cause: string) => {
    if (!isEditing) return;
    setLocalCauses(prev => 
      prev.includes(cause) ? prev.filter(c => c !== cause) : [...prev, cause]
    )
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-10 space-y-6 pb-28">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          My Profile
        </h1>
        <p className="text-zinc-500 mt-1 font-medium">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-zinc-700 dark:text-zinc-300" /> Account Settings
          </h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl text-sm transition-colors">Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Save
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#e8b6d8]/20 rounded-2xl flex items-center justify-center">
            <Heart className="w-8 h-8 text-[#e8b6d8]" />
          </div>
          <div>
            <p className="text-xl font-black">{profile?.full_name || 'Donor'}</p>
            <p className="text-sm font-bold text-zinc-500">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1 mb-1 block">Full Name</label>
            {isEditing ? (
              <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#e8b6d8]" />
            ) : (
              <p className="p-3 bg-zinc-50 dark:bg-zinc-800/30 border border-transparent rounded-xl font-bold">{profile?.full_name || 'Not provided'}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1 mb-1 block">Phone</label>
            {isEditing ? (
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#e8b6d8]" />
            ) : (
              <p className="p-3 bg-zinc-50 dark:bg-zinc-800/30 border border-transparent rounded-xl font-bold">{profile?.phone || 'Not provided'}</p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Preferred Causes</h3>
            {isEditing && <span className="text-[10px] bg-[#e8b6d8]/20 text-[#e8b6d8] font-bold px-2 py-1 rounded-md">Click to toggle</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {MOCK_CAUSES.map(cause => {
              const isSelected = isEditing ? localCauses.includes(cause) : (profile?.preferred_causes || []).includes(cause);
              return (
                <div 
                  key={cause} 
                  onClick={() => toggleCause(cause)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${isEditing ? 'cursor-pointer' : 'cursor-default'} ${isSelected ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white' : 'bg-transparent text-zinc-600 border-zinc-300 dark:text-zinc-400 dark:border-zinc-700'}`}
                >
                  {cause}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="pt-6 w-full flex justify-end">
        <LogoutButton />
      </div>
    </div>
  )
}
