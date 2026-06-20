'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Building, MapPin, Phone, Mail, Globe, MessageCircle, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function DonorNGODetailPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { ngoId } = useParams<{ ngoId: string }>()
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false)
  const [selectedNeed, setSelectedNeed] = useState<any>(null)
  const [inquiryForm, setInquiryForm] = useState({ message: '', contact_phone: '', contact_email: '' })
  const [interestForm, setInterestForm] = useState({ message: '', contact_phone: '', contact_email: '' })

  const { data: myProfile } = useQuery({
    queryKey: ['donorProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('profiles').select('id, full_name, phone').eq('id', user.id).single()
      return data
    }
  })

  const { data: ngo, isLoading } = useQuery({
    queryKey: ['donorNgoDetail', ngoId],
    enabled: !!ngoId,
    queryFn: async () => {
      const { data } = await supabase.from('ngo_profiles').select('*').eq('id', ngoId).single()
      return data
    }
  })

  const { data: needs } = useQuery({
    queryKey: ['ngoNeedsDonor', ngoId],
    enabled: !!ngoId,
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_needs')
        .select('*')
        .eq('ngo_id', ngoId)
        .eq('fulfilled', false)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const submitInquiry = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('ngo_inquiries').insert({
        ngo_id: ngoId,
        donor_id: user!.id,
        message: inquiryForm.message,
        contact_phone: inquiryForm.contact_phone || null,
        contact_email: inquiryForm.contact_email || null
      })
      if (error) throw error
    },
    onSuccess: () => {
      setIsInquiryOpen(false)
      setInquiryForm({ message: '', contact_phone: '', contact_email: '' })
    }
  })

  const submitInterest = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('need_interests').insert({
        need_id: selectedNeed!.id,
        donor_id: user!.id,
        message: interestForm.message || null,
        contact_phone: interestForm.contact_phone || null,
        contact_email: interestForm.contact_email || null
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoNeedsDonor'] })
      setIsNeedModalOpen(false)
      setSelectedNeed(null)
      setInterestForm({ message: '', contact_phone: '', contact_email: '' })
    }
  })

  // Pre-fill contact info from profile
  React.useEffect(() => {
    if (myProfile) {
      setInquiryForm(prev => ({ ...prev, contact_phone: myProfile.phone || '' }))
      setInterestForm(prev => ({ ...prev, contact_phone: myProfile.phone || '' }))
    }
  }, [myProfile])

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" /></div>
  if (!ngo) return <div className="p-8 text-center text-red-500">NGO not found.</div>

  const gallery: string[] = ngo.gallery_image_urls || []

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 min-h-screen">
      <Link href="/donor/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Browse
      </Link>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="relative h-72 rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-sm">
          <img src={gallery[galleryIndex]} alt="" className="w-full h-full object-cover" />
          {gallery.length > 1 && (
            <>
              <button onClick={() => setGalleryIndex(i => (i - 1 + gallery.length) % gallery.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center shadow-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setGalleryIndex(i => (i + 1) % gallery.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center shadow-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {gallery.map((_: any, i: number) => (
                  <button key={i} onClick={() => setGalleryIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === galleryIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* NGO Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        {gallery.length === 0 && <div className="h-20 bg-gradient-to-r from-zinc-900 to-zinc-700" />}
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-5">
            {ngo.logo_url ? (
              <img src={ngo.logo_url} alt="" className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-zinc-900 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Building className="w-10 h-10 text-zinc-400" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black">{ngo.ngo_name}</h1>
              {ngo.registration_number && <p className="text-sm font-bold text-zinc-500">Reg: {ngo.registration_number}</p>}
            </div>
          </div>

          {ngo.about_description && <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">{ngo.about_description}</p>}

          <div className="flex flex-wrap gap-2">
            {(ngo.beneficiary_groups || []).map((t: string) => <span key={t} className="px-3 py-1 text-sm font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg">{t}</span>)}
            {(ngo.service_types || []).map((t: string) => <span key={t} className="px-3 py-1 text-sm font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg">{t}</span>)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-sm">
            {ngo.address && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-zinc-400 mt-0.5" /><span className="text-zinc-600 dark:text-zinc-400 font-medium">{ngo.address}</span></div>}
            {ngo.contact_phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-zinc-400" /><a href={`tel:${ngo.contact_phone}`} className="font-bold hover:underline">{ngo.contact_phone}</a></div>}
            {ngo.contact_email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-400" /><a href={`mailto:${ngo.contact_email}`} className="font-bold hover:underline">{ngo.contact_email}</a></div>}
            {ngo.website_url && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-zinc-400" /><a href={ngo.website_url} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline truncate">{ngo.website_url}</a></div>}
          </div>
        </div>
      </div>

      {/* Inquire CTA */}
      <button onClick={() => setIsInquiryOpen(true)}
        className="w-full py-4 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-black text-lg rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3">
        <MessageCircle className="w-6 h-6" /> Inquire to Support
      </button>

      {/* Needs Section */}
      {needs && needs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-zinc-500" /> Current Needs
          </h2>
          <p className="text-zinc-500 text-sm font-medium">This NGO has expressed specific needs you can help fulfill.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {needs.map((need: any) => (
              <div key={need.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-zinc-900 dark:text-white">{need.title}</h3>
                    {need.category && <span className="px-2 py-0.5 text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md">{need.category}</span>}
                  </div>
                  {need.description && <p className="text-sm text-zinc-500 font-medium">{need.description}</p>}
                </div>
                <button
                  onClick={() => { setSelectedNeed(need); setIsNeedModalOpen(true) }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4" /> I Want to Help
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inquire Modal */}
      {isInquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111] rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 space-y-5">
              <div>
                <h2 className="text-2xl font-black dark:text-white">Send Inquiry</h2>
                <p className="text-sm text-zinc-500 mt-1">to {ngo.ngo_name}</p>
              </div>
              <textarea rows={4} placeholder="How would you like to support this NGO?" value={inquiryForm.message} onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none resize-none dark:text-white" />
              <input type="text" placeholder="Phone (optional)" value={inquiryForm.contact_phone} onChange={e => setInquiryForm({ ...inquiryForm, contact_phone: e.target.value })}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none dark:text-white" />
              <input type="email" placeholder="Email (optional)" value={inquiryForm.contact_email} onChange={e => setInquiryForm({ ...inquiryForm, contact_email: e.target.value })}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none dark:text-white" />
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-black/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
              <button onClick={() => setIsInquiryOpen(false)} className="flex-1 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold dark:text-white">Cancel</button>
              <button onClick={() => submitInquiry.mutate()} disabled={submitInquiry.isPending || !inquiryForm.message}
                className="flex-1 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold disabled:opacity-50">
                {submitInquiry.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* I Want to Help Modal */}
      {isNeedModalOpen && selectedNeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111] rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 space-y-5">
              <div>
                <h2 className="text-2xl font-black dark:text-white">I Want to Help</h2>
                <p className="text-sm text-zinc-500 mt-1">Need: <span className="font-bold text-zinc-700 dark:text-zinc-300">{selectedNeed.title}</span></p>
              </div>
              <textarea rows={3} placeholder="Any message for the NGO? (optional)" value={interestForm.message} onChange={e => setInterestForm({ ...interestForm, message: e.target.value })}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none resize-none dark:text-white" />
              <input type="text" placeholder="Phone" value={interestForm.contact_phone} onChange={e => setInterestForm({ ...interestForm, contact_phone: e.target.value })}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none dark:text-white" />
              <input type="email" placeholder="Email" value={interestForm.contact_email} onChange={e => setInterestForm({ ...interestForm, contact_email: e.target.value })}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium outline-none dark:text-white" />
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-black/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
              <button onClick={() => { setIsNeedModalOpen(false); setSelectedNeed(null) }} className="flex-1 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold dark:text-white">Cancel</button>
              <button onClick={() => submitInterest.mutate()} disabled={submitInterest.isPending}
                className="flex-1 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold disabled:opacity-50">
                {submitInterest.isPending ? 'Sending...' : 'Express Interest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
