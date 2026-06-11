import { LogoutButton } from '@/components/LogoutButton'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CatalogViewer from './CatalogViewer'

export default async function SeekerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch seeker's recent tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('seeker_id', user?.id || '')
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-gray-200 dark:border-zinc-800">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            SahayaK Services
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Select a service below to request assistance from a volunteer.</p>
        </div>
        <div className="shrink-0">
          <LogoutButton />
        </div>
      </div>

      {/* Catalog Section via Client Component */}
      <CatalogViewer categories={categories || []} />
        
      {/* Past Requests Section */}
      <div className="space-y-6 pt-10 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-2 rounded-full bg-gray-400"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Past Requests
          </h2>
        </div>
        
        {!tasks || tasks.length === 0 ? (
          <div className="p-12 backdrop-blur-md bg-white/40 dark:bg-black/20 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl text-center shadow-sm">
            <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              You haven't made any requests yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 max-w-5xl">
            {tasks.map(task => (
              <div key={task.id} className="p-6 md:p-8 backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 border border-white/60 dark:border-zinc-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 shrink-0">
                    {task.is_urgent && (
                      <span className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                        Urgent
                      </span>
                    )}
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider ${
                      task.status === 'open' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' : 
                      task.status === 'accepted' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300' : 
                      'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300'
                    }`}>
                      Status: {(task.status || 'open')}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 line-clamp-2">
                  {task.description}
                </p>
                
                <div className="flex flex-col md:flex-row gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span>📋</span>
                    <span>{getCategoryLabel(task.category)}</span>
                  </span>
                  {task.area_name && <span className="hidden md:block w-px bg-gray-300 dark:bg-zinc-700"></span>}
                  {task.area_name && (
                    <span className="flex items-center gap-1.5">
                      <span>📍</span>
                      <span>{task.area_name}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
