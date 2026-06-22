'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  // Artificial delay to show the awesome loader for longer
  await new Promise(r => setTimeout(r, 1500))

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()
  
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Find out the user role to redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()
    
  if (profile?.role === 'seeker') redirect('/seeker/dashboard')
  if (profile?.role === 'volunteer') redirect('/volunteer/dashboard')
  if (profile?.role === 'admin') redirect('/admin/dashboard')
  if (profile?.role === 'ngo_admin') redirect('/ngo/dashboard')
  if (profile?.role === 'donor') redirect('/donor/dashboard')

  redirect('/')
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  const supabase = await createClient()

  // Pass metadata just in case a trigger is expecting it
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user && authData.session) {
    // Check if profile was created automatically
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single()

    // If no trigger created it, we create it manually
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          role: role,
        })
      
      if (profileError) {
        console.error('Failed to create profile manually', profileError)
        return { error: 'Account created, but profile initialization failed.' }
      }
    }

    if (role === 'seeker') redirect('/seeker/dashboard')
    if (role === 'volunteer') redirect('/volunteer/dashboard')
    if (role === 'ngo_admin') redirect('/ngo/dashboard')
    if (role === 'donor') redirect('/donor/dashboard')
  } else if (authData.user && !authData.session) {
    // Email confirmation required
    return { success: 'Please check your email to confirm your account.' }
  }

  redirect('/')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
