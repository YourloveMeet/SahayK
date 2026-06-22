'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BriefcaseMedical, Plus, Users, CalendarDays, MoreVertical, Search, Phone, UserCircle, MapPin } from 'lucide-react'

export default function CaretakersPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCaretaker, setNewCaretaker] = useState({
    name: '',
    phone: '',
    role: 'Nurse',
    status: 'Active'
  })

  // 1. Get NGO Profile ID
  const { data: ngoProfile } = useQuery({
    queryKey: ['ngoProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      const { data } = await supabase
        .from('ngo_profiles')
        .select('id, ngo_name')
        .eq('user_id', user.id)
        .single()
      return data
    }
  })

  // 2. Get Caretakers
  const { data: caretakers, isLoading } = useQuery({
    queryKey: ['ngo', 'caretakers', ngoProfile?.id],
    enabled: !!ngoProfile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_caretakers')
        .select('*')
        .eq('ngo_id', ngoProfile!.id)
        .order('name', { ascending: true })
      return data || []
    }
  })

  // Add Mutation
  const addCaretakerMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('ngo_caretakers').insert({
        ngo_id: ngoProfile!.id,
        name: newCaretaker.name,
        phone: newCaretaker.phone,
        role: newCaretaker.role,
        status: newCaretaker.status
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'caretakers'] })
      setIsModalOpen(false)
      setNewCaretaker({ name: '', phone: '', role: 'Nurse', status: 'Active' })
    }
  })

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const deleteCaretakerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ngo_caretakers').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'caretakers'] })
      setActiveMenuId(null)
    }
  })

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 bg-zinc-50 dark:bg-[#09090b] min-h-screen text-zinc-900 dark:text-zinc-50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <BriefcaseMedical className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
            Caretakers & Staff
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Manage your nursing and support staff.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" /> Add Staff
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Staff</p>
            <p className="text-3xl font-black">{caretakers?.length || 0}</p>
          </div>
        </div>
        
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Today</p>
            <p className="text-3xl font-black">{caretakers?.filter(c => c.status === 'Active').length || 0}</p>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Staff Directory</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search staff..." 
              className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : caretakers?.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <UserCircle className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No staff added yet</h3>
            <p className="text-zinc-500 mt-1">Start by adding your first caretaker.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caretakers?.map(staff => (
              <div key={staff.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start mb-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-black text-lg text-zinc-700 dark:text-zinc-300 uppercase">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{staff.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
                        {staff.role}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.preventDefault(); setActiveMenuId(activeMenuId === staff.id ? null : staff.id); }}
                      className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeMenuId === staff.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this caretaker?')) {
                                deleteCaretakerMutation.mutate(staff.id)
                              }
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-colors"
                          >
                            Delete Staff
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  {staff.phone && (
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      <Phone className="w-4 h-4 text-zinc-400" /> {staff.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    <div className={`w-2 h-2 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    {staff.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#111] rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Add Staff Member</h2>
                <p className="text-sm text-zinc-500 mt-1">Register a new caretaker in the system.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Jane Doe" 
                    value={newCaretaker.name} 
                    onChange={e => setNewCaretaker({...newCaretaker, name: e.target.value})} 
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. +91 98765 43210" 
                    value={newCaretaker.phone} 
                    onChange={e => setNewCaretaker({...newCaretaker, phone: e.target.value})} 
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Role</label>
                    <select 
                      value={newCaretaker.role} 
                      onChange={e => setNewCaretaker({...newCaretaker, role: e.target.value})} 
                      className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white"
                    >
                      <option>Nurse</option>
                      <option>Helper</option>
                      <option>Cleaner</option>
                      <option>Cook</option>
                      <option>Manager</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Status</label>
                    <select 
                      value={newCaretaker.status} 
                      onChange={e => setNewCaretaker({...newCaretaker, status: e.target.value})} 
                      className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none font-medium dark:text-white"
                    >
                      <option>Active</option>
                      <option>On Leave</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-zinc-50 dark:bg-black/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors dark:text-white">Cancel</button>
              <button 
                onClick={() => addCaretakerMutation.mutate()} 
                disabled={addCaretakerMutation.isPending || !newCaretaker.name}
                className="flex-1 py-3.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
