'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, AlertTriangle, User, Phone, FileText, Tag } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function ReferCasePage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { ngoId } = useParams<{ ngoId: string }>()

  const [form, setForm] = useState({
    person_name: '',
    description: '',
    category: '',
    urgency: 'normal',
    contact_phone: ''
  })

  const { data: toNGO } = useQuery({
    queryKey: ['ngoDetail', ngoId],
    enabled: !!ngoId,
    queryFn: async () => {
      const { data } = await supabase.from('ngo_profiles').select('id, ngo_name, beneficiary_groups').eq('id', ngoId).single()
      return data
    }
  })

  const { data: fromNGO } = useQuery({
    queryKey: ['myNgoProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('ngo_profiles').select('id').eq('user_id', user.id).single()
      return data
    }
  })

  const referMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('ngo_referrals').insert({
        from_ngo_id: fromNGO!.id,
        to_ngo_id: ngoId,
        person_name: form.person_name,
        description: form.description,
        category: form.category || null,
        urgency: form.urgency,
        contact_phone: form.contact_phone || null
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoReferrals'] })
      router.push('/ngo/referrals')
    }
  })

  const categories = toNGO?.beneficiary_groups?.length
    ? toNGO.beneficiary_groups
    : ['Elderly', 'Children', 'Disabled', 'Mental Health', 'Food Assistance', 'Medical', 'Other']

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-10 space-y-8 min-h-screen">
      <Link href={`/ngo/network/${ngoId}`} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to {toNGO?.ngo_name || 'NGO'}
      </Link>

      <div>
        <h1 className="text-3xl font-black tracking-tight">Refer a Case</h1>
        <p className="text-zinc-500 mt-1 font-medium">
          Sending to: <span className="font-bold text-zinc-900 dark:text-white">{toNGO?.ngo_name}</span>
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Urgency Toggle */}
        <div className="flex gap-3 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
          {['normal', 'urgent'].map(u => (
            <button
              key={u}
              onClick={() => setForm({ ...form, urgency: u })}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${form.urgency === u
                ? u === 'urgent' ? 'bg-red-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500'
              }`}
            >
              {u === 'urgent' && <AlertTriangle className="w-4 h-4 inline mr-1.5" />}
              {u}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Person's Name *
          </label>
          <input
            type="text"
            placeholder="Full name of the individual"
            value={form.person_name}
            onChange={e => setForm({ ...form, person_name: e.target.value })}
            className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none dark:text-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Description of Need *
          </label>
          <textarea
            rows={4}
            placeholder="Describe the case and why this NGO is a better fit..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none resize-none dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" /> Category
            </label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none dark:text-white"
            >
              <option value="">— Select category —</option>
              {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Contact Phone (optional)
            </label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={form.contact_phone}
              onChange={e => setForm({ ...form, contact_phone: e.target.value })}
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none dark:text-white"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Link href={`/ngo/network/${ngoId}`} className="flex-1 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-center hover:bg-zinc-50 transition-colors dark:text-white">
            Cancel
          </Link>
          <button
            onClick={() => referMutation.mutate()}
            disabled={referMutation.isPending || !form.person_name || !form.description}
            className="flex-1 py-3.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
          >
            {referMutation.isPending ? 'Sending...' : 'Send Referral'}
          </button>
        </div>
      </div>
    </div>
  )
}
