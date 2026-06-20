'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, User, Search, MapPin, Activity } from 'lucide-react'
import Link from 'next/link'

export default function NGOResidents() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newResident, setNewResident] = useState({
    full_name: '',
    age: '',
    gender: 'Male',
    medical_notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    mobility_status: 'Independent',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const { data: userProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      return user
    }
  })

  // Get NGO Profile
  const { data: ngoProfile } = useQuery({
    queryKey: ['ngoProfile', userProfile?.id],
    enabled: !!userProfile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_profiles')
        .select('id')
        .eq('user_id', userProfile!.id)
        .single()
      return data || null
    }
  })

  // Get Residents
  const { data: residents, isLoading } = useQuery({
    queryKey: ['ngo', 'residents', ngoProfile?.id],
    enabled: !!ngoProfile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_residents')
        .select('*')
        .eq('ngo_id', ngoProfile!.id)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const addResidentMutation = useMutation({
    mutationFn: async () => {
      if (!ngoProfile?.id) return
      const { error } = await supabase
        .from('ngo_residents')
        .insert({
          ngo_id: ngoProfile.id,
          full_name: newResident.full_name,
          age: parseInt(newResident.age) || null,
          gender: newResident.gender,
          medical_notes: newResident.medical_notes,
          emergency_contact_name: newResident.emergency_contact_name,
          emergency_contact_phone: newResident.emergency_contact_phone,
          mobility_status: newResident.mobility_status,
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'residents'] })
      setIsAddModalOpen(false)
      setNewResident({
        full_name: '',
        age: '',
        gender: 'Male',
        medical_notes: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        mobility_status: 'Independent',
      })
    }
  })

  const filteredResidents = residents?.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    const isActive = r.status === 'active' || !r.status
    const matchesStatus = showInactive ? true : isActive
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative">
      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 md:p-8 rounded-[1rem] shadow-sm border border-gray-200 dark:border-zinc-800 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Manage Residents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">Keep track of their details, medicines, and reminders.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add Resident
        </button>
      </div>

      <div className="relative z-10 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search residents by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-shadow text-gray-900 dark:text-white font-medium"
          />
        </div>
        <button
          onClick={() => setShowInactive(!showInactive)}
          className={`px-4 py-3 rounded-xl border font-bold text-sm transition-colors ${showInactive ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent' : 'bg-white/60 dark:bg-black/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-800'}`}
        >
          {showInactive ? 'Hide Inactive' : 'Show Inactive'}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white/40 dark:bg-zinc-800/40 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredResidents?.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800">
              <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">No residents found</p>
              <p className="text-gray-500 mt-1">Try adjusting your search or add a new resident.</p>
            </div>
          ) : (
            filteredResidents?.map(resident => (
              <Link 
                href={`/ngo/residents/${resident.id}`}
                key={resident.id}
                className="group p-6 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800">
                    {resident.photo_url ? (
                      <img src={resident.photo_url} alt={resident.full_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-zinc-900 dark:text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">{resident.full_name}</h3>
                      {resident.status && resident.status !== 'active' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-sm">
                          {resident.status}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{resident.age ? `${resident.age} yrs` : 'Age unknown'} • {resident.gender}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Activity className="w-4 h-4 shrink-0 text-gray-400" />
                    <span className="truncate">{resident.mobility_status || 'Mobility unknown'}</span>
                  </div>
                  {resident.medical_notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                      {resident.medical_notes}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Add Resident</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                <input 
                  type="text" 
                  value={newResident.full_name}
                  onChange={e => setNewResident({...newResident, full_name: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Age</label>
                  <input 
                    type="number" 
                    value={newResident.age}
                    onChange={e => setNewResident({...newResident, age: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Gender</label>
                  <select 
                    value={newResident.gender}
                    onChange={e => setNewResident({...newResident, gender: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Mobility Status</label>
                <select 
                  value={newResident.mobility_status}
                  onChange={e => setNewResident({...newResident, mobility_status: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium appearance-none"
                >
                  <option>Independent</option>
                  <option>Uses Cane/Walker</option>
                  <option>Wheelchair Bound</option>
                  <option>Bedridden</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Medical Notes</label>
                <textarea 
                  value={newResident.medical_notes}
                  onChange={e => setNewResident({...newResident, medical_notes: e.target.value})}
                  rows={3}
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium resize-none"
                />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl space-y-4 border border-gray-100 dark:border-zinc-800">
                <h4 className="font-bold text-gray-900 dark:text-white">Emergency Contact</h4>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Name</label>
                  <input 
                    type="text" 
                    value={newResident.emergency_contact_name}
                    onChange={e => setNewResident({...newResident, emergency_contact_name: e.target.value})}
                    className="w-full p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                  <input 
                    type="text" 
                    value={newResident.emergency_contact_phone}
                    onChange={e => setNewResident({...newResident, emergency_contact_phone: e.target.value})}
                    className="w-full p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/20 flex gap-4">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => addResidentMutation.mutate()}
                disabled={addResidentMutation.isPending || !newResident.full_name}
                className="flex-1 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md"
              >
                {addResidentMutation.isPending ? 'Saving...' : 'Save Resident'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
