'use client'

import React, { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { Globe, Search, SlidersHorizontal, MapPin, Phone, Mail, Building, X } from 'lucide-react'
import Link from 'next/link'

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function NGONetworkPage() {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [radius, setRadius] = useState<number | null>(null)
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const { data: myProfile } = useQuery({
    queryKey: ['myNgoProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('ngo_profiles').select('id, latitude, longitude').eq('user_id', user.id).single()
      return data
    }
  })

  const { data: allNGOs, isLoading } = useQuery({
    queryKey: ['ngoDirectory'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_profiles')
        .select('id, ngo_name, about_description, address, contact_phone, contact_email, logo_url, beneficiary_groups, service_types, latitude, longitude')
        .eq('profile_complete', true)
      return data || []
    }
  })

  // Gather all unique tags
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
    let results = allNGOs.filter(n => n.id !== myProfile?.id)

    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(n => n.ngo_name?.toLowerCase().includes(q))
    }
    if (selectedBeneficiaries.length > 0) {
      results = results.filter(n => selectedBeneficiaries.some(b => (n.beneficiary_groups || []).includes(b)))
    }
    if (selectedServices.length > 0) {
      results = results.filter(n => selectedServices.some(s => (n.service_types || []).includes(s)))
    }

    // Add distance
    const withDist = results.map(n => {
      let distance: number | null = null
      if (myProfile?.latitude && myProfile?.longitude && n.latitude && n.longitude) {
        distance = haversineDistance(myProfile.latitude, myProfile.longitude, n.latitude, n.longitude)
      }
      return { ...n, distance }
    })

    // Filter by radius
    let radiusFiltered = withDist
    if (radius !== null) {
      radiusFiltered = withDist.filter(n => n.distance === null || n.distance <= radius)
    }

    // Sort: by distance if available, else alphabetically
    return radiusFiltered.sort((a, b) => {
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
            NGO Network
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Discover and connect with NGOs near you.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-3 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border font-bold transition-all flex items-center gap-2 ${showFilters ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Radius */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Distance Radius</h3>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 25, null].map(r => (
                  <button
                    key={r ?? 'all'}
                    onClick={() => setRadius(r)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${radius === r ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
                  >
                    {r ? `${r}km` : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Beneficiaries */}
            {allBeneficiaries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Beneficiary Group</h3>
                <div className="flex flex-wrap gap-2">
                  {allBeneficiaries.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag, selectedBeneficiaries, setSelectedBeneficiaries)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedBeneficiaries.includes(tag) ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {allServices.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Service Type</h3>
                <div className="flex flex-wrap gap-2">
                  {allServices.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag, selectedServices, setSelectedServices)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedServices.includes(tag) ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {(selectedBeneficiaries.length > 0 || selectedServices.length > 0 || radius !== null) && (
            <button onClick={() => { setSelectedBeneficiaries([]); setSelectedServices([]); setRadius(null) }}
              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700">
              <X className="w-4 h-4" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      <div>
        <p className="text-sm font-bold text-zinc-500 mb-6">
          {isLoading ? 'Loading...' : `${filtered.length} NGO${filtered.length !== 1 ? 's' : ''} found`}
        </p>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <Globe className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-xl font-bold">No NGOs found</h3>
            <p className="text-zinc-500 mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(ngo => (
              <Link key={ngo.id} href={`/ngo/network/${ngo.id}`}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all">
                <div className="flex items-start gap-4 mb-5">
                  {ngo.logo_url ? (
                    <img src={ngo.logo_url} alt={ngo.ngo_name} className="w-14 h-14 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Building className="w-7 h-7 text-zinc-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-black text-lg text-zinc-900 dark:text-white group-hover:underline truncate">{ngo.ngo_name}</h3>
                    {ngo.distance !== null && (
                      <div className="flex items-center gap-1 text-xs font-bold text-zinc-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {ngo.distance < 1 ? `${Math.round(ngo.distance * 1000)}m` : `${ngo.distance.toFixed(1)}km`} away
                      </div>
                    )}
                  </div>
                </div>

                {ngo.about_description && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 mb-4">{ngo.about_description}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(ngo.beneficiary_groups || []).slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md">{tag}</span>
                  ))}
                  {(ngo.service_types || []).slice(0, 2).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 text-[11px] font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md">{tag}</span>
                  ))}
                </div>

                {ngo.address && (
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium truncate">
                    <MapPin className="w-3 h-3 shrink-0" />{ngo.address}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
