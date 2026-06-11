'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createTaskAction } from '@/services/task.service'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import DynamicLocationPicker from '@/components/map/DynamicLocationPicker'

const taskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  isUrgent: z.boolean(),
  areaName: z.string().optional(),
  latitude: z.number({ message: 'Please select a location on the map' }),
  longitude: z.number({ message: 'Please select a location on the map' }),
})

function NewTaskForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const prefillServiceId = searchParams.get('service')
  const prefillCategory = searchParams.get('category')

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<{id: string, title: string}[]>([])
  
  // Speech to text state (Description)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Address Autocomplete & Map Sync State
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Speech to text state (Area)
  const [isAreaListening, setIsAreaListening] = useState(false)
  const areaRecognitionRef = useRef<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      category: prefillCategory || '',
    }
  })

  // Fetch categories and prefill title if serviceId is provided
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      
      // Load categories
      const { data: cats } = await (supabase as any).from('service_categories').select('id, title').order('sort_order')
      if (cats) {
        setCategories(cats)
        // Explicitly set the value after options are available
        if (prefillCategory) {
          setValue('category', prefillCategory, { shouldValidate: true })
        }
      }

      // Pre-fill title if coming from a specific service modal
      if (prefillServiceId) {
        const { data: service } = await (supabase as any).from('services').select('title').eq('id', prefillServiceId).single()
        if (service) {
          setValue('title', `Need help with: ${service.title}`, { shouldValidate: true })
        }
      }
    }
    loadData()
  }, [prefillServiceId, prefillCategory, setValue])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support Speech Recognition. Please use Google Chrome or Microsoft Edge.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN' // Defaulting to Indian English, handles Hindi accents well too

    // Capture the existing text so we can append to it
    const originalText = getValues('description') || ''
    
    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      
      const newText = originalText + (originalText && !originalText.endsWith(' ') ? ' ' : '') + transcript
      setValue('description', newText, { shouldValidate: true })
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }
    setIsSearching(true)
    try {
      // Using highly accurate ArcGIS Geocoding Service (Free public endpoint)
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
    setValue('areaName', val, { shouldValidate: true })
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 500)
  }

  const selectSuggestion = async (suggestion: any) => {
    setValue('areaName', suggestion.text, { shouldValidate: true })
    setSuggestions([])
    setShowSuggestions(false)
    
    try {
      // Fetch exact coordinates using the magicKey from the suggestion
      const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&magicKey=${suggestion.magicKey}`)
      const data = await res.json()
      
      if (data.candidates && data.candidates.length > 0) {
        const loc = data.candidates[0].location
        const lat = loc.y
        const lng = loc.x
        setValue('latitude', lat, { shouldValidate: true })
        setValue('longitude', lng, { shouldValidate: true })
        setMapCenter([lat, lng])
      }
    } catch (e) {
      console.error('Failed to fetch exact location coordinates', e)
    }
  }

  const toggleAreaListening = () => {
    if (isAreaListening) {
      areaRecognitionRef.current?.stop()
      setIsAreaListening(false)
      return
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support Speech Recognition. Please use Google Chrome or Microsoft Edge.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    areaRecognitionRef.current = recognition
    
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-IN' 

    recognition.onstart = () => {
      setIsAreaListening(true)
    }

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setValue('areaName', transcript, { shouldValidate: true })
      
      // Also trigger autocomplete search automatically when speech finishes
      if (event.results[0].isFinal) {
        fetchSuggestions(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error)
      setIsAreaListening(false)
    }

    recognition.onend = () => {
      setIsAreaListening(false)
    }

    recognition.start()
  }

  const onSubmit = async (data: z.infer<typeof taskSchema>) => {
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('category', data.category)
    formData.append('isUrgent', data.isUrgent.toString())
    if (data.areaName) formData.append('areaName', data.areaName)
    formData.append('latitude', data.latitude.toString())
    formData.append('longitude', data.longitude.toString())
    
    // Pass the specific service ID to the backend if they came from the catalog
    if (prefillServiceId) {
      formData.append('service_id', prefillServiceId)
    }

    const result = await createTaskAction(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push('/seeker/dashboard')
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="space-y-8 backdrop-blur-2xl bg-white/70 dark:bg-zinc-900/80 p-6 md:p-10 rounded-3xl shadow-xl border border-white/60 dark:border-white/10 relative overflow-hidden">
        
        {/* Decorative ambient blur */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-400/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-400/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="border-b border-indigo-200/50 dark:border-indigo-900/50 pb-6 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-200 dark:to-indigo-500 tracking-tight">Request Assistance</h1>
          <p className="mt-2 text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed">Please fill out this simple form to tell us what you need help with. A volunteer will be notified.</p>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-xl font-bold text-gray-800 dark:text-gray-200">1. What do you need help with?</Label>
            <Input 
              id="title" 
              placeholder="e.g. Need help applying for Aadhaar card" 
              className="h-14 text-lg border border-indigo-100 dark:border-zinc-800 bg-white/50 dark:bg-black/20 rounded-xl px-4 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 shadow-inner placeholder:text-gray-400"
              {...register('title')} 
            />
            {errors.title && <p className="text-red-500 text-sm font-medium">{errors.title.message}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-xl font-bold text-gray-800 dark:text-gray-200">2. Provide more details</Label>
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                  isListening 
                    ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse' 
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200'
                }`}
              >
                {isListening ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    Listening... Click to stop
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    Speak Instead of Typing
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <textarea 
                id="description" 
                placeholder="Please provide details about what you need assistance with (e.g. documents missing, form filling, banking help)..."
                className={`w-full min-h-[160px] p-4 text-lg rounded-xl border bg-white/50 dark:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 shadow-inner disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-gray-400 resize-none transition-all ${
                  isListening ? 'border-rose-300 ring-4 ring-rose-500/20' : 'border-indigo-100 dark:border-zinc-800 focus-visible:border-indigo-500'
                }`}
                {...register('description')} 
              />
            </div>
            {errors.description && <p className="text-red-500 text-sm font-medium">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-6">

            <div className="space-y-3">
              <Label htmlFor="category" className="text-xl font-bold text-gray-800 dark:text-gray-200">3. Select a Category</Label>
              <select 
                id="category"
                className="w-full h-14 px-4 text-lg rounded-xl border border-indigo-100 dark:border-zinc-800 bg-white/50 dark:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 shadow-inner appearance-none cursor-pointer"
                {...register('category')}
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm font-medium">{errors.category.message}</p>}
            </div>

            <div className="space-y-3 relative z-[9999]">
              <div className="flex items-center justify-between">
                <Label htmlFor="areaName" className="text-xl font-bold text-gray-800 dark:text-gray-200">4. Search your Address</Label>
                <button
                  type="button"
                  onClick={toggleAreaListening}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all shadow-sm ${
                    isAreaListening 
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse' 
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200'
                  }`}
                >
                  {isAreaListening ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      Listening...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      Speak
                    </>
                  )}
                </button>
              </div>
              <textarea 
                id="areaName" 
                placeholder="e.g. Bandra Kurla Complex..." 
                className={`w-full min-h-[120px] p-4 text-lg border bg-white/50 dark:bg-black/20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 shadow-inner placeholder:text-gray-400 transition-all resize-none ${isAreaListening ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-indigo-100 dark:border-zinc-800 focus-visible:border-indigo-500'}`}
                {...register('areaName')} 
                onChange={(e) => {
                  register('areaName').onChange(e)
                  handleAreaChange(e as any)
                }}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                autoComplete="off"
              />
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-[100%] mt-2 z-[9999] w-full bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm font-medium text-gray-500">Searching locations...</div>
                  ) : suggestions.length > 0 ? (
                    <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {suggestions.map((suggestion, idx) => (
                        <li 
                          key={idx} 
                          onClick={() => selectSuggestion(suggestion)}
                          className="p-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer flex items-start gap-3 transition-colors"
                        >
                          <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300 leading-tight">
                            {suggestion.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-sm font-medium text-gray-500">No accurate locations found. Try being more specific.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <label htmlFor="isUrgent" className="flex items-center space-x-4 p-5 md:p-6 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl cursor-pointer hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors shadow-sm">
            <input 
              type="checkbox" 
              id="isUrgent" 
              className="w-6 h-6 rounded-md border border-rose-300 text-rose-600 focus:ring-rose-500 focus:ring-offset-rose-50 cursor-pointer shadow-inner"
              {...register('isUrgent')} 
            />
            <span className="text-lg font-bold text-rose-800 dark:text-rose-400 select-none">
              Check this box if this is URGENT
            </span>
          </label>

          <div className="space-y-4 pt-6 border-t border-indigo-100 dark:border-zinc-800">
            <div>
              <Label className="text-xl font-bold text-gray-800 dark:text-gray-200">5. Pinpoint Your Exact Location</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4 font-medium leading-relaxed">Click on the map below so the volunteer knows exactly where to go.</p>
            </div>
            
            <div className="border border-indigo-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-md">
              <DynamicLocationPicker 
                centerPosition={mapCenter}
                onLocationSelect={(lat, lng) => {
                  setValue('latitude', lat, { shouldValidate: true })
                  setValue('longitude', lng, { shouldValidate: true })
                }} 
              />
            </div>
            {errors.latitude && <p className="text-rose-600 text-sm font-bold bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-900 shadow-sm">Please select a location by clicking on the map above.</p>}
          </div>

          <div className="pt-8">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-16 text-lg font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border border-zinc-800 dark:border-zinc-200 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Request</span>
                  <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
      <NewTaskForm />
    </Suspense>
  )
}
