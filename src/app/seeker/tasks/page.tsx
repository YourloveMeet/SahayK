import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MyTasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch seeker's recent tasks along with volunteer info if available
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      volunteer:profiles!tasks_volunteer_id_fkey(
        full_name,
        phone,
        college_name,
        help_score,
        tasks_completed
      )
    `)
    .eq('seeker_id', user?.id || '')
    .order('created_at', { ascending: false })

  // Fetch Categories and Services from Database to map category IDs
  const { data: categories } = await (supabase as any)
    .from('service_categories')
    .select('id, title');

  const getCategoryLabel = (val: string) => {
    return categories?.find((c: any) => c.id === val)?.title || val;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-gray-200 dark:border-zinc-800">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            My Requests
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">View the status of your requests and volunteer details.</p>
        </div>
      </div>

      <div className="space-y-6">
        {!tasks || tasks.length === 0 ? (
          <div className="p-12 backdrop-blur-md bg-white/40 dark:bg-black/20 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl text-center shadow-sm">
            <p className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-4">
              You haven't made any requests yet.
            </p>
            <Link 
              href="/seeker/dashboard"
              className="inline-block px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Request Assistance
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 max-w-4xl">
            {tasks.map((task: any) => (
              <div key={task.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800 transition-shadow hover:shadow-md">
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-5">
                  <div>
                    <h3 className="font-black text-2xl text-gray-900 dark:text-white leading-tight mb-2">
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <span className="text-gray-400">📋</span>
                        <span>{getCategoryLabel(task.category)}</span>
                      </span>
                      {task.area_name && <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></span>}
                      {task.area_name && (
                        <span className="flex items-center gap-1.5">
                          <span className="text-gray-400">📍</span>
                          <span>{task.area_name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {task.is_urgent && (
                      <span className="px-3 py-1 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-xs font-black rounded-full uppercase tracking-wider border border-rose-100 dark:border-rose-500/20">
                        Urgent
                      </span>
                    )}
                    <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider border ${
                      task.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                      task.status === 'accepted' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' : 
                      'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                    }`}>
                      {task.status || 'open'}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {task.description}
                </p>

                {/* Volunteer Details Section */}
                {task.volunteer && (
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="text-indigo-500">🤝</span> Volunteer Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Name</p>
                        <p className="font-bold text-gray-900 dark:text-white">{task.volunteer.full_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                        <p className="font-bold text-gray-900 dark:text-white">{task.volunteer.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">College/Institution</p>
                        <p className="font-bold text-gray-900 dark:text-white">{task.volunteer.college_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Help Score</p>
                        <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {task.volunteer.help_score || 0} pts
                          <span title={`${task.volunteer.tasks_completed || 0} tasks completed`}>
                            {task.volunteer.help_score > 500 ? '🏆' : task.volunteer.help_score > 100 ? '🥈' : task.volunteer.help_score > 20 ? '🥉' : '🌱'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completion Note & Proof */}
                {task.status === 'completed' && task.completion_proof_url && (
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="text-emerald-500">✅</span> Completion Summary
                    </h4>
                    <div className="flex flex-col md:flex-row gap-8">
                      {task.completion_note && (
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Volunteer Note</p>
                          <p className="text-gray-700 dark:text-gray-300 italic">"{task.completion_note}"</p>
                        </div>
                      )}
                      <div className="w-full md:w-64 shrink-0">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Proof of Completion</p>
                        <a href={task.completion_proof_url} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border border-gray-100 dark:border-zinc-800">
                          <img src={task.completion_proof_url} alt="Proof" className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-bold">View Image</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
