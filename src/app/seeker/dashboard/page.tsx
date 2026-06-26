import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TaskCard } from '@/components/volunteer/TaskCard'
import { FadeOutOverlay } from '@/components/ui/FadeOutOverlay'
import { Clock, FileText, ShoppingBag, ArrowRight } from 'lucide-react'

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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 overflow-hidden">
      
      {/* Background Orbs */}
      <div className="fixed top-20 left-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Bento Box Header */}
      <div className="relative z-10 backdrop-blur-xl bg-white/60 dark:bg-black/60 p-8 rounded-[1rem] shadow-sm border border-gray-200 dark:border-zinc-800 flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          SahayaK Dashboard
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
          What kind of assistance do you need today?
        </p>
      </div>

      {/* Primary Actions (Dual Card Split View) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Document Help */}
        <Link 
          href="/seeker/schemes"
          className="group relative overflow-hidden rounded-3xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col h-full"
        >
          {/* Decorative Background */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-200/50 dark:bg-indigo-900/30 rounded-full blur-3xl group-hover:bg-indigo-300/50 dark:group-hover:bg-indigo-800/40 transition-colors"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6 shadow-inner border border-indigo-200 dark:border-indigo-800 relative z-10 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-8 h-8" />
          </div>
          
          <div className="relative z-10 flex-1">
            <h2 className="text-2xl font-black text-indigo-950 dark:text-indigo-100 mb-3 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
              Document & Scheme Assistance
            </h2>
            <p className="text-lg text-indigo-800/70 dark:text-indigo-200/70 font-medium leading-relaxed">
              Get help applying for government schemes, pensions, ID cards, and other official paperwork.
            </p>
          </div>
          
          <div className="relative z-10 mt-8 flex items-center text-indigo-600 dark:text-indigo-400 font-bold">
            Browse Schemes 
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2" />
          </div>
        </Link>

        {/* Card 2: General Work / Errands */}
        <Link 
          href="/seeker/task/new?category=errands"
          className="group relative overflow-hidden rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 flex flex-col h-full"
        >
          {/* Decorative Background */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-200/50 dark:bg-rose-900/30 rounded-full blur-3xl group-hover:bg-rose-300/50 dark:group-hover:bg-rose-800/40 transition-colors"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900 flex items-center justify-center mb-6 shadow-inner border border-rose-200 dark:border-rose-800 relative z-10 text-rose-600 dark:text-rose-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          
          <div className="relative z-10 flex-1">
            <h2 className="text-2xl font-black text-rose-950 dark:text-rose-100 mb-3 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">
              General Help & Errands
            </h2>
            <p className="text-lg text-rose-800/70 dark:text-rose-200/70 font-medium leading-relaxed">
              Request a volunteer for grocery delivery, medicine pickup, or any other general physical assistance.
            </p>
          </div>
          
          <div className="relative z-10 mt-8 flex items-center text-rose-600 dark:text-rose-400 font-bold">
            Request Help 
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2" />
          </div>
        </Link>

        {/* Card 3: Financial Assistance */}
        <Link 
          href="/seeker/financial-request/new"
          className="group relative overflow-hidden rounded-3xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 flex flex-col h-full"
        >
          {/* Decorative Background */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-200/50 dark:bg-emerald-900/30 rounded-full blur-3xl group-hover:bg-emerald-300/50 dark:group-hover:bg-emerald-800/40 transition-colors"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-6 shadow-inner border border-emerald-200 dark:border-emerald-800 relative z-10 text-emerald-600 dark:text-emerald-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="relative z-10 flex-1">
            <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
              Financial Assistance
            </h2>
            <p className="text-lg text-emerald-800/70 dark:text-emerald-200/70 font-medium leading-relaxed">
              Request direct sponsorship from verified donors for medical treatments, education, or essential needs.
            </p>
          </div>
          
          <div className="relative z-10 mt-8 flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
            Request Funds
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2" />
          </div>
        </Link>

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
    </div>
  )
}
