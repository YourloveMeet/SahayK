'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitVerificationAction(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const phone = formData.get('phone') as string
    const area_name = formData.get('area_name') as string
    const avatarFile = formData.get('avatar') as File | null

    if (!phone || !area_name) {
      return { error: 'Phone and Address are required.' }
    }

    let avatar_url = formData.get('current_avatar_url') as string

    // If a new avatar file was uploaded, process it
    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true })

      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        return { error: 'Failed to upload profile picture.' }
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
        
      avatar_url = publicUrlData.publicUrl
    }

    if (!avatar_url) {
      return { error: 'Profile picture is required for verification.' }
    }

    // Update the profile with the details and set status to pending
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        phone,
        area_name,
        avatar_url,
        verification_status: 'pending'
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { error: updateError.message }
    }

    revalidatePath('/seeker/profile')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (err: any) {
    console.error('Exception during verification:', err)
    return { error: 'An unexpected error occurred.' }
  }
}
