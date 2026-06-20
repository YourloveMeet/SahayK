'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCircle, Building, Mail, Phone, MapPin, CheckCircle, Upload } from 'lucide-react'

export default function NGOProfilePage() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    ngo_name: '',
    about_description: '',
    address: '',
    contact_phone: '',
    contact_email: '',
    website_url: '',
    capacity: '',
    registration_number: ''
  })

  const { data: profile, isLoading } = useQuery({
    queryKey: ['ngoProfileFull'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      
      const { data, error } = await supabase
        .from('ngo_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        
      if (error) throw error
      return data
    }
  })

  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        ngo_name: profile.ngo_name || '',
        about_description: profile.about_description || '',
        address: profile.address || '',
        contact_phone: profile.contact_phone || '',
        contact_email: profile.contact_email || '',
        website_url: profile.website_url || '',
        capacity: profile.capacity ? String(profile.capacity) : '',
        registration_number: profile.registration_number || ''
      })
    }
  }, [profile, isEditing])

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from('ngo_profiles')
        .update({
          ngo_name: formData.ngo_name,
          about_description: formData.about_description,
          address: formData.address,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          website_url: formData.website_url,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          registration_number: formData.registration_number
        })
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoProfileFull'] })
      queryClient.invalidateQueries({ queryKey: ['ngoProfile'] })
      queryClient.invalidateQueries({ queryKey: ['ngo_profile_status'] })
      setIsEditing(false)
    }
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
        <div className="w-8 h-8 border-4 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 bg-zinc-50 dark:bg-[#09090b] min-h-screen text-zinc-900 dark:text-zinc-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
            NGO Profile
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Manage your organization's details and public presence.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-5 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold rounded-xl transition-all shadow-sm w-fit"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setIsEditing(false);
                // Reset form to profile data
                if (profile) {
                  setFormData({
                    ngo_name: profile.ngo_name || '',
                    about_description: profile.about_description || '',
                    address: profile.address || '',
                    contact_phone: profile.contact_phone || '',
                    contact_email: profile.contact_email || '',
                    website_url: profile.website_url || '',
                    capacity: profile.capacity ? String(profile.capacity) : '',
                    registration_number: profile.registration_number || ''
                  })
                }
              }}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold rounded-xl transition-all shadow-sm w-fit"
            >
              Cancel
            </button>
            <button 
              onClick={() => updateProfileMutation.mutate()}
              disabled={updateProfileMutation.isPending}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 w-fit disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-10 shadow-sm">
        
        {/* Header/Avatar Area */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10 pb-10 border-b border-zinc-100 dark:border-zinc-800">
          <div className="shrink-0 relative group">
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="Logo" className="w-32 h-32 rounded-3xl object-cover bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-800 shadow-sm" />
            ) : (
              <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                <Building className="w-12 h-12 text-zinc-400" />
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-6 h-6 text-white mb-1" />
                <span className="text-white text-xs font-bold">Update Logo</span>
              </div>
            )}
          </div>
          <div className="space-y-4 w-full">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Organization Name</label>
              {isEditing ? (
                <input type="text" value={formData.ngo_name} onChange={e => setFormData({...formData, ngo_name: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-lg focus:ring-2 outline-none dark:text-white" />
              ) : (
                <p className="text-2xl font-black">{profile?.ngo_name || 'Not provided'}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">About / Description</label>
              {isEditing ? (
                <textarea rows={3} value={formData.about_description} onChange={e => setFormData({...formData, about_description: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 outline-none resize-none dark:text-white" />
              ) : (
                <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">{profile?.about_description || 'No description provided.'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-4 h-4" /> Contact Email
            </label>
            {isEditing ? (
              <input type="email" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 outline-none dark:text-white" />
            ) : (
              <p className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-transparent font-medium">{profile?.contact_email || 'Not provided'}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact Phone
            </label>
            {isEditing ? (
              <input type="text" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 outline-none dark:text-white" />
            ) : (
              <p className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-transparent font-medium">{profile?.contact_phone || 'Not provided'}</p>
            )}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Address
            </label>
            {isEditing ? (
              <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 outline-none resize-none dark:text-white" />
            ) : (
              <p className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-transparent font-medium">{profile?.address || 'Not provided'}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Registration Number</label>
            {isEditing ? (
              <input type="text" value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 outline-none dark:text-white" />
            ) : (
              <p className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-transparent font-medium">{profile?.registration_number || 'Not provided'}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Capacity (Residents)</label>
            {isEditing ? (
              <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 outline-none dark:text-white" />
            ) : (
              <p className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-transparent font-medium">{profile?.capacity || 'Not provided'}</p>
            )}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Website URL</label>
            {isEditing ? (
              <input type="url" value={formData.website_url} onChange={e => setFormData({...formData, website_url: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 outline-none dark:text-white" />
            ) : (
              <p className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-transparent font-medium text-blue-600 dark:text-blue-400">
                {profile?.website_url ? <a href={profile.website_url} target="_blank" rel="noreferrer" className="hover:underline">{profile.website_url}</a> : 'Not provided'}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
