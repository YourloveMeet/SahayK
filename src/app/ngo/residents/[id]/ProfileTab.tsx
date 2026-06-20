'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, ShieldAlert } from 'lucide-react'

export function ProfileTab({ resident }: { resident: any }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    assigned_caretaker: resident.assigned_caretaker || '',
    status: resident.status || 'active',
    status_date: resident.status_date || new Date().toISOString().split('T')[0],
    status_note: resident.status_note || ''
  })

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('ngo_residents')
        .update({
          assigned_caretaker: editForm.assigned_caretaker,
          status: editForm.status,
          status_date: editForm.status === 'active' ? null : editForm.status_date,
          status_note: editForm.status === 'active' ? null : editForm.status_note,
        })
        .eq('id', resident.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'resident', resident.id] })
      setIsEditModalOpen(false)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resident Profile</h2>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white font-bold rounded-xl transition-all flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4" /> Edit Status & Caretaker
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2">Basic Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Full Name</p>
              <p className="font-medium dark:text-white">{resident.full_name}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Age</p>
              <p className="font-medium dark:text-white">{resident.age || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Gender</p>
              <p className="font-medium dark:text-white">{resident.gender}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Mobility</p>
              <p className="font-medium dark:text-white">{resident.mobility_status}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2">Care Details</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Assigned Caretaker</p>
              <p className="font-medium dark:text-white">{resident.assigned_caretaker || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Current Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded font-bold text-xs uppercase tracking-wider ${resident.status === 'active' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {resident.status || 'Active'}
                </span>
                {resident.status_date && resident.status !== 'active' && (
                  <span className="text-gray-500 text-xs">since {new Date(resident.status_date).toLocaleDateString()}</span>
                )}
              </div>
              {resident.status_note && resident.status !== 'active' && (
                <p className="text-gray-500 mt-2 italic">Note: {resident.status_note}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2">Emergency Contact & Medical</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Contact Name</p>
            <p className="font-medium dark:text-white">{resident.emergency_contact_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Contact Phone</p>
            <p className="font-medium dark:text-white">{resident.emergency_contact_phone || 'N/A'}</p>
          </div>
          <div className="col-span-full">
            <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Medical Notes</p>
            <p className="font-medium dark:text-white bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl mt-1">{resident.medical_notes || 'None provided.'}</p>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-black mb-6 dark:text-white">Edit Care Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Assigned Caretaker</label>
                <input 
                  type="text" 
                  placeholder="e.g. Nurse Sarah" 
                  value={editForm.assigned_caretaker} 
                  onChange={e => setEditForm({...editForm, assigned_caretaker: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Resident Status</label>
                <select 
                  value={editForm.status} 
                  onChange={e => setEditForm({...editForm, status: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="discharged">Discharged</option>
                  <option value="transferred">Transferred</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>

              {editForm.status !== 'active' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl flex gap-2 items-start text-yellow-800 dark:text-yellow-400 text-sm">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <p>Marking this resident as inactive will remove them from the default views and dashboard counts. You can still access their record.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Status Change Date</label>
                    <input 
                      type="date" 
                      value={editForm.status_date} 
                      onChange={e => setEditForm({...editForm, status_date: e.target.value})} 
                      className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Notes / Reason</label>
                    <input 
                      type="text" 
                      placeholder="Optional notes" 
                      value={editForm.status_note} 
                      onChange={e => setEditForm({...editForm, status_note: e.target.value})} 
                      className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-4">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold dark:text-white">Cancel</button>
              <button 
                onClick={() => updateProfileMutation.mutate()} 
                className="flex-1 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white rounded-xl font-bold" 
                disabled={updateProfileMutation.isPending}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
