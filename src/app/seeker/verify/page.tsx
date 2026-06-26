'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { submitVerificationAction } from '@/services/verification.service'
import { Camera, ShieldCheck, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SeekerVerificationPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ phone: '', area_name: '', current_avatar_url: '' })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Address Autocomplete State
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('phone, area_name, avatar_url, verification_status').eq('id', user.id).single()
        if (data) {
          if (data.verification_status === 'pending' || data.verification_status === 'verified') {
            router.push('/seeker/profile')
            return
          }
          setForm({
            phone: data.phone || '',
            area_name: data.area_name || '',
            current_avatar_url: data.avatar_url || ''
          })
          if (data.avatar_url) setPreviewUrl(data.avatar_url)
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }
      setAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=${encodeURIComponent(query)}&maxSuggestions=5&countryCode=IND`)
      const data = await res.json()
      setSuggestions(data.suggestions || [])
      setShowSuggestions(true)
    } catch (e) {
      console.error('Failed to fetch suggestions', e)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setForm({ ...form, area_name: val })
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 500)
  }

  const selectSuggestion = (suggestion: any) => {
    setForm({ ...form, area_name: suggestion.text })
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!form.phone || !form.area_name) {
      setError('Please provide your phone number and address.')
      setIsSubmitting(false)
      return
    }

    if (!avatarFile && !form.current_avatar_url) {
      setError('A clear profile picture is required for verification.')
      setIsSubmitting(false)
      return
    }

    const formData = new FormData()
    formData.append('phone', form.phone)
    formData.append('area_name', form.area_name)
    formData.append('current_avatar_url', form.current_avatar_url)
    if (avatarFile) formData.append('avatar', avatarFile)

    const result = await submitVerificationAction(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push('/seeker/profile')
    }
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 md:px-8">
      <button onClick={() => router.back()} className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
      </button>

      <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/80 p-8 md:p-10 rounded-3xl shadow-xl border border-gray-200 dark:border-zinc-800 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Identity Verification</h1>
            <p className="text-gray-500 font-medium mt-1">Provide your details to get faster support.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-3xl bg-gray-50 dark:bg-black/20">
            <div className="mb-4 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Profile Photo <span className="text-red-500">*</span></h3>
            <p className="text-sm text-gray-500 text-center max-w-sm mt-1">Upload a clear photo of your face. This helps volunteers identify you when they arrive.</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Phone Number <span className="text-red-500">*</span></Label>
            <Input 
              value={form.phone} 
              onChange={e => setForm({ ...form, phone: e.target.value })} 
              placeholder="+91 98765 43210"
              className="h-14 bg-white dark:bg-black/40 border-gray-200 dark:border-zinc-700 rounded-xl" 
            />
          </div>

          <div className="space-y-3 relative">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Address / Area <span className="text-red-500">*</span></Label>
            <Input 
              value={form.area_name} 
              onChange={handleAreaChange} 
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search for an area..."
              className="h-14 bg-white dark:bg-black/40 border-gray-200 dark:border-zinc-700 rounded-xl"
            />
            {isSearching && (
              <div className="absolute right-4 top-[42px]"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden z-50">
                {suggestions.map((s, idx) => (
                  <div 
                    key={idx}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer text-sm border-b border-gray-100 dark:border-zinc-700/50 last:border-0"
                    onClick={() => selectSuggestion(s)}
                  >
                    {s.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
