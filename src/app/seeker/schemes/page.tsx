import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CatalogViewer from '@/app/seeker/dashboard/CatalogViewer'
import { ArrowLeft } from 'lucide-react'

export default async function SchemesPage() {
  const supabase = await createClient()
  
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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] max-w-[100vw] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="relative z-10 space-y-6">
        <Link 
          href="/seeker/dashboard" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 md:p-8 rounded-[1rem] shadow-sm border border-gray-200 dark:border-zinc-800">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight break-words">
            Document & Scheme Assistance
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Browse through government schemes and request a volunteer to help you with the paperwork.
          </p>
        </div>
      </div>

      {/* Catalog Section */}
      <div className="relative z-10">
        <CatalogViewer categories={categories || []} />
      </div>
    </div>
  )
}
