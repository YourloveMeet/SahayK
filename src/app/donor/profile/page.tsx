'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  UserCircle, CheckCircle, Heart, TrendingUp, Download, 
  Receipt, Users, Building2, Wallet, Star, ChevronRight, Activity, X
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { LogoutButton } from '@/components/LogoutButton'
import { LeaderboardWidget } from '@/components/volunteer/LeaderboardWidget'

// Constants
const MOCK_CAUSES = ['Education', 'Healthcare', 'Elderly Care', 'Animal Welfare', 'Disaster Relief']

export default function DonorProfilePage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [selectedSeeker, setSelectedSeeker] = useState<any | null>(null)
  const [localCauses, setLocalCauses] = useState<string[]>([])

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['donorProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      return { ...data, email: user.email }
    }
  })

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
        .select('*, seeker:profiles!seeker_financial_requests_seeker_id_fkey(full_name, phone, area_name)')
        .eq('status', 'Open')
        .order('created_at', { ascending: false })
      return data || []
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

  const isLoading = isProfileLoading || isLedgerLoading || isRequestsLoading
  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" /></div>

  const totalDonated = ledger?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
  const uniqueNGOs = new Set(ledger?.map(tx => tx.recipient_id)).size;
  const directHelps = ledger?.filter(tx => tx.cause !== 'NGO Donation').length || 0;

  // Module Components
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

  const ProfileSettings = () => (
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
  )


  const DesktopLayout = () => (
    <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          Donor Dashboard
        </h1>
        <p className="text-zinc-500 mt-1 font-medium">Track your impact, sponsor directly, and manage preferences.</p>
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
          <ProfileSettings />
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
        <p className="text-zinc-500 font-bold text-sm">Dashboard & Settings</p>
      </div>

      <ImpactDashboard />
      <DirectSponsorship />
      
      <div className="h-[400px] mb-6 relative">
         {leaders && <LeaderboardWidget leaders={leaders} />}
      </div>

      <DonationLedger />
      <ProfileSettings />

      <div className="pt-6">
         <LogoutButton />
      </div>
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
            <div>
              <h3 className="text-2xl font-black mb-1">{selectedSeeker.name}</h3>
              <p className="text-rose-500 font-bold">{selectedSeeker.need}</p>
            </div>
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Contact Phone</p>
                <p className="font-bold text-lg">{selectedSeeker.phone}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Address</p>
                <p className="font-bold">{selectedSeeker.address}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Required Amount</p>
                <p className="font-black text-xl">{selectedSeeker.amountNeeded}</p>
              </div>
            </div>
            <div className="pt-2">
              <button 
                onClick={() => alert('Direct payment gateway will be integrated here.')}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg transition-all"
              >
                Proceed to Sponsor
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
