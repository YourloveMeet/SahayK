'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Power, FileText, Settings, HeartHandshake } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminSchemesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Government',
    description: '',
    apply_link: '',
    eligibility_min_age: '',
    eligibility_max_income: '',
  })
  
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: schemes, isLoading } = useQuery({
    queryKey: ['adminSchemes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schemes').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase.from('schemes').update({ is_active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminSchemes'] })
  })

  const createSchemeMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('schemes').insert({
        name: data.name,
        category: data.category,
        description: data.description,
        apply_link: data.apply_link || null,
        eligibility_min_age: data.eligibility_min_age ? parseInt(data.eligibility_min_age) : null,
        eligibility_max_income: data.eligibility_max_income ? parseInt(data.eligibility_max_income) : null,
        is_active: true
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchemes'] })
      setIsModalOpen(false)
      setFormData({ name: '', category: 'Government', description: '', apply_link: '', eligibility_min_age: '', eligibility_max_income: '' })
    }
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.description) return alert('Name and Description are required')
    createSchemeMutation.mutate(formData)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] p-6 rounded-2xl shadow-sm border border-zinc-800">
        <div>
          <h1 className="text-3xl font-black text-white">Schemes Manager</h1>
          <p className="text-zinc-500 font-medium">Manage and monitor active support schemes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-5 h-5" /> Add New Scheme
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-20 flex justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : schemes?.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-zinc-800 p-12 rounded-2xl text-center">
            <HeartHandshake className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">No Schemes Found</h3>
            <p className="text-zinc-500 mt-2">Click "Add New Scheme" to create one.</p>
          </div>
        ) : (
          schemes?.map(scheme => (
            <div key={scheme.id} className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:bg-zinc-900/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-black text-white">{scheme.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded ${scheme.is_active ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                    {scheme.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-blue-900/30 text-blue-400">
                    {scheme.category}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed line-clamp-2">{scheme.description}</p>
                <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-500">
                  {scheme.eligibility_min_age && <span className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">Min Age: {scheme.eligibility_min_age}+</span>}
                  {scheme.eligibility_max_income && <span className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">Max Income: ₹{scheme.eligibility_max_income}</span>}
                  {scheme.apply_link && (
                    <a href={scheme.apply_link} target="_blank" rel="noreferrer" className="bg-zinc-900 hover:bg-zinc-800 text-blue-400 px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors">
                      Official Link
                    </a>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex items-center md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
                <button 
                  onClick={() => toggleStatusMutation.mutate({ id: scheme.id, is_active: !scheme.is_active })}
                  disabled={toggleStatusMutation.isPending}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-colors border ${scheme.is_active ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 border-red-900/50' : 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 border-emerald-900/50'}`}
                >
                  <Power className="w-5 h-5" /> {scheme.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8 w-full max-w-xl shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-zinc-900 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-white mb-6">Create New Scheme</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Scheme Name *</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="E.g., PM Jan Arogya Yojana" className="bg-[#111] border-zinc-800 text-white h-12" required />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Category</Label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#111] border border-zinc-800 text-white h-12 rounded-md px-3 focus:outline-none focus:border-blue-500">
                  <option>Government</option>
                  <option>NGO</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Description *</Label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What does this scheme provide?" className="w-full bg-[#111] border border-zinc-800 text-white min-h-[100px] p-3 rounded-md focus:outline-none focus:border-blue-500 resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Min Age Req.</Label>
                  <Input type="number" value={formData.eligibility_min_age} onChange={e => setFormData({...formData, eligibility_min_age: e.target.value})} placeholder="E.g., 60" className="bg-[#111] border-zinc-800 text-white h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Max Income Req.</Label>
                  <Input type="number" value={formData.eligibility_max_income} onChange={e => setFormData({...formData, eligibility_max_income: e.target.value})} placeholder="E.g., 500000" className="bg-[#111] border-zinc-800 text-white h-12" />
                </div>
              </div>
              <div className="space-y-2 pb-4">
                <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Official Apply Link</Label>
                <Input type="url" value={formData.apply_link} onChange={e => setFormData({...formData, apply_link: e.target.value})} placeholder="https://..." className="bg-[#111] border-zinc-800 text-white h-12" />
              </div>
              <button type="submit" disabled={createSchemeMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-xl transition-colors">
                {createSchemeMutation.isPending ? 'Creating...' : 'Launch Scheme'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
