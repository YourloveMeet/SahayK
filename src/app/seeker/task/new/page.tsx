'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createTaskAction } from '@/services/task.service'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import DynamicLocationPicker from '@/components/map/DynamicLocationPicker'
import { useIsMobile } from '@/hooks/use-mobile'

const taskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  category: z.string().min(1, 'Please select a category'),
  isUrgent: z.boolean(),
  areaName: z.string().optional(),
  latitude: z.number({ message: 'Please select a location on the map' }),
  longitude: z.number({ message: 'Please select a location on the map' }),
  errandItems: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    notes: z.string().optional()
  })).optional(),
  preferredShop: z.string().optional(),
  estimatedBudget: z.number().optional()
})

function NewTaskForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isMobile = useIsMobile()
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
  
  const [isAreaListening, setIsAreaListening] = useState(false)
  const areaRecognitionRef = useRef<any>(null)

  // Mobile Category Picker State
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  // Lock body scroll when picker is open
  useEffect(() => {
    if (showCategoryPicker) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showCategoryPicker])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      category: prefillCategory || '',
      errandItems: [{ name: '', quantity: 1, notes: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "errandItems"
  })

  const selectedCategory = watch('category')
  const isErrand = selectedCategory === 'errands'

  // Pre-fill description if it's an errand to avoid validation errors
  useEffect(() => {
    if (isErrand && !getValues('description')) {
      setValue('description', 'General Task Details', { shouldValidate: true })
    }
  }, [isErrand, setValue, getValues])

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
    
    if (isErrand) {
      const errandDetails = {
        items: data.errandItems,
        preferred_shop: data.preferredShop,
        estimated_budget: data.estimatedBudget
      }
      formData.append('errand_details', JSON.stringify(errandDetails))
    }
    
    // Pass the specific service ID to the backend if they came from the catalog
    if (prefillServiceId) {
      formData.append('service_id', prefillServiceId)
    }

    const result = await createTaskAction(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push('/seeker/tasks')
    }
  }

  const renderDesktopView = () => (
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
            <Label htmlFor="desktop-title" className="text-xl font-bold text-gray-800 dark:text-gray-200">1. What do you need help with?</Label>
            <Input 
              id="desktop-title" 
              placeholder="e.g. Need help applying for Aadhaar card" 
              className="h-14 text-lg border border-indigo-100 dark:border-zinc-800 bg-white/50 dark:bg-black/20 rounded-xl px-4 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 shadow-inner placeholder:text-gray-400"
              {...register('title')} 
            />
            {errors.title && <p className="text-red-500 text-sm font-medium">{errors.title.message}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="desktop-description" className="text-xl font-bold text-gray-800 dark:text-gray-200">2. Provide more details</Label>
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
                id="desktop-description" 
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
              <Label htmlFor="desktop-category" className="text-xl font-bold text-gray-800 dark:text-gray-200">3. Select a Category</Label>
              <select 
                id="desktop-category"
                className="w-full h-14 px-4 text-lg rounded-xl border border-indigo-100 dark:border-zinc-800 bg-white/50 dark:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 shadow-inner appearance-none cursor-pointer"
                {...register('category')}
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title.replace(/Errands/gi, 'Shopping')}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm font-medium">{errors.category.message}</p>}
            </div>

            {isErrand && (
              <div className="relative overflow-hidden p-8 bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-8">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="relative z-10 border-b border-indigo-50 dark:border-zinc-800 pb-4">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Task Requirements</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Please list the items you need and any preferred locations.</p>
                </div>
                
                <div className="relative z-10 space-y-5">
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Shopping List / Items Needed</Label>
                  
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 dark:bg-black/20 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800/50 transition-all hover:border-indigo-200 dark:hover:border-indigo-800/50">
                        <div className="flex-1 w-full relative">
                          <Input placeholder="Item Name (e.g. Milk 1L)" {...register(`errandItems.${index}.name`)} className="bg-white dark:bg-black/40 border-0 shadow-sm focus-visible:ring-indigo-500 h-12 rounded-xl" />
                          {errors.errandItems?.[index]?.name && <p className="absolute -bottom-5 left-2 text-[10px] font-bold text-red-500">{errors.errandItems[index]?.name?.message}</p>}
                        </div>
                        
                        <div className="w-full sm:w-28 shrink-0">
                          <Input type="number" min="1" placeholder="Qty" {...register(`errandItems.${index}.quantity` as const, { valueAsNumber: true })} className="bg-white dark:bg-black/40 border-0 shadow-sm focus-visible:ring-indigo-500 h-12 rounded-xl text-center" />
                        </div>
                        
                        <div className="flex-1 w-full">
                          <Input placeholder="Notes (optional)" {...register(`errandItems.${index}.notes`)} className="bg-white dark:bg-black/40 border-0 shadow-sm focus-visible:ring-indigo-500 h-12 rounded-xl" />
                        </div>
                        
                        <Button type="button" variant="ghost" onClick={() => remove(index)} className="w-full sm:w-auto h-12 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 font-bold">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button type="button" variant="outline" onClick={() => append({ name: '', quantity: 1, notes: '' })} className="mt-2 h-12 px-6 rounded-xl border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-bold transition-colors">
                    + Add Another Item
                  </Button>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-indigo-50 dark:border-zinc-800">
                  <div className="space-y-3">
                    <Label htmlFor="desktop-preferredShop" className="text-sm font-bold text-gray-700 dark:text-gray-300">Preferred Store / Location</Label>
                    <Input id="desktop-preferredShop" placeholder="e.g. Local Pharmacy or Supermarket" {...register('preferredShop')} className="h-14 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 focus-visible:ring-indigo-500 shadow-sm" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="desktop-estimatedBudget" className="text-sm font-bold text-gray-700 dark:text-gray-300">Estimated Budget (INR)</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                      <Input id="desktop-estimatedBudget" type="number" placeholder="500" {...register('estimatedBudget', { valueAsNumber: true })} className="h-14 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-zinc-800 rounded-xl pl-8 focus-visible:ring-indigo-500 shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 relative z-[9999]">
              <div className="flex items-center justify-between">
                <Label htmlFor="desktop-areaName" className="text-xl font-bold text-gray-800 dark:text-gray-200">4. Search your Address</Label>
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
                id="desktop-areaName" 
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

          <label htmlFor="desktop-isUrgent" className="flex items-center space-x-4 p-5 md:p-6 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl cursor-pointer hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors shadow-sm">
            <input 
              type="checkbox" 
              id="desktop-isUrgent" 
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

  const renderMobileView = () => (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0A0A0A] pb-24">
      
      <div className="bg-white dark:bg-zinc-900 px-6 pt-6 pb-6 border-b border-gray-100 dark:border-zinc-800 z-10 relative">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Request Help</h1>
        <p className="text-sm font-bold text-gray-500 mt-1">A volunteer will be dispatched to assist you.</p>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold border border-red-100 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
        
        {/* Step 1 */}
        <div className="bg-white dark:bg-zinc-900 p-6 border-b border-gray-100 dark:border-zinc-800">
          <Label htmlFor="mobile-title" className="text-lg font-black text-gray-900 dark:text-white mb-4 block">1. What do you need help with?</Label>
          <Input 
            id="mobile-title"
            placeholder="e.g. Need help applying for Aadhaar card" 
            className="h-14 text-base border-0 bg-gray-50 dark:bg-zinc-800 rounded-2xl px-4 focus-visible:ring-2 focus-visible:ring-blue-500 shadow-inner"
            {...register('title')} 
          />
          {errors.title && <p className="text-red-500 text-xs font-bold mt-2">{errors.title.message}</p>}
        </div>

        {/* Step 2 */}
        <div className="bg-white dark:bg-zinc-900 p-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex flex-col mb-4 gap-3">
            <Label htmlFor="mobile-description" className="text-lg font-black text-gray-900 dark:text-white">2. Provide more details</Label>
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                isListening 
                  ? 'bg-rose-100 text-rose-700 animate-pulse' 
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 active:scale-[0.98]'
              }`}
            >
              {isListening ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  Listening... Tap to stop
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  Tap to Speak Instead
                </>
              )}
            </button>
          </div>
          <textarea 
            id="mobile-description"
            placeholder="Type your details here..."
            className={`w-full min-h-[140px] p-4 text-base rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800 resize-none shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isListening ? 'ring-2 ring-rose-500/50' : ''}`}
            {...register('description')} 
          />
          {errors.description && <p className="text-red-500 text-xs font-bold mt-2">{errors.description.message}</p>}
        </div>

        {/* Step 3 */}
        <div className="bg-white dark:bg-zinc-900 p-6 border-b border-gray-100 dark:border-zinc-800">
          <Label className="text-lg font-black text-gray-900 dark:text-white mb-4 block">3. Select a Category</Label>
          
          <div 
            onClick={() => setShowCategoryPicker(true)}
            className="w-full h-14 px-4 text-base rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800 flex items-center justify-between font-bold text-gray-900 dark:text-white shadow-inner cursor-pointer"
          >
            <span>
              {categories.find(c => c.id === selectedCategory)?.title.replace(/Errands/gi, 'Shopping') || 'Select a category...'}
            </span>
            <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {errors.category && <p className="text-red-500 text-xs font-bold mt-2">{errors.category.message}</p>}
        </div>

        {/* Full-Screen Category Picker Overlay */}
        {showCategoryPicker && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-[#0A0A0A] flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center p-6 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
              <button type="button" onClick={() => setShowCategoryPicker(false)} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-900 dark:text-white font-bold active:scale-95 transition-transform shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-black ml-4 text-gray-900 dark:text-white tracking-tight">Select Category</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-safe">
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setValue('category', cat.id, { shouldValidate: true })
                    setShowCategoryPicker(false)
                  }}
                  className={`w-full text-left px-6 py-5 rounded-3xl text-lg font-extrabold transition-all active:scale-[0.97] flex items-center justify-between border-2 ${
                    selectedCategory === cat.id 
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-500/30' 
                      : 'border-transparent bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-sm'
                  }`}
                >
                  {cat.title.replace(/Errands/gi, 'Shopping')}
                  {selectedCategory === cat.id && (
                    <svg className="w-7 h-7 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}

        {/* Errand Extension */}
        {isErrand && (
          <div className="bg-white dark:bg-zinc-900 p-6 border-b border-gray-100 dark:border-zinc-800 space-y-6">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Shopping List</h3>
              <p className="text-xs font-bold text-gray-500 mt-1">What items do you need?</p>
            </div>
            
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl space-y-3 relative border border-gray-100 dark:border-zinc-700">
                  <Input placeholder="Item Name (e.g. Milk 1L)" {...register(`errandItems.${index}.name`)} className="bg-white dark:bg-zinc-900 border-0 shadow-sm h-12 rounded-xl" />
                  {errors.errandItems?.[index]?.name && <p className="text-[10px] font-bold text-red-500 -mt-2">{errors.errandItems[index]?.name?.message}</p>}
                  
                  <div className="flex gap-3">
                    <Input type="number" min="1" placeholder="Qty" {...register(`errandItems.${index}.quantity` as const, { valueAsNumber: true })} className="w-24 bg-white dark:bg-zinc-900 border-0 shadow-sm h-12 rounded-xl text-center" />
                    <Input placeholder="Notes (optional)" {...register(`errandItems.${index}.notes`)} className="flex-1 bg-white dark:bg-zinc-900 border-0 shadow-sm h-12 rounded-xl" />
                  </div>
                  
                  <div className="flex justify-end pt-1">
                    <button type="button" onClick={() => remove(index)} className="text-xs font-bold text-red-500 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-transform">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove Item
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={() => append({ name: '', quantity: 1, notes: '' })} className="w-full h-12 rounded-xl border-blue-200 text-blue-600 dark:border-blue-900 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/10">
              + Add Item
            </Button>

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-preferredShop" className="text-sm font-bold text-gray-700 dark:text-gray-300">Preferred Store / Location</Label>
                <Input id="mobile-preferredShop" placeholder="e.g. Local Pharmacy" {...register('preferredShop')} className="h-12 bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl px-4 shadow-inner" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-estimatedBudget" className="text-sm font-bold text-gray-700 dark:text-gray-300">Estimated Budget (INR)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <Input id="mobile-estimatedBudget" type="number" placeholder="500" {...register('estimatedBudget', { valueAsNumber: true })} className="h-12 bg-gray-50 dark:bg-zinc-800 border-0 rounded-xl pl-8 shadow-inner" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 & 5 */}
        <div className="bg-white dark:bg-zinc-900 p-6 mb-4 relative z-[9999]">
          <Label htmlFor="mobile-areaName" className="text-lg font-black text-gray-900 dark:text-white mb-4 block">4. Search Address</Label>
          <div className="mb-6 relative">
            <textarea 
              id="mobile-areaName"
              placeholder="e.g. Bandra Kurla Complex..." 
              className="w-full min-h-[100px] p-4 text-base rounded-2xl border-0 bg-gray-50 dark:bg-zinc-800 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
              {...register('areaName')} 
              onChange={(e) => {
                register('areaName').onChange(e)
                handleAreaChange(e as any)
              }}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-[100%] mt-2 z-[9999] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm font-bold text-gray-500">Searching...</div>
                ) : suggestions.length > 0 ? (
                  <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {suggestions.map((suggestion, idx) => (
                      <li key={idx} onClick={() => selectSuggestion(suggestion)} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-300">
                        {suggestion.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm font-bold text-gray-500">No locations found.</div>
                )}
              </div>
            )}
          </div>

          <Label className="text-lg font-black text-gray-900 dark:text-white mb-4 block">5. Pin Location on Map</Label>
          <div className="h-64 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm">
            <DynamicLocationPicker 
              centerPosition={mapCenter}
              onLocationSelect={(lat, lng) => {
                setValue('latitude', lat, { shouldValidate: true })
                setValue('longitude', lng, { shouldValidate: true })
              }} 
            />
          </div>
          {errors.latitude && <p className="text-red-500 text-xs font-bold mt-2">Please tap on the map to pin your location.</p>}
        </div>

        <div className="mx-4 mt-6 mb-10 p-5 bg-rose-50/80 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-center">
          <label htmlFor="mobile-isUrgent" className="flex items-center gap-4 cursor-pointer w-full justify-center">
            <input 
              type="checkbox" 
              id="mobile-isUrgent"
              className="w-6 h-6 rounded-md border-rose-300 text-rose-600 focus:ring-rose-500 shadow-sm"
              {...register('isUrgent')} 
            />
            <span className="font-black text-rose-700 dark:text-rose-400 text-lg uppercase tracking-wider">Mark as URGENT</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="mx-4 mt-8 mb-6">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-14 rounded-xl text-lg font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform"
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  )

  return isMobile ? renderMobileView() : renderDesktopView()
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
      <NewTaskForm />
    </Suspense>
  )
}
