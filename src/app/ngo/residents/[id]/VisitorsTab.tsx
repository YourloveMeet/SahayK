'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users } from 'lucide-react'

export function VisitorsTab({ residentId }: { residentId: string }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newVisitor, setNewVisitor] = useState({
    visitor_name: '',
    relationship: '',
    visit_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const { data: visitors, isLoading } = useQuery({
    queryKey: ['ngo', 'visitors', residentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('resident_visitor_log')
        .select(`
          *,
          profiles:logged_by (
            full_name
          )
        `)
        .eq('resident_id', residentId)
        .order('visit_date', { ascending: false })
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const addVisitorMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('resident_visitor_log')
        .insert({
          resident_id: residentId,
          visitor_name: newVisitor.visitor_name,
          relationship: newVisitor.relationship,
          visit_date: newVisitor.visit_date,
          notes: newVisitor.notes,
          logged_by: user!.id
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'visitors', residentId] })
      setIsModalOpen(false)
      setNewVisitor({
        visitor_name: '',
        relationship: '',
        visit_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visitor Log</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white font-bold rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Log Visit
        </button>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-white/40 dark:bg-zinc-800/40 rounded-2xl"></div>
          <div className="h-24 bg-white/40 dark:bg-zinc-800/40 rounded-2xl"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {visitors?.map((visit: any) => (
            <div key={visit.id} className="p-5 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {visit.visitor_name} <span className="text-sm font-normal text-gray-500">({visit.relationship})</span>
                </h3>
                {visit.notes && <p className="text-gray-800 dark:text-gray-200 mt-2">{visit.notes}</p>}
                <div className="mt-3 text-xs text-gray-500">
                  Logged by {visit.profiles?.full_name || 'Staff'}
                </div>
              </div>
              <div className="shrink-0 text-sm font-bold text-gray-500 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
                {new Date(visit.visit_date).toLocaleDateString()}
              </div>
            </div>
          ))}
          {visitors?.length === 0 && (
            <div className="text-center py-12 bg-white/40 dark:bg-zinc-900/40 rounded-2xl border border-gray-200 dark:border-zinc-800 border-dashed">
              <Users className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">No visits logged yet.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-black mb-6 dark:text-white">Log Visit</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Visitor Name *" 
                value={newVisitor.visitor_name} 
                onChange={e => setNewVisitor({...newVisitor, visitor_name: e.target.value})} 
                className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white" 
              />
              <input 
                type="text" 
                placeholder="Relationship (e.g. Son, Friend) *" 
                value={newVisitor.relationship} 
                onChange={e => setNewVisitor({...newVisitor, relationship: e.target.value})} 
                className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white" 
              />
              <input 
                type="date" 
                value={newVisitor.visit_date} 
                onChange={e => setNewVisitor({...newVisitor, visit_date: e.target.value})} 
                className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
              />
              <textarea 
                placeholder="Optional notes (e.g. Brought medicines, discussed discharge)" 
                value={newVisitor.notes} 
                onChange={e => setNewVisitor({...newVisitor, notes: e.target.value})} 
                className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl min-h-[100px] resize-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white" 
              />
            </div>
            <div className="mt-6 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold dark:text-white">Cancel</button>
              <button 
                onClick={() => addVisitorMutation.mutate()} 
                className="flex-1 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white rounded-xl font-bold" 
                disabled={addVisitorMutation.isPending || !newVisitor.visitor_name || !newVisitor.relationship || !newVisitor.visit_date}
              >
                Save Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
