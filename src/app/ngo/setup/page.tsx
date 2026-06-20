'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, ChevronLeft, ChevronRight, Building2, Users, MapPin, Heart, Info, ArrowRight, Camera, Upload } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the map to avoid SSR issues
const DynamicLocationPicker = dynamic(() => import('@/components/map/DynamicLocationPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-gray-50 dark:bg-zinc-900 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 border border-gray-200 dark:border-zinc-800">Loading map...</div>
})

const BENEFICIARY_GROUPS = [
  'Elderly / Senior Citizens',
  'Visually Impaired / Blind',
  'Hearing & Speech Impaired (Deaf/Mute)',
  'Physical / Mobility Disability',
  'Intellectual / Developmental Disability',
  'Mental Health',
  'Multiple / General Disability',
  'Women & Children',
  'General Welfare'
]

const SERVICE_TYPES = [
  'Residential Care (old age home / shelter)',
  'Healthcare & Medical Support',
  'Education & Vocational Training',
  'Legal Aid & Documentation Support',
  'Livelihood / Employment Support',
  'Aids & Equipment (wheelchairs, hearing aids, mobility aids, etc.)',
  'Counseling / Mental Health Support',
  'Day Care / Community Center (non-residential)',
  'Advocacy & Awareness'
]

export default function NGOSetupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  
  const [formData, setFormData] = useState({
    ngo_name: '',
    logo_url: '',
    registration_number: '',
    year_established: '',
    about_description: '',
    beneficiary_groups: [] as string[],
    service_types: [] as string[],
    address: '',
    latitude: 23.0225, // Default to Ahmedabad
    longitude: 72.5714,
    contact_phone: '',
    contact_email: '',
    website_url: '',
    capacity: ''
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUserId(user.id)

      const { data, error } = await supabase
        .from('ngo_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        if (data.profile_complete) {
          router.push('/ngo/dashboard')
          return
        }
        
        setFormData(prev => ({
          ...prev,
          ngo_name: data.ngo_name || '',
          logo_url: data.logo_url || '',
          registration_number: data.registration_number || '',
          year_established: data.year_established ? String(data.year_established) : '',
          about_description: data.about_description || '',
          beneficiary_groups: data.beneficiary_groups || [],
          service_types: data.service_types || [],
          address: data.address || '',
          latitude: data.latitude || 23.0225,
          longitude: data.longitude || 72.5714,
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || user.email || '',
          website_url: data.website_url || '',
          capacity: data.capacity ? String(data.capacity) : ''
        }))
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase, router])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !userId) return
    const file = e.target.files[0]
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const { data, error } = await supabase.storage.from('avatars').upload(`ngo-logos/${fileName}`, file)
      
      if (error) {
        console.error("Upload error:", error)
        alert("Failed to upload image. Make sure the 'avatars' bucket exists and is public.")
      } else if (data) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path)
        setFormData(prev => ({ ...prev, logo_url: publicUrl }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const toggleArrayItem = (arrayName: 'beneficiary_groups' | 'service_types', item: string) => {
    setFormData(prev => {
      const current = prev[arrayName]
      if (current.includes(item)) {
        return { ...prev, [arrayName]: current.filter(i => i !== item) }
      } else {
        return { ...prev, [arrayName]: [...current, item] }
      }
    })
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

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setFormData({ ...formData, address: val })
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 500)
  }

  const selectSuggestion = async (suggestion: any) => {
    setFormData({ ...formData, address: suggestion.text })
    setSuggestions([])
    setShowSuggestions(false)
    
    try {
      const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&magicKey=${suggestion.magicKey}`)
      const data = await res.json()
      
      if (data.candidates && data.candidates.length > 0) {
        const loc = data.candidates[0].location
        setFormData(prev => ({
          ...prev,
          address: suggestion.text,
          latitude: loc.y,
          longitude: loc.x
        }))
      }
    } catch (e) {
      console.error('Failed to fetch exact location coordinates', e)
    }
  }

  const handleNext = () => {
    // Validation
    if (step === 1 && !formData.ngo_name) {
      alert("NGO Name is required.")
      return
    }
    if (step === 2 && (formData.beneficiary_groups.length === 0 || formData.service_types.length === 0)) {
      alert("Please select at least one item from both groups.")
      return
    }
    if (step === 3 && (!formData.address || !formData.contact_phone || !formData.contact_email)) {
      alert("Address, phone, and email are required.")
      return
    }

    setStep(s => s + 1)
  }

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1))
  }

  const handleSubmit = async () => {
    if (!userId) return
    setSubmitting(true)
    
    const { error } = await supabase.from('ngo_profiles').upsert({
      user_id: userId,
      ngo_name: formData.ngo_name,
      logo_url: formData.logo_url,
      registration_number: formData.registration_number,
      year_established: formData.year_established ? parseInt(formData.year_established) : null,
      about_description: formData.about_description,
      beneficiary_groups: formData.beneficiary_groups,
      service_types: formData.service_types,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      contact_phone: formData.contact_phone,
      contact_email: formData.contact_email,
      website_url: formData.website_url,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      profile_complete: true
    })

    setSubmitting(false)
    if (error) {
      console.error(error)
      alert("An error occurred while saving your profile.")
    } else {
      window.location.href = '/ngo/dashboard'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const STEPS = [
    { num: 1, title: 'Basic Info', desc: 'Identity & Details' },
    { num: 2, title: 'Focus Areas', desc: 'Services & Beneficiaries' },
    { num: 3, title: 'Location & Contact', desc: 'Where you operate' },
    { num: 4, title: 'Capacity', desc: 'Scale of impact' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex font-sans">
      
      {/* Left Sidebar - Progress Tracker (Hidden on mobile) */}
      <div className="w-[340px] lg:w-[420px] bg-gray-50 dark:bg-[#111] border-r border-gray-200 dark:border-zinc-800 p-10 hidden md:flex flex-col relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16 relative z-10">
          <div className="w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-zinc-900/10 dark:shadow-white/10">
            N
          </div>
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            SahayaK <span className="text-zinc-500 dark:text-zinc-400 font-bold ml-1 text-sm">NGO Admin</span>
          </span>
        </div>

        {/* Steps Tracker */}
        <div className="relative z-10 flex-1">
          <h2 className="text-xs font-bold text-gray-400 dark:text-zinc-500 tracking-[0.2em] uppercase mb-10">Setup Progress</h2>
          <div className="space-y-10">
            {STEPS.map((s) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex gap-5 relative">
                  {/* Line connecting steps */}
                  {s.num !== 4 && (
                    <div className={`absolute top-12 left-[19px] w-[2px] h-[calc(100%-8px)] rounded-full transition-colors duration-500 ${isCompleted ? 'bg-zinc-900 dark:bg-white' : 'bg-gray-200 dark:bg-zinc-800'}`} />
                  )}
                  
                  {/* Step Indicator */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 z-10 ${
                    isCompleted 
                      ? 'bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10' 
                      : isCurrent 
                        ? 'bg-white dark:bg-black border-zinc-900 dark:border-white text-zinc-900 dark:text-white shadow-lg shadow-zinc-900/5' 
                        : 'bg-white dark:bg-[#111] border-gray-200 dark:border-zinc-700 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{s.num}</span>}
                  </div>

                  {/* Step Text */}
                  <div className={`pt-2 transition-all duration-500 ${isCurrent ? 'opacity-100 translate-x-0' : isCompleted ? 'opacity-70 translate-x-0' : 'opacity-40 translate-x-2'}`}>
                    <h3 className={`font-bold text-[15px] ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{s.title}</h3>
                    <p className="text-sm text-gray-500 mt-1.5">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col h-screen relative bg-white dark:bg-[#0A0A0A]">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-zinc-800 p-5 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg flex items-center justify-center font-black">N</div>
            <span className="font-bold text-gray-900 dark:text-white">Setup</span>
          </div>
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
            Step {step} of 4
          </div>
        </header>

        {/* Scrollable Form Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* STEP 1: BASIC INFO */}
            {step === 1 && (
              <div className="space-y-10">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Organization Profile</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Let's start with the basics of your NGO's identity.</p>
                </div>

                {/* Elegant Logo Upload Component */}
                <div className="flex items-center gap-6 p-6 lg:p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#111]/30">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-zinc-700 shadow-sm shrink-0 flex items-center justify-center relative group">
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
                    )}
                    
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer flex items-center justify-center backdrop-blur-sm">
                      <Camera className="w-6 h-6 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Organization Logo</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4 leading-relaxed">Upload a clear image of your logo. This helps volunteers instantly recognize your organization.</p>
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 transition-all shadow-sm">
                      <Upload className="w-4 h-4 text-gray-400" />
                      Choose Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 dark:text-white">Organization Name *</label>
                    <input 
                      type="text" 
                      value={formData.ngo_name} 
                      onChange={e => setFormData({...formData, ngo_name: e.target.value})}
                      className="w-full px-5 py-4 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-900 dark:focus:border-white transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none shadow-sm"
                      placeholder="e.g. Hope Foundation"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">Registration Number</label>
                      <input 
                        type="text" 
                        value={formData.registration_number} 
                        onChange={e => setFormData({...formData, registration_number: e.target.value})}
                        className="w-full px-5 py-4 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-900 dark:focus:border-white transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none shadow-sm"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">Year Established</label>
                      <input 
                        type="number" 
                        value={formData.year_established} 
                        onChange={e => setFormData({...formData, year_established: e.target.value})}
                        className="w-full px-5 py-4 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-900 dark:focus:border-white transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none shadow-sm"
                        placeholder="e.g. 2010"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 dark:text-white">About Description</label>
                    <textarea 
                      value={formData.about_description} 
                      onChange={e => setFormData({...formData, about_description: e.target.value})}
                      className="w-full px-5 py-4 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-900 dark:focus:border-white transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none min-h-[120px] resize-none shadow-sm"
                      placeholder="Briefly describe your mission and primary objectives..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: NGO TYPE */}
            {step === 2 && (
              <div className="space-y-10">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Focus Areas</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Classify your NGO to help match you with the right volunteers.</p>
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-5 rounded-2xl flex gap-4 text-zinc-800 dark:text-zinc-300 shadow-sm">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">Select all categories that apply to your organization. You must choose at least one item from both groups below.</p>
                </div>

                <div className="space-y-10">
                  <div className="space-y-5">
                    <h3 className="font-black text-gray-900 dark:text-white text-xl flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black text-xs flex items-center justify-center font-black">A</span>
                      Who do you primarily serve?
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {BENEFICIARY_GROUPS.map(bg => {
                        const isSelected = formData.beneficiary_groups.includes(bg);
                        return (
                          <button
                            key={bg}
                            onClick={() => toggleArrayItem('beneficiary_groups', bg)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                              isSelected
                                ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                                : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-900 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected && <Check className="w-4 h-4" />}
                              {bg}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h3 className="font-black text-gray-900 dark:text-white text-xl flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black text-xs flex items-center justify-center font-black">B</span>
                      What kind of support do you provide?
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {SERVICE_TYPES.map(st => {
                        const isSelected = formData.service_types.includes(st);
                        return (
                          <button
                            key={st}
                            onClick={() => toggleArrayItem('service_types', st)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                              isSelected
                                ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                                : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-900 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected && <Check className="w-4 h-4" />}
                              {st}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LOCATION & CONTACT */}
            {step === 3 && (
              <div className="space-y-10">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Location & Contact</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Where are you located and how can people reach you?</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-gray-900 dark:text-white">Full Address *</label>
                    <textarea 
                      value={formData.address} 
                      onChange={handleAddressChange}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full px-5 py-4 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-900 dark:focus:border-white transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none min-h-[100px] resize-none shadow-sm"
                      placeholder="Enter full office or shelter address..."
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {showSuggestions && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-sm font-medium text-gray-500">Searching locations...</div>
                        ) : suggestions.length > 0 ? (
                          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {suggestions.map((suggestion, idx) => (
                              <li 
                                key={idx} 
                                onClick={() => selectSuggestion(suggestion)}
                                className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-start gap-3 transition-colors"
                              >
                                <MapPin className="w-5 h-5 text-zinc-900 dark:text-white shrink-0 mt-0.5" />
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

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 dark:text-white flex justify-between items-end">
                      <span>Pin Location on Map *</span>
                      <span className="text-gray-500 text-xs font-medium">Drag marker to exact location</span>
                    </label>
                    <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-gray-300 dark:border-zinc-800 relative z-0 shadow-sm">
                      <DynamicLocationPicker 
                        centerPosition={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null}
                        onLocationSelect={(lat: number, lng: number) => setFormData({...formData, latitude: lat, longitude: lng})} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">Contact Phone *</label>
                      <input 
                        type="tel" 
                        value={formData.contact_phone} 
                        onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                        className="w-full px-5 py-4 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-900 dark:focus:border-white transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none shadow-sm"
                        placeholder="+91..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">Contact Email *</label>
                      <input 
                        type="email" 
                        value={formData.contact_email} 
                        onChange={e => setFormData({...formData, contact_email: e.target.value})}
                        className="w-full px-5 py-4 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-900 dark:focus:border-white transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none shadow-sm"
                        placeholder="admin@ngo.org"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">Website / Social Media</label>
                      <input 
                        type="url" 
                        value={formData.website_url} 
                        onChange={e => setFormData({...formData, website_url: e.target.value})}
                        className="w-full px-5 py-4 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-900 dark:focus:border-white transition-all font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none shadow-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CAPACITY */}
            {step === 4 && (
              <div className="space-y-10 min-h-[400px] flex flex-col justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white mx-auto rounded-full flex items-center justify-center mb-8 shadow-xl shadow-zinc-900/10 border border-zinc-200 dark:border-zinc-800">
                    <Users className="w-10 h-10" />
                  </div>
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4">Almost Done!</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-lg max-w-sm mx-auto">Just one final detail to help us understand the scale of your impact.</p>
                </div>

                <div className="max-w-sm mx-auto w-full pt-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-900 dark:text-white block text-center">Approximate number of people currently served</label>
                    <input 
                      type="number" 
                      value={formData.capacity} 
                      onChange={e => setFormData({...formData, capacity: e.target.value})}
                      className="w-full px-5 py-5 bg-white dark:bg-[#111] border border-gray-300 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-900 dark:focus:border-white transition-all font-black text-center text-3xl text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-700 outline-none shadow-sm"
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
        
        {/* Fixed Footer for Actions */}
        <div className="bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-zinc-800 p-6 px-6 lg:px-12 flex justify-between items-center z-10 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none">
          {step > 1 ? (
            <button 
              onClick={handleBack}
              className="px-6 py-3.5 font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          ) : <div />}
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="px-8 py-3.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white font-bold rounded-xl shadow-lg shadow-zinc-900/10 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Complete Profile'}
              {!submitting && <ArrowRight className="w-5 h-5" />}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
