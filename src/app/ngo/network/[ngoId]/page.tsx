'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building, MapPin, Phone, Mail, Globe, SendHorizonal } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function NGODetailPage() {
  const supabase = createClient()
  const { ngoId } = useParams<{ ngoId: string }>()

  const { data: ngo, isLoading } = useQuery({
    queryKey: ['ngoDetail', ngoId],
    enabled: !!ngoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ngo_profiles')
        .select('*')
        .eq('id', ngoId)
        .single()
      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!ngo) {
    return <div className="p-8 text-center text-red-500">NGO not found.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 min-h-screen">
      {/* Back */}
      <Link href="/ngo/network" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Network
      </Link>

      {/* Hero Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="h-24 bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-800 dark:to-zinc-900" />
        <div className="p-8 pt-0">
          <div className="-mt-10 mb-6 flex items-end gap-5">
            {ngo.logo_url ? (
              <img src={ngo.logo_url} alt={ngo.ngo_name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-zinc-900 shadow-lg bg-white dark:bg-zinc-900" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-lg flex items-center justify-center">
                <Building className="w-10 h-10 text-zinc-400" />
              </div>
            )}
            <div className="pb-1">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">{ngo.ngo_name}</h1>
              {ngo.registration_number && (
                <p className="text-sm font-bold text-zinc-500">Reg: {ngo.registration_number}</p>
              )}
            </div>
          </div>

          {ngo.about_description && (
            <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mb-6">{ngo.about_description}</p>
          )}

          {/* Tags */}
          {((ngo.beneficiary_groups?.length || 0) + (ngo.service_types?.length || 0)) > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {(ngo.beneficiary_groups || []).map((tag: string) => (
                <span key={tag} className="px-3 py-1 text-sm font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg">{tag}</span>
              ))}
              {(ngo.service_types || []).map((tag: string) => (
                <span key={tag} className="px-3 py-1 text-sm font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg">{tag}</span>
              ))}
            </div>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            {ngo.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <span className="font-medium text-zinc-600 dark:text-zinc-400">{ngo.address}</span>
              </div>
            )}
            {ngo.contact_phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                <a href={`tel:${ngo.contact_phone}`} className="font-bold text-zinc-900 dark:text-white hover:underline">{ngo.contact_phone}</a>
              </div>
            )}
            {ngo.contact_email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                <a href={`mailto:${ngo.contact_email}`} className="font-bold text-zinc-900 dark:text-white hover:underline">{ngo.contact_email}</a>
              </div>
            )}
            {ngo.website_url && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
                <a href={ngo.website_url} target="_blank" rel="noreferrer" className="font-bold text-blue-600 dark:text-blue-400 hover:underline truncate">{ngo.website_url}</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Link
          href={`/ngo/network/${ngoId}/refer`}
          className="flex items-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold rounded-xl transition-all shadow-lg"
        >
          <SendHorizonal className="w-5 h-5" />
          Refer a Case
        </Link>
      </div>
    </div>
  )
}
