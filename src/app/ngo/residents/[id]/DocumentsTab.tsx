'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FileText, Download, Upload, Loader2 } from 'lucide-react'

export function DocumentsTab({ residentId }: { residentId: string }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newDoc, setNewDoc] = useState({ document_type: 'Aadhaar', label: '' })
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { data: documents, isLoading } = useQuery({
    queryKey: ['ngo', 'documents', residentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('resident_documents')
        .select('*')
        .eq('resident_id', residentId)
        .order('uploaded_at', { ascending: false })
      return data || []
    }
  })

  const addDocMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("File is required")
      
      setIsUploading(true)
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${residentId}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars') // Reusing avatars bucket as per requirements to avoid RLS issues
          .upload(`documents/${fileName}`, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(`documents/${fileName}`)

        const { error } = await supabase
          .from('resident_documents')
          .insert({
            resident_id: residentId,
            document_type: newDoc.document_type,
            label: newDoc.label,
            file_url: publicUrl
          })
          
        if (error) throw error
      } finally {
        setIsUploading(false)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'documents', residentId] })
      setIsModalOpen(false)
      setNewDoc({ document_type: 'Aadhaar', label: '' })
      setFile(null)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white font-bold rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-white/40 dark:bg-zinc-800/40 rounded-2xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents?.map((doc: any) => (
            <div key={doc.id} className="p-5 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {doc.document_type}
                  </span>
                </div>
                {doc.label && <p className="text-gray-800 dark:text-gray-200 font-medium mb-4">{doc.label}</p>}
                {!doc.label && <p className="text-gray-500 italic mb-4">No label provided</p>}
                <p className="text-xs text-gray-500">Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors text-sm border border-gray-200 dark:border-zinc-700"
                >
                  <Download className="w-4 h-4" /> View / Download
                </a>
              </div>
            </div>
          ))}
          {documents?.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white/40 dark:bg-zinc-900/40 rounded-2xl border border-gray-200 dark:border-zinc-800 border-dashed">
              <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">No documents uploaded yet.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-black mb-6 dark:text-white">Upload Document</h2>
            <div className="space-y-4">
              <select 
                value={newDoc.document_type} 
                onChange={e => setNewDoc({...newDoc, document_type: e.target.value})} 
                className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white"
              >
                <option>Aadhaar</option>
                <option>Pension Papers</option>
                <option>Medical Report</option>
                <option>Disability Certificate</option>
                <option>Other</option>
              </select>
              <input 
                type="text" 
                placeholder="Optional Label (e.g. Updated Jan 2026)" 
                value={newDoc.label} 
                onChange={e => setNewDoc({...newDoc, label: e.target.value})} 
                className="w-full p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white dark:text-white" 
              />
              
              <div className="border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <input 
                  type="file" 
                  id="doc-upload" 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0])
                    }
                  }}
                />
                <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {file ? file.name : 'Click to select file (PDF or Image)'}
                  </span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold dark:text-white">Cancel</button>
              <button 
                onClick={() => addDocMutation.mutate()} 
                className="flex-1 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white rounded-xl font-bold flex items-center justify-center gap-2" 
                disabled={addDocMutation.isPending || isUploading || !file}
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
