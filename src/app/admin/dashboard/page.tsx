'use client'

import { useState } from 'react'
import { LogoutButton } from '@/components/LogoutButton'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, ShieldCheck, UserCircle, ExternalLink } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications'>('verifications')
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch pending verifications
  const { data: pendingVerifications, isLoading } = useQuery({
    queryKey: ['pendingVerifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('verification_status', 'pending')
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })

  // Mutation to update verification status
  const verifyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'verified' | 'rejected' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingVerifications'] })
    }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] p-6 rounded-2xl shadow-sm border border-zinc-800">
        <div>
          <h1 className="text-3xl font-black text-white">Super Admin</h1>
          <p className="text-zinc-500 font-medium">Manage platform users, verifications, and requests.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="flex gap-2 p-1 bg-[#111] rounded-xl w-full max-w-sm border border-zinc-800/50">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-colors ${activeTab === 'overview' ? 'bg-[#222] shadow-sm text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('verifications')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'verifications' ? 'bg-[#222] shadow-sm text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Verifications
          {pendingVerifications && pendingVerifications.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingVerifications.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="p-8 bg-[#0a0a0a] rounded-2xl shadow-sm border border-zinc-800">
          <h2 className="text-2xl font-bold text-white mb-4">Platform Overview</h2>
          <p className="text-zinc-400">Welcome to the Admin Dashboard. Select the Verifications tab to process pending identity checks.</p>
        </div>
      )}

      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white mb-6">Pending Verifications</h2>
          
          {isLoading ? (
            <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : pendingVerifications?.length === 0 ? (
            <div className="p-12 bg-[#0a0a0a] rounded-2xl shadow-sm border border-zinc-800 text-center">
              <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white">All caught up!</h3>
              <p className="text-zinc-500 mt-2">There are no pending verification requests at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingVerifications?.map(profile => (
                <div key={profile.id} className="bg-[#0a0a0a] p-6 rounded-2xl shadow-sm border border-zinc-800 flex flex-col md:flex-row gap-6">
                  
                  {/* Avatar */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-zinc-900 border-2 border-zinc-700">
                      {profile.avatar_url ? (
                        <a href={profile.avatar_url} target="_blank" rel="noreferrer" className="block w-full h-full group relative">
                          <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-6 h-6 text-white" />
                          </div>
                        </a>
                      ) : (
                        <UserCircle className="w-full h-full text-zinc-600 p-4" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">{profile.role}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-black text-zinc-500 uppercase">Full Name</p>
                      <p className="text-lg font-bold text-white">{profile.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-zinc-500 uppercase">Phone</p>
                      <p className="text-lg font-bold text-white">{profile.phone || 'N/A'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-black text-zinc-500 uppercase">Address / Area</p>
                      <p className="text-lg font-bold text-white">{profile.area_name || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
                    <button 
                      onClick={() => verifyMutation.mutate({ id: profile.id, status: 'verified' })}
                      disabled={verifyMutation.isPending}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 font-bold rounded-xl transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" /> Approve
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to reject this verification?')) {
                          verifyMutation.mutate({ id: profile.id, status: 'rejected' })
                        }
                      }}
                      disabled={verifyMutation.isPending}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-bold rounded-xl transition-colors"
                    >
                      <XCircle className="w-5 h-5" /> Reject
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
