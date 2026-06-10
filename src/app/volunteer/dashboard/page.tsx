'use client'

import { LogoutButton } from '@/components/LogoutButton'
import DynamicTaskMap from '@/components/map/DynamicTaskMap'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { Database } from '@/types/database.types'
import { TASK_CATEGORIES } from '@/lib/constants'

type Task = Database['public']['Tables']['tasks']['Row'] & { profiles: { full_name: string } | null }

export default function VolunteerDashboard() {
  const supabase = createClient()

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', 'open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles!tasks_seeker_id_fkey(full_name)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as unknown as Task[]
    }
  })

  const getCategoryLabel = (val: string) => {
    return TASK_CATEGORIES.find(c => c.value === val)?.label || val
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4 md:p-10 relative">
      <div className="absolute top-20 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 p-8 rounded-[2rem] shadow-xl border border-white/60 dark:border-white/10 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-200 dark:to-indigo-500 tracking-tight">Volunteer Mission Control</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">Browse open requests nearby. Every accepted task earns you Help Score points.</p>
        </div>
        <LogoutButton />
      </div>
      
      {isLoading ? (
        <div className="h-[600px] w-full bg-white/40 dark:bg-zinc-800/40 backdrop-blur-xl animate-pulse rounded-[2.5rem] border border-white/40 dark:border-zinc-700/50 shadow-2xl relative z-10"></div>
      ) : error ? (
        <div className="p-8 backdrop-blur-md bg-rose-50/80 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-[2rem] font-bold border border-rose-200 dark:border-rose-800/50 shadow-xl relative z-10 text-center">
          Failed to load tasks. Please try refreshing.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 relative z-0 h-[650px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/60 dark:border-zinc-800/50">
            <DynamicTaskMap tasks={tasks || []} />
          </div>
          
          <div className="backdrop-blur-2xl bg-white/70 dark:bg-zinc-900/70 rounded-[2.5rem] border border-white/60 dark:border-zinc-700/50 shadow-2xl flex flex-col h-[650px] overflow-hidden">
            <div className="p-8 border-b border-white/40 dark:border-zinc-700/50 bg-white/30 dark:bg-black/20">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center justify-between">
                <span>Recent Requests</span>
                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 py-1.5 px-4 rounded-full text-sm font-bold shadow-sm">
                  {tasks?.length || 0} Open
                </span>
              </h2>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {tasks?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 text-center">
                  <span className="text-5xl drop-shadow-md">🌟</span>
                  <p className="font-medium text-lg">No open requests in your area right now.<br/>Check back later!</p>
                </div>
              ) : (
                tasks?.map((task) => (
                  <div key={task.id} className="group p-6 bg-white/60 dark:bg-zinc-800/60 border border-white/60 dark:border-zinc-700/50 rounded-2xl shadow-md hover:shadow-xl hover:bg-white/90 dark:hover:bg-zinc-800/90 transition-all duration-300 cursor-pointer hover:-translate-y-1">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {task.title}
                      </h3>
                      {task.is_urgent && (
                        <span className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-md shadow-red-500/20">Urgent</span>
                      )}
                    </div>
                    
                    <span className="inline-block px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg mb-4 border border-indigo-100 dark:border-indigo-800/50">
                      {getCategoryLabel(task.category)}
                    </span>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold pt-4 border-t border-indigo-100/50 dark:border-zinc-700/50">
                      <span className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">📍 {task.area_name || 'Location hidden'}</span>
                      <span className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">👤 {task.profiles?.full_name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
