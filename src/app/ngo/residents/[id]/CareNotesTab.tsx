'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, StickyNote } from 'lucide-react'

export function CareNotesTab({ residentId }: { residentId: string }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newNote, setNewNote] = useState({ category: 'General', note_text: '' })

  const { data: notes, isLoading } = useQuery({
    queryKey: ['ngo', 'care_notes', residentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('resident_care_notes')
        .select(`
          *,
          profiles:logged_by (
            full_name
          )
        `)
        .eq('resident_id', residentId)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('resident_care_notes')
        .insert({
          resident_id: residentId,
          category: newNote.category,
          note_text: newNote.note_text,
          logged_by: user!.id
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'care_notes', residentId] })
      setIsModalOpen(false)
      setNewNote({ category: 'General', note_text: '' })
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Care Notes</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white font-bold rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-white/40 dark:bg-zinc-800/40 rounded-2xl"></div>
          <div className="h-24 bg-white/40 dark:bg-zinc-800/40 rounded-2xl"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {notes?.map((note: any) => (
            <div key={note.id} className="p-5 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {note.category}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {new Date(note.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.note_text}</p>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-500">
                Logged by {note.profiles?.full_name || 'Staff'}
              </div>
            </div>
          ))}
          {notes?.length === 0 && (
            <div className="text-center py-12 bg-white/40 dark:bg-zinc-900/40 rounded-2xl border border-gray-200 dark:border-zinc-800 border-dashed">
              <StickyNote className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">No care notes added yet.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-black mb-6 dark:text-white">Add Care Note</h2>
            <div className="space-y-4">
              <select 
                value={newNote.category} 
                onChange={e => setNewNote({...newNote, category: e.target.value})} 
                className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white"
              >
                <option>General</option>
                <option>Mood</option>
                <option>Health Observation</option>
                <option>Incident</option>
              </select>
              <textarea 
                placeholder="Enter care note details..." 
                value={newNote.note_text} 
                onChange={e => setNewNote({...newNote, note_text: e.target.value})} 
                className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl min-h-[120px] resize-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white" 
              />
            </div>
            <div className="mt-6 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold dark:text-white">Cancel</button>
              <button onClick={() => addNoteMutation.mutate()} className="flex-1 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white rounded-xl font-bold" disabled={addNoteMutation.isPending || !newNote.note_text}>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
