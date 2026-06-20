'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SendHorizonal, Inbox, AlertTriangle, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'

type Tab = 'received' | 'sent'

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  acknowledged: { label: 'Acknowledged', icon: CheckCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  declined: { label: 'Declined', icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
}

export default function ReferralsPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('received')

  const { data: myNGO } = useQuery({
    queryKey: ['myNgoProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('ngo_profiles').select('id, ngo_name').eq('user_id', user.id).single()
      return data
    }
  })

  const { data: referrals, isLoading } = useQuery({
    queryKey: ['ngoReferrals', myNGO?.id],
    enabled: !!myNGO?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_referrals')
        .select(`
          *,
          from_ngo:from_ngo_id(ngo_name, logo_url),
          to_ngo:to_ngo_id(ngo_name, logo_url)
        `)
        .or(`from_ngo_id.eq.${myNGO!.id},to_ngo_id.eq.${myNGO!.id}`)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const received = referrals?.filter(r => r.to_ngo_id === myNGO?.id) || []
  const sent = referrals?.filter(r => r.from_ngo_id === myNGO?.id) || []
  const current = tab === 'received' ? received : sent

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('ngo_referrals').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ngoReferrals'] })
  })

  const nextStatus: Record<string, string | null> = {
    pending: 'acknowledged',
    acknowledged: 'resolved',
    resolved: null,
    declined: null
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 min-h-screen">
      <div>
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <SendHorizonal className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
          Referrals
        </h1>
        <p className="text-zinc-500 mt-1 font-medium">Case referrals sent to and received from partner NGOs.</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit gap-1">
        {(['received', 'sent'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm capitalize transition-all flex items-center gap-2 ${tab === t ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}
          >
            {t === 'received' ? <Inbox className="w-4 h-4" /> : <SendHorizonal className="w-4 h-4" />}
            {t}
            {t === 'received' && received.filter(r => r.status === 'pending').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {received.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-28 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)
        ) : current.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <SendHorizonal className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-xl font-bold">No {tab} referrals</h3>
            <p className="text-zinc-500 mt-1">
              {tab === 'received' ? 'No NGOs have referred cases to you yet.' : 'You haven\'t referred any cases yet.'}
            </p>
          </div>
        ) : (
          current.map(r => {
            const S = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
            const SIcon = S.icon
            const next = nextStatus[r.status]
            return (
              <div key={r.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white">{r.person_name}</h3>
                      {r.urgency === 'urgent' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black bg-red-600 text-white rounded-full">
                          <AlertTriangle className="w-3 h-3" /> URGENT
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${S.color}`}>
                        <SIcon className="w-3.5 h-3.5" /> {S.label}
                      </span>
                      {r.category && (
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full">{r.category}</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium line-clamp-2">{r.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 font-medium">
                      <span>
                        {tab === 'received'
                          ? `From: ${(r.from_ngo as any)?.ngo_name}`
                          : `To: ${(r.to_ngo as any)?.ngo_name}`}
                      </span>
                      <span>•</span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      {r.contact_phone && <><span>•</span><span>{r.contact_phone}</span></>}
                    </div>
                  </div>

                  {/* Actions — only receiver can advance status */}
                  {tab === 'received' && next && (
                    <div className="flex gap-2 shrink-0">
                      {r.status === 'pending' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: r.id, status: 'declined' })}
                          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm rounded-xl transition-all"
                        >
                          Decline
                        </button>
                      )}
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: r.id, status: next })}
                        disabled={updateStatusMutation.isPending}
                        className="px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm rounded-xl transition-all flex items-center gap-2"
                      >
                        Mark {next.charAt(0).toUpperCase() + next.slice(1)} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
