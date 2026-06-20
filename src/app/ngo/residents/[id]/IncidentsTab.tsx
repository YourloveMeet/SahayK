'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, AlertTriangle } from 'lucide-react'

export function IncidentsTab({ residentId }: { residentId: string }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newIncident, setNewIncident] = useState({
    incident_type: 'Fall',
    description: '',
    incident_datetime: new Date().toISOString().slice(0, 16),
    action_taken: '',
    severity: 'Minor'
  })

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['ngo', 'incidents', residentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('resident_incidents')
        .select(`
          *,
          profiles:logged_by (
            full_name
          )
        `)
        .eq('resident_id', residentId)
        .order('incident_datetime', { ascending: false })
      return data || []
    }
  })

  const addIncidentMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('resident_incidents')
        .insert({
          resident_id: residentId,
          incident_type: newIncident.incident_type,
          description: newIncident.description,
          incident_datetime: new Date(newIncident.incident_datetime).toISOString(),
          action_taken: newIncident.action_taken,
          severity: newIncident.severity,
          logged_by: user!.id
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'incidents', residentId] })
      setIsModalOpen(false)
      setNewIncident({
        incident_type: 'Fall',
        description: '',
        incident_datetime: new Date().toISOString().slice(0, 16),
        action_taken: '',
        severity: 'Minor'
      })
    }
  })

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Severe': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'Moderate': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'Minor': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Incidents</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white font-bold rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Log Incident
        </button>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-white/40 dark:bg-zinc-800/40 rounded-2xl"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents?.map((incident: any) => (
            <div key={incident.id} className="p-5 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {incident.incident_type}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {new Date(incident.incident_datetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-gray-800 dark:text-gray-200">{incident.description}</p>
                </div>
                {incident.action_taken && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Action Taken</h4>
                    <p className="text-gray-800 dark:text-gray-200">{incident.action_taken}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-500">
                Logged by {incident.profiles?.full_name || 'Staff'}
              </div>
            </div>
          ))}
          {incidents?.length === 0 && (
            <div className="text-center py-12 bg-white/40 dark:bg-zinc-900/40 rounded-2xl border border-gray-200 dark:border-zinc-800 border-dashed">
              <AlertTriangle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">No incidents logged yet.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-in fade-in zoom-in-95 my-8">
            <h2 className="text-2xl font-black mb-6 dark:text-white">Log Incident</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Incident Type *</label>
                  <select 
                    value={newIncident.incident_type} 
                    onChange={e => setNewIncident({...newIncident, incident_type: e.target.value})} 
                    className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white"
                  >
                    <option>Fall</option>
                    <option>Hospital Visit</option>
                    <option>Medical Emergency</option>
                    <option>Behavioral</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Severity *</label>
                  <select 
                    value={newIncident.severity} 
                    onChange={e => setNewIncident({...newIncident, severity: e.target.value})} 
                    className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white"
                  >
                    <option>Minor</option>
                    <option>Moderate</option>
                    <option>Severe</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Date & Time *</label>
                <input 
                  type="datetime-local" 
                  value={newIncident.incident_datetime} 
                  onChange={e => setNewIncident({...newIncident, incident_datetime: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Description *</label>
                <textarea 
                  placeholder="Describe what happened..." 
                  value={newIncident.description} 
                  onChange={e => setNewIncident({...newIncident, description: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl min-h-[100px] resize-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Action Taken</label>
                <textarea 
                  placeholder="Optional details on how it was handled..." 
                  value={newIncident.action_taken} 
                  onChange={e => setNewIncident({...newIncident, action_taken: e.target.value})} 
                  className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl min-h-[80px] resize-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white" 
                />
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold dark:text-white">Cancel</button>
              <button 
                onClick={() => addIncidentMutation.mutate()} 
                className="flex-1 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white rounded-xl font-bold" 
                disabled={addIncidentMutation.isPending || !newIncident.description || !newIncident.incident_datetime}
              >
                Save Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
