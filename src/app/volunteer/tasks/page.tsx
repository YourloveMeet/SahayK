'use client'

import React, { useState } from 'react'
import { ListTodo, CheckCircle, Upload, X, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TaskCard } from '@/components/volunteer/TaskCard'

export default function VolunteerTasksPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [uploadTaskId, setUploadTaskId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // 1. Get current user profile
  const { data: userProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      return data
    }
  })

  // 2. Fetch Active Assignments
  const { data: activeTasks, isLoading: isLoadingActive } = useQuery({
    queryKey: ['volunteer', 'tasks', 'active', userProfile?.id],
    enabled: !!userProfile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`*, profiles!tasks_seeker_id_fkey(full_name, avatar_url, phone, area_name)`)
        .eq('volunteer_id', userProfile!.id)
        .in('status', ['accepted', 'in_progress'])
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  // 3. Fetch Completed Tasks
  const { data: pastTasks, isLoading: isLoadingPast } = useQuery({
    queryKey: ['volunteer', 'tasks', 'past', userProfile?.id],
    enabled: !!userProfile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`*, profiles!tasks_seeker_id_fkey(full_name, avatar_url, phone, area_name)`)
        .eq('volunteer_id', userProfile!.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  // 4. Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus, proofUrl }: { taskId: string; newStatus: string, proofUrl?: string }) => {
      const updates: any = { task_status_detail: newStatus }
      
      // If it's fully completed (e.g., seeker confirms), we'd set status completed. 
      // But here, volunteer only marks as 'delivered', waiting for seeker.
      if (newStatus === 'delivered') {
        updates.completion_proof_url = proofUrl || 'https://images.unsplash.com/photo-1628102491629-778571d893a3?q=80&w=2000&auto=format&fit=crop' // Mock image
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer', 'tasks'] })
      setUploadTaskId(null)
      setSelectedImage(null)
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadSubmit = () => {
    if (uploadTaskId && selectedImage) {
      updateStatusMutation.mutate({ taskId: uploadTaskId, newStatus: 'delivered', proofUrl: selectedImage })
    }
  }

  const UploadModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative zoom-in-95 animate-in duration-200">
        <button 
          onClick={() => { setUploadTaskId(null); setSelectedImage(null); }} 
          className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <Camera className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-black dark:text-white mb-2">Upload Proof of Delivery</h2>
        <p className="text-zinc-500 text-sm mb-6">Please attach a photo to confirm the task is complete. The seeker will review this to finalize the request.</p>
        
        {!selectedImage ? (
          <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <Upload className="w-10 h-10 text-zinc-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-sm text-zinc-600 dark:text-zinc-300">Click to upload photo</p>
            <p className="text-xs text-zinc-400 mt-1">JPEG, PNG, or WEBP</p>
          </label>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <img src={selectedImage} alt="Preview" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <button 
                 onClick={() => setSelectedImage(null)}
                 className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-colors"
               >
                 Remove Image
               </button>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleUploadSubmit} 
          disabled={updateStatusMutation.isPending || !selectedImage} 
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold h-14 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
        >
          {updateStatusMutation.isPending ? 'Uploading...' : 'Submit Photo'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 relative">
      {/* Background Orbs */}
      <div className="fixed top-20 left-0 w-[500px] h-[500px] bg-gray-300/10 dark:bg-gray-700/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 md:p-8 rounded-[1rem] shadow-xl border border-gray-200 dark:border-zinc-800 relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <ListTodo className="w-8 h-8 text-gray-900 dark:text-white" />
          My Tasks
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">Manage your active assignments and view your volunteering history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 min-h-[500px]">
        {/* Active Tasks */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
             <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
               Active Assignments
             </h2>
          </div>
          <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
            {isLoadingActive ? (
              <div className="animate-pulse space-y-4">
                <div className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            ) : activeTasks && activeTasks.length > 0 ? (
              activeTasks.map(task => (
                <div key={task.id}>
                  <TaskCard 
                    task={task as any} 
                    isActive={true} 
                    onUpdateStatus={(taskId, newStatus) => updateStatusMutation.mutate({ taskId, newStatus })}
                    onCompleteClick={() => setUploadTaskId(task.id)}
                  />
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner">
                   <ListTodo className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium max-w-sm">
                  You don't have any active assignments right now. Head over to the Dashboard to find requests near you.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Completed History */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
             <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
               History
             </h2>
          </div>
          <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
            {isLoadingPast ? (
              <div className="animate-pulse space-y-4">
                <div className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            ) : pastTasks && pastTasks.length > 0 ? (
              pastTasks.map(task => (
                <div key={task.id}>
                  <TaskCard 
                    task={task as any} 
                    isActive={false} 
                  />
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner">
                   <CheckCircle className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium max-w-sm">
                  Your completed tasks will appear here. Build your reputation and earn badges by completing requests!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proof Upload Modal */}
      {uploadTaskId && <UploadModal />}
    </div>
  )
}
