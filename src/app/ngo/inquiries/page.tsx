'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Inbox, Mail, Phone, MessageCircle, CheckCircle, Clock } from 'lucide-react'

export default function NGOInquiriesPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: myNGO } = useQuery({
    queryKey: ['myNgoProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('ngo_profiles').select('id').eq('user_id', user.id).single()
      return data
    }
  })

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ['ngoInquiries', myNGO?.id],
    enabled: !!myNGO?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_inquiries')
        .select('*, donor:donor_id(full_name, avatar_url)')
        .eq('ngo_id', myNGO!.id)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('ngo_inquiries').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ngoInquiries'] })
  })

  const newCount = inquiries?.filter(i => i.status === 'new').length || 0

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 min-h-screen">
      <div>
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Inbox className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
          Donor Inquiries
        </h1>
        <p className="text-zinc-500 mt-1 font-medium">
          Messages from donors interested in supporting your NGO.
          {newCount > 0 && <span className="ml-2 font-bold text-zinc-900 dark:text-white">{newCount} new</span>}
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-28 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)
        ) : !inquiries?.length ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <MessageCircle className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-xl font-bold">No inquiries yet</h3>
            <p className="text-zinc-500 mt-1">Donor messages will appear here once your profile is discovered.</p>
          </div>
        ) : (
          inquiries.map(inquiry => {
            const isNew = inquiry.status === 'new'
            const donor = inquiry.donor as any
            return (
              <div key={inquiry.id} className={`bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm transition-all ${isNew ? 'border-zinc-400 dark:border-zinc-600' : 'border-zinc-200 dark:border-zinc-800'}`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-lg shrink-0">
                      {donor?.full_name?.charAt(0) || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-black text-zinc-900 dark:text-white">{donor?.full_name || 'Anonymous Donor'}</span>
                        {isNew && (
                          <span className="px-2 py-0.5 text-[10px] font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full uppercase tracking-wider">New</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-3">{inquiry.message}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-zinc-500 font-medium">
                        {inquiry.contact_email && (
                          <a href={`mailto:${inquiry.contact_email}`} className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <Mail className="w-3.5 h-3.5" /> {inquiry.contact_email}
                          </a>
                        )}
                        {inquiry.contact_phone && (
                          <a href={`tel:${inquiry.contact_phone}`} className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <Phone className="w-3.5 h-3.5" /> {inquiry.contact_phone}
                          </a>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {new Date(inquiry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isNew && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: inquiry.id, status: 'responded' })}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm rounded-xl transition-all shrink-0"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Responded
                    </button>
                  )}
                  {!isNew && (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold shrink-0 pt-1">
                      <CheckCircle className="w-4 h-4" /> Responded
                    </span>
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
