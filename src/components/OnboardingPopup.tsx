'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, CheckCircle, Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function OnboardingPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  const [phone, setPhone] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    // Only check if we are on a protected route (not landing, not login, not register)
    const isProtectedRoute = pathname.startsWith('/volunteer') || pathname.startsWith('/seeker') || pathname.startsWith('/admin')
    
    if (isProtectedRoute) {
      checkProfile()
    } else {
      setIsOpen(false)
    }
  }, [pathname])

  const checkProfile = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setUserProfile(profile)
      // Check if missing required fields
      if (!profile.phone || !profile.avatar_url) {
        setPhone(profile.phone || '')
        setAvatarPreview(profile.avatar_url || null)
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }
    setLoading(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Read and compress image using Canvas to save as lightweight base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 256
        const MAX_HEIGHT = 256
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Compress to JPEG with 0.8 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setAvatarPreview(dataUrl)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!phone || !avatarPreview) return
    if (phone.length < 10) return alert('Please enter a valid phone number.')

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        phone: phone,
        avatar_url: avatarPreview
      })
      .eq('id', userProfile.id)

    setSaving(false)

    if (error) {
      console.error(error)
      alert('Error saving profile.')
    } else {
      setIsOpen(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
        <div className="p-8 pb-6 border-b border-gray-100 dark:border-zinc-900 bg-gray-50/50 dark:bg-zinc-900/50 text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Complete Your Profile</h2>
          <p className="text-gray-500 mt-2 font-medium">Please provide your contact number and a profile picture to continue. This is required to help others identify and contact you.</p>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-full cursor-pointer group"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover rounded-full shadow-md border-4 border-white dark:border-zinc-900" />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center shadow-inner border-2 border-dashed border-gray-300 dark:border-zinc-700 group-hover:border-blue-500 transition-colors">
                  <Camera className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {avatarPreview ? 'Change Photo' : 'Upload Photo'}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Phone Number</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Only allow digits
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={!phone || !avatarPreview || phone.length < 10 || saving}
            className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <CheckCircle className="w-6 h-6" />
                Save & Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
