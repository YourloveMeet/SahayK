'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCircle, CheckCircle, Heart } from 'lucide-react'

export default function DonorProfilePage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '' })

  const { data: profile, isLoading } = useQuery({
    queryKey: ['donorProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data } = await supabase.from('profiles').select('id, full_name, phone, role').eq('id', user.id).single()
      return { ...data, email: user.email }
    }
  })

  useEffect(() => {
    if (profile && !isEditing) {
      setForm({ full_name: profile.full_name || '', phone: profile.phone || '' })
    }
  }, [profile, isEditing])

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone }).eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donorProfile'] })
      setIsEditing(false)
    }
  })

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-10 space-y-8 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-zinc-700 dark:text-zinc-300" /> My Profile
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Manage your donor account details.</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl">Edit</button>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => { setIsEditing(false) }} className="px-5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold">Cancel</button>
            <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Save
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center">
            <Heart className="w-10 h-10 text-zinc-400" />
          </div>
          <div>
            <p className="text-2xl font-black">{profile?.full_name || 'Donor'}</p>
            <p className="text-sm font-bold text-zinc-500">{profile?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Full Name</label>
            {isEditing ? (
              <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none dark:text-white" />
            ) : (
              <p className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl font-medium">{profile?.full_name || 'Not provided'}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Phone</label>
            {isEditing ? (
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none dark:text-white" />
            ) : (
              <p className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl font-medium">{profile?.phone || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
