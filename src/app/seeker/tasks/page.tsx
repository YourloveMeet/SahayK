'use client'

import React from 'react'
import { ListTodo, Clock, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TaskCard } from '@/components/volunteer/TaskCard'

export default function SeekerTasksPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // 1. Get current user
  const { data: userProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      return data
    }
  })

  // 2. Fetch Active Tasks (Open or Accepted)
  const { data: activeTasks, isLoading: isLoadingActive } = useQuery({
    queryKey: ['seeker', 'tasks', 'active', userProfile?.id],
    enabled: !!userProfile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`*, profiles!tasks_volunteer_id_fkey(full_name, avatar_url, phone)`)
        .eq('seeker_id', userProfile!.id)
        .in('status', ['open', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  // 3. Fetch Past Tasks (Completed)
  const { data: pastTasks, isLoading: isLoadingPast } = useQuery({
    queryKey: ['seeker', 'tasks', 'past', userProfile?.id],
    enabled: !!userProfile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`*, profiles!tasks_volunteer_id_fkey(full_name, avatar_url, phone)`)
        .eq('seeker_id', userProfile!.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  // 4. Handle Seeker Confirmation
  const confirmMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          task_status_detail: 'completed'
        })
        .eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'tasks'] })
    }
  })

  const handleConfirm = (task: any) => {
    confirmMutation.mutate(task.id)
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 relative">
      {/* Background Orbs */}
      <div className="fixed top-20 left-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 md:p-8 rounded-[1rem] shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-zinc-800 relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <ListTodo className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          My Requests
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">Track your active help requests and view your request history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 min-h-[500px]">
        {/* Active Requests */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
             <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
               Active Requests
             </h2>
          </div>
          <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
            {isLoadingActive ? (
              <div className="animate-pulse space-y-4">
                <div className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            ) : activeTasks && activeTasks.length > 0 ? (
              activeTasks.map(task => (
                <div key={task.id} className="relative">
                  {confirmMutation.isPending && confirmMutation.variables === task.id && (
                    <div className="absolute inset-0 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                       <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <TaskCard 
                    task={task as any} 
                    isSeekerView={true}
                    onSeekerConfirm={handleConfirm}
                  />
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full flex items-center justify-center shadow-inner">
                   <Clock className="w-10 h-10 text-blue-500" />
                </div>
                <p className="text-gray-500 font-medium max-w-sm">
                  You don't have any active requests waiting for a volunteer. Head to the Dashboard to request a service.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Completed History */}
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
             <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
               Past Requests
             </h2>
          </div>
          <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
            {isLoadingPast ? (
              <div className="animate-pulse space-y-4">
                <div className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            ) : pastTasks && pastTasks.length > 0 ? (
              pastTasks.map(task => (
                <TaskCard key={task.id} task={task as any} />
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner">
                   <CheckCircle className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium max-w-sm">
                  Your completed service requests will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
