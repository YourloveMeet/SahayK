'use client'

import React, { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { Globe, Search, SlidersHorizontal, MapPin, Building, X, Heart } from 'lucide-react'
import Link from 'next/link'

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function DonorDashboardPage() {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [radius, setRadius] = useState<number | null>(null)
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const { data: myProfile } = useQuery({
    queryKey: ['donorProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('profiles').select('id, full_name, latitude, longitude').eq('id', user.id).single()
      return data
    }
  })

  const { data: allNGOs, isLoading } = useQuery({
    queryKey: ['ngoDirectoryDonor'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_profiles')
        .select('id, ngo_name, about_description, address, logo_url, beneficiary_groups, service_types, latitude, longitude, gallery_image_urls')
        .eq('profile_complete', true)
      return data || []
    }
  })

  const allBeneficiaries = useMemo(() => {
    const tags = new Set<string>()
    allNGOs?.forEach(n => (n.beneficiary_groups || []).forEach((t: string) => tags.add(t)))
    return Array.from(tags).sort()
  }, [allNGOs])

  const allServices = useMemo(() => {
    const tags = new Set<string>()
    allNGOs?.forEach(n => (n.service_types || []).forEach((t: string) => tags.add(t)))
    return Array.from(tags).sort()
  }, [allNGOs])

  const filtered = useMemo(() => {
    if (!allNGOs) return []
    let results = [...allNGOs]
    if (search.trim()) results = results.filter(n => n.ngo_name?.toLowerCase().includes(search.toLowerCase()))
    if (selectedBeneficiaries.length) results = results.filter(n => selectedBeneficiaries.some(b => (n.beneficiary_groups || []).includes(b)))
    if (selectedServices.length) results = results.filter(n => selectedServices.some(s => (n.service_types || []).includes(s)))

    const withDist = results.map(n => {
      let distance: number | null = null
      if (myProfile?.latitude && myProfile?.longitude && n.latitude && n.longitude) {
        distance = haversineDistance(myProfile.latitude, myProfile.longitude, n.latitude, n.longitude)
      }
      return { ...n, distance }
    })

    if (radius !== null) return withDist.filter(n => n.distance === null || n.distance <= radius)
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))

    return withDist.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance
      if (a.distance !== null) return -1
      if (b.distance !== null) return 1
      return (a.ngo_name || '').localeCompare(b.ngo_name || '')
    })
  }, [allNGOs, myProfile, search, radius, selectedBeneficiaries, selectedServices])

  const toggleTag = (tag: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag])
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Heart className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
            Discover NGOs
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Find organizations doing incredible work near you.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-3 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border font-bold transition-all ${showFilters ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700'}`}>
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Distance</h3>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 25, null].map(r => (
                  <button key={r ?? 'all'} onClick={() => setRadius(r)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${radius === r ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600'}`}>
                    {r ? `${r}km` : 'All'}
                  </button>
                ))}
              </div>
            </div>
            {allBeneficiaries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Who They Help</h3>
                <div className="flex flex-wrap gap-2">
                  {allBeneficiaries.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag, selectedBeneficiaries, setSelectedBeneficiaries)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedBeneficiaries.includes(tag) ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {allServices.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {allServices.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag, selectedServices, setSelectedServices)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedServices.includes(tag) ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {(selectedBeneficiaries.length > 0 || selectedServices.length > 0 || radius !== null) && (
            <button onClick={() => { setSelectedBeneficiaries([]); setSelectedServices([]); setRadius(null) }}
              className="flex items-center gap-2 text-sm font-bold text-red-500">
              <X className="w-4 h-4" /> Clear all
            </button>
          )}
        </div>
      )}

      <p className="text-sm font-bold text-zinc-500">{isLoading ? 'Loading...' : `${filtered.length} NGO${filtered.length !== 1 ? 's' : ''} found`}</p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <Globe className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-xl font-bold">No NGOs found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(ngo => (
            <Link key={ngo.id} href={`/donor/ngo/${ngo.id}`}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all">
              {/* Gallery preview or plain header */}
              {(ngo.gallery_image_urls as string[] || []).length > 0 ? (
                <div className="h-36 overflow-hidden">
                  <img src={(ngo.gallery_image_urls as string[])[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-12 bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-800 dark:to-zinc-900" />
              )}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  {ngo.logo_url ? (
                    <img src={ngo.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5 text-zinc-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-black text-zinc-900 dark:text-white group-hover:underline truncate">{ngo.ngo_name}</h3>
                    {ngo.distance !== null && (
                      <div className="flex items-center gap-1 text-xs font-bold text-zinc-400">
                        <MapPin className="w-3 h-3" />
                        {ngo.distance < 1 ? `${Math.round(ngo.distance * 1000)}m` : `${ngo.distance.toFixed(1)}km`}
                      </div>
                    )}
                  </div>
                </div>
                {ngo.about_description && <p className="text-sm text-zinc-500 line-clamp-2 mb-3 font-medium">{ngo.about_description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {(ngo.beneficiary_groups || []).slice(0, 2).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
