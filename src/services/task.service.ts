'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createTaskAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const isUrgent = formData.get('isUrgent') === 'true'
  const areaName = formData.get('areaName') as string
  const latStr = formData.get('latitude') as string
  const lngStr = formData.get('longitude') as string

  // Errand specific
  const errandDetailsStr = formData.get('errand_details') as string
  let errandDetails = null
  let taskStatusDetail = null
  let finalCategory = category
  if (errandDetailsStr) {
    try {
      errandDetails = JSON.parse(errandDetailsStr)
      taskStatusDetail = 'not_started'
      if (finalCategory === 'errands') {
         finalCategory = 'other' // bypass DB check constraint
      }
    } catch (e) {
      console.error('Failed to parse errand details', e)
    }
  }

  if (!title || !description || !category || !latStr || !lngStr) {
    return { error: 'Missing required fields' }
  }

  const latitude = parseFloat(latStr)
  const longitude = parseFloat(lngStr)

  const { error } = await supabase.from('tasks').insert({
    seeker_id: user.id,
    title,
    description,
    category: finalCategory,
    is_urgent: isUrgent,
    latitude,
    longitude,
    area_name: areaName || null,
    status: 'open',
    errand_details: errandDetails,
    task_status_detail: taskStatusDetail
  })

  if (error) {
    console.error('Failed to create task:', error)
    return { error: `Database Error: ${error.message || JSON.stringify(error)}` }
  }

  redirect('/seeker/dashboard')
}

// Function to fetch open tasks for volunteers
// Note: React Query will use an API route or client-side supabase directly, 
// but we can also use Server Actions if configured properly. 
// However, since we need dynamic maps, fetching via client-side supabase in a React Query hook is often easier.
