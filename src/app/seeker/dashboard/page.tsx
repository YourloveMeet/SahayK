import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CatalogViewer from './CatalogViewer'
import { TaskCard } from '@/components/volunteer/TaskCard'
import { Clock } from 'lucide-react'

export default async function SeekerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch seeker's active tasks
  const { data: activeTasks } = await supabase
    .from('tasks')
    .select(`*, profiles!tasks_volunteer_id_fkey(full_name, avatar_url, phone)`)
    .eq('seeker_id', user?.id || '')
    .in('status', ['open', 'accepted'])
    .order('created_at', { ascending: false })

  // Fetch Categories and Services from Database
  const { data: categories } = await (supabase as any)
    .from('service_categories')
    .select(`
      id,
      title,
      sort_order,
      services (
        id,
        category_id,
        title,
        official_url,
        estimated_time,
        documents_needed,
        steps,
        sort_order
      )
    `)
    .order('sort_order');

  const getCategoryLabel = (val: string) => {
    return categories?.find((c: any) => c.id === val)?.title || val;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-20 left-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Bento Box Header */}
      <div className="relative z-10 backdrop-blur-xl bg-white/60 dark:bg-black/60 p-8 rounded-[1rem] shadow-sm border border-gray-200 dark:border-zinc-800 flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          SahayaK Services
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
          Select a service below to request assistance from a volunteer.
        </p>
      </div>

      {/* Active Requests Section */}
      {activeTasks && activeTasks.length > 0 && (
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
             <Clock className="w-6 h-6 text-blue-600 dark:text-blue-500" />
             Your Active Requests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTasks.map(task => (
              <TaskCard key={task.id} task={task as any} />
            ))}
          </div>
        </div>
      )}

      {/* Catalog Section via Client Component */}
      <div className="relative z-10">
        <CatalogViewer categories={categories || []} />
      </div>
    </div>
  )
}
