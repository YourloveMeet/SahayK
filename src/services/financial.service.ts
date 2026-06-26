'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFinancialRequestAction(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'You must be logged in to request financial assistance.' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const amount_needed = parseFloat(formData.get('amount_needed') as string)
    const urgency = formData.get('urgency') as string

    if (!title || !description || !amount_needed || !urgency) {
      return { error: 'Missing required fields.' }
    }

    const { error } = await supabase
      .from('seeker_financial_requests')
      .insert({
        seeker_id: user.id,
        title,
        description,
        amount_needed,
        urgency,
        status: 'Open'
      })

    if (error) {
      console.error('Error creating financial request:', error)
      return { error: error.message || 'Failed to submit request.' }
    }

    revalidatePath('/donor/profile') // Revalidate donor dashboard where these appear
    revalidatePath('/seeker/dashboard') // Just in case we list them here later

    return { success: true }
  } catch (err: any) {
    console.error('Exception creating financial request:', err)
    return { error: err.message || 'An unexpected error occurred.' }
  }
}
