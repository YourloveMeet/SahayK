'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HeartHandshake, Plus, Tag, CheckCircle, Users, ChevronDown, ChevronUp } from 'lucide-react'

export default function NGONeedsPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', category: '' })

  const { data: myNGO } = useQuery({
    queryKey: ['myNgoProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('ngo_profiles').select('id').eq('user_id', user.id).single()
      return data
    }
  })

  const { data: needs, isLoading } = useQuery({
    queryKey: ['ngoNeeds', myNGO?.id],
    enabled: !!myNGO?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_needs')
        .select('*')
        .eq('ngo_id', myNGO!.id)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const { data: interests } = useQuery({
    queryKey: ['ngoNeedsInterests', myNGO?.id, needs?.length],
    enabled: !!myNGO?.id && !!needs?.length,
    queryFn: async () => {
      if (!needs?.length) return {}
      const needIds = needs.map(n => n.id)
      const { data } = await supabase
        .from('need_interests')
        .select('*, donor:donor_id(full_name)')
        .in('need_id', needIds)
      // Group by need_id
      const grouped: Record<string, any[]> = {}
      ;(data || []).forEach(i => {
        if (!grouped[i.need_id]) grouped[i.need_id] = []
        grouped[i.need_id].push(i)
      })
      return grouped
    }
  })

  const addNeedMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('ngo_needs').insert({
        ngo_id: myNGO!.id,
        title: form.title,
        description: form.description,
        category: form.category || null
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoNeeds'] })
      setIsModalOpen(false)
      setForm({ title: '', description: '', category: '' })
    }
  })

  const toggleFulfilled = useMutation({
    mutationFn: async ({ id, fulfilled }: { id: string; fulfilled: boolean }) => {
      const { error } = await supabase.from('ngo_needs').update({ fulfilled }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ngoNeeds'] })
  })

  const categories = ['Equipment', 'Medical', 'Daily Essentials', 'Food', 'Clothing', 'Volunteer Help', 'Other']

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <HeartHandshake className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
            Needs Board
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Post anonymized needs — donors can offer to help.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" /> Post a Need
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)
        ) : !needs?.length ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <HeartHandshake className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-xl font-bold">No needs posted yet</h3>
            <p className="text-zinc-500 mt-1">Post anonymized needs to let donors help your residents.</p>
          </div>
        ) : (
          needs.map(need => {
            const needInterests = interests?.[need.id] || []
            const isExpanded = expandedId === need.id
            return (
              <div key={need.id} className={`bg-white dark:bg-zinc-900 border rounded-2xl shadow-sm transition-all ${need.fulfilled ? 'border-zinc-100 dark:border-zinc-800 opacity-60' : 'border-zinc-200 dark:border-zinc-800'}`}>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className={`text-lg font-black ${need.fulfilled ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>{need.title}</h3>
                        {need.category && (
                          <span className="px-2.5 py-0.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg">{need.category}</span>
                        )}
                        {need.fulfilled && (
                          <span className="px-2.5 py-0.5 text-xs font-black bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-1"><CheckCircle className="w-3 h-3" />Fulfilled</span>
                        )}
                      </div>
                      {need.description && <p className="text-sm text-zinc-500 font-medium">{need.description}</p>}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {needInterests.length > 0 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : need.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          <Users className="w-4 h-4" />
                          {needInterests.length} interested
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={() => toggleFulfilled.mutate({ id: need.id, fulfilled: !need.fulfilled })}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${need.fulfilled ? 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800' : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white hover:bg-black dark:hover:bg-zinc-200'}`}
                      >
                        {need.fulfilled ? 'Reopen' : 'Mark Fulfilled'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded interests */}
                  {isExpanded && needInterests.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                      <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Interested Donors</p>
                      {needInterests.map((interest: any) => (
                        <div key={interest.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                          <p className="font-bold text-sm text-zinc-900 dark:text-white">{(interest.donor as any)?.full_name || 'Anonymous Donor'}</p>
                          {interest.message && <p className="text-sm text-zinc-500 mt-1">{interest.message}</p>}
                          <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                            {interest.contact_email && <span>{interest.contact_email}</span>}
                            {interest.contact_phone && <span>{interest.contact_phone}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111] rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black dark:text-white">Post a Need</h2>
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    ⚠️ Do not include resident names or identifying details — describe the need generally (e.g., "a resident with mobility difficulty").
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="Need title (e.g. Wheelchair needed)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none dark:text-white" />
                <textarea rows={3} placeholder="General description of the need..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none resize-none dark:text-white" />
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none dark:text-white">
                  <option value="">— Category (optional) —</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-black/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold dark:text-white">Cancel</button>
              <button onClick={() => addNeedMutation.mutate()} disabled={addNeedMutation.isPending || !form.title}
                className="flex-1 py-3.5 bg-zinc-900 hover:bg-black dark:bg-white dark:text-zinc-900 text-white rounded-xl font-bold disabled:opacity-50">
                Post Need
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
