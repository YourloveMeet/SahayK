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
        
    </div>
  )
}
