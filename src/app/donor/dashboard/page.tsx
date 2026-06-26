'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { 
  UserCircle, Heart, Download, 
  Receipt, Users, Building2, Wallet, X, Phone
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { LeaderboardWidget } from '@/components/volunteer/LeaderboardWidget'

export default function DonorDashboardPage() {
  const supabase = createClient()
  const isMobile = useIsMobile()
  const [selectedSeeker, setSelectedSeeker] = useState<any | null>(null)

  const { data: leaders } = useQuery({
    queryKey: ['volunteerLeaders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, help_score, tasks_completed, avatar_url, phone')
        .eq('role', 'volunteer')
        .order('help_score', { ascending: false })
        .limit(5)
      return data || []
    }
  })

  const { data: ledger, isLoading: isLedgerLoading } = useQuery({
    queryKey: ['donorLedger'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('donations')
        .select('*, recipient:profiles!donations_recipient_id_fkey(full_name)')
        .eq('donor_id', user!.id)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const { data: requests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ['financialRequests'],
    queryFn: async () => {
      const { data } = await supabase
        .from('seeker_financial_requests')
        .select('*, seeker:profiles!seeker_financial_requests_seeker_id_fkey(full_name, phone, area_name, verification_status, avatar_url, help_score, tasks_completed)')
        .eq('status', 'Open')
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const isLoading = isLedgerLoading || isRequestsLoading
  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" /></div>

  const totalDonated = ledger?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
  const uniqueNGOs = new Set(ledger?.map(tx => tx.recipient_id)).size;
  const directHelps = ledger?.filter(tx => tx.cause !== 'NGO Donation').length || 0;

  const ImpactDashboard = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-[#e8b6d8]/20 to-white dark:to-zinc-900 border border-[#e8b6d8]/30 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-2 text-zinc-600 dark:text-zinc-400 font-bold text-sm">
          <Wallet className="w-5 h-5 text-[#e8b6d8]" /> Total Donated
        </div>
        <div className="text-3xl font-black text-zinc-900 dark:text-white">₹{totalDonated.toLocaleString()}</div>
      </div>
      <div className="bg-gradient-to-br from-emerald-500/10 to-white dark:to-zinc-900 border border-emerald-500/20 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-2 text-zinc-600 dark:text-zinc-400 font-bold text-sm">
          <Building2 className="w-5 h-5 text-emerald-500" /> NGOs Supported
        </div>
        <div className="text-3xl font-black text-zinc-900 dark:text-white">{uniqueNGOs}</div>
      </div>
      <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-500/10 to-white dark:to-zinc-900 border border-blue-500/20 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-2 text-zinc-600 dark:text-zinc-400 font-bold text-sm">
          <Users className="w-5 h-5 text-blue-500" /> Direct Helps
        </div>
        <div className="text-3xl font-black text-zinc-900 dark:text-white">{directHelps}</div>
      </div>
    </div>
  )

  const DirectSponsorship = () => {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" /> Direct Seeker Sponsorship
          </h2>
          <span className="text-xs font-bold bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 px-3 py-1 rounded-full">Urgent</span>
        </div>
        
        {requests && requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => (
              <div key={req.id} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">{req.seeker?.full_name}</h3>
                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${req.urgency === 'High' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/50'}`}>
                      {req.urgency}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">{req.title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">{req.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                  <div className="font-black text-lg">₹{req.amount_needed?.toLocaleString()}</div>
                  <button 
                    onClick={() => setSelectedSeeker(req)}
                    className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform"
                  >
                    Contact Seeker
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-500 font-bold bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
            No urgent requests at the moment.
          </div>
        )}
      </div>
    )
  }

  const DonationLedger = () => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col h-full">
      <h2 className="text-xl font-black flex items-center gap-2 mb-6">
        <Receipt className="w-5 h-5 text-zinc-700 dark:text-zinc-300" /> Donation Ledger & Receipts
      </h2>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <th className="pb-3 font-bold uppercase tracking-wider text-xs">Date</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-xs">Recipient</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-xs">Amount</th>
              <th className="pb-3 font-bold uppercase tracking-wider text-xs text-right">80G Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {ledger && ledger.length > 0 ? (
              ledger.map(tx => (
                <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 font-medium text-zinc-600 dark:text-zinc-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="py-4 font-bold">{tx.recipient?.full_name || 'Unknown'}</td>
                  <td className="py-4 font-black">₹{tx.amount.toLocaleString()}</td>
                  <td className="py-4 text-right">
                    <button className="inline-flex items-center gap-1 text-[#e8b6d8] dark:text-[#f3d0e7] hover:text-pink-600 font-bold bg-[#e8b6d8]/10 px-3 py-1.5 rounded-lg transition-colors">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-zinc-500 font-medium">No donations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const DesktopLayout = () => (
    <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          Donor Dashboard
        </h1>
        <p className="text-zinc-500 mt-1 font-medium">Track your impact and sponsor directly.</p>
      </div>

      <ImpactDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <DirectSponsorship />
          <div className="flex-1 min-h-[300px]">
            <DonationLedger />
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-[400px]">
             {leaders && <LeaderboardWidget leaders={leaders} />}
          </div>
        </div>
      </div>
    </div>
  )

  const MobileLayout = () => (
    <div className="p-4 space-y-6 pb-28">
      <div className="mb-4">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-[#e8b6d8] to-pink-500 bg-clip-text text-transparent">
          My Impact
        </h1>
        <p className="text-zinc-500 font-bold text-sm">Dashboard Overview</p>
      </div>

      <ImpactDashboard />
      <DirectSponsorship />
      
      <div className="h-[400px] mb-6 relative">
         {leaders && <LeaderboardWidget leaders={leaders} />}
      </div>

      <DonationLedger />
    </div>
  )

  const SeekerPopup = () => {
    if (!selectedSeeker) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
            <h2 className="text-xl font-black flex items-center gap-2">
              <UserCircle className="w-6 h-6 text-zinc-700 dark:text-zinc-300" /> 
              Seeker Details
            </h2>
            <button onClick={() => setSelectedSeeker(null)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                {selectedSeeker.seeker?.avatar_url ? (
                  <img src={selectedSeeker.seeker.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <UserCircle className="w-full h-full text-zinc-400 p-2" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-black flex flex-wrap items-center gap-2">
                  {selectedSeeker.seeker?.full_name || 'Unknown Seeker'}
                  {(() => {
                    const status = selectedSeeker.seeker?.verification_status
                    if (status === 'verified') return <span title="Verified Seeker" className="bg-emerald-100 text-emerald-600 text-[10px] uppercase font-black px-2 py-0.5 rounded-full shrink-0">Verified</span>
                    if (status === 'pending') return <span title="Verification Pending" className="bg-amber-100 text-amber-600 text-[10px] uppercase font-black px-2 py-0.5 rounded-full shrink-0">Pending Verification</span>
                    return <span title="Unverified Seeker" className="bg-zinc-100 text-zinc-500 text-[10px] uppercase font-black px-2 py-0.5 rounded-full shrink-0">Unverified</span>
                  })()}
                </h3>
                <p className="text-rose-500 font-bold mt-1">{selectedSeeker.title}</p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">{selectedSeeker.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Contact Phone</p>
                <p className="font-bold text-lg text-zinc-900 dark:text-white">{selectedSeeker.seeker?.phone || 'Not provided'}</p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Required Amount</p>
                <p className="font-black text-xl text-zinc-900 dark:text-white">₹{selectedSeeker.amount_needed?.toLocaleString()}</p>
              </div>

              <div className="sm:col-span-2 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Location</p>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${selectedSeeker.urgency === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    {selectedSeeker.urgency} Urgency
                  </span>
                </div>
                <p className="font-bold text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{selectedSeeker.seeker?.area_name || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700 flex gap-3">
              <button 
                onClick={() => {
                  if (selectedSeeker.seeker?.phone) {
                    window.open(`tel:${selectedSeeker.seeker.phone}`, '_self');
                  } else {
                    alert('No phone number available.');
                  }
                }}
                className="w-1/3 py-4 flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl transition-all"
              >
                <Phone className="w-5 h-5" />
                <span>Call</span>
              </button>
              <button 
                onClick={() => alert('Direct payment gateway will be integrated here.')}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg transition-all text-lg"
              >
                Sponsor Seeker
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
      <SeekerPopup />
    </>
  )
}
