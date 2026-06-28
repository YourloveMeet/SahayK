'use client'

import { useState, useEffect, useMemo } from 'react'
import { Star, MapPin } from 'lucide-react'
import DynamicTaskMap from '@/components/map/DynamicTaskMap'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Database } from '@/types/database.types'
import { calculateDistance } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

// Components
import { StatsBar } from '@/components/volunteer/StatsBar'
import { FilterBar } from '@/components/volunteer/FilterBar'
import { TaskCard } from '@/components/volunteer/TaskCard'
import { LeaderboardWidget } from '@/components/volunteer/LeaderboardWidget'
import { CompletionModal } from '@/components/volunteer/CompletionModal'
import { LocationPromptModal } from '@/components/volunteer/LocationPromptModal'
import { TaskDetailsModal } from '@/components/volunteer/TaskDetailsModal'

type Task = Database['public']['Tables']['tasks']['Row'] & { profiles: { full_name: string, avatar_url: string | null } | null }
type Profile = Database['public']['Tables']['profiles']['Row']

export default function VolunteerDashboard() {
  const isMobile = useIsMobile()
  const supabase = createClient()
  const queryClient = useQueryClient()

  // State setup
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; addressText?: string } | null>(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(true) // Show on initial load
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Filters
  const [category, setCategory] = useState('all')
  const [distanceFilter, setDistanceFilter] = useState(10) // 10km default
  const [isUrgentOnly, setIsUrgentOnly] = useState(false)

  // Modals
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null)
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null)

  // Check Local Storage for Existing Location
  useEffect(() => {
    const savedLocation = localStorage.getItem('volunteer_location');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setUserLocation(parsed);
        setShowLocationPrompt(false);
      } catch (e) {
        console.error("Failed to parse saved location", e);
      }
    }
  }, []);

  // Fetch Current User Profile
  const { data: userProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data as Profile
    }
  })

  // Fetch Open Tasks
  const { data: openTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', 'open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`*, profiles!tasks_seeker_id_fkey(full_name, avatar_url, phone)`)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as Task[]
    }
  })

  // Fetch Active Tasks (Accepted)
  const { data: activeTasks } = useQuery({
    queryKey: ['tasks', 'active', userProfile?.id],
    enabled: !!userProfile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`*, profiles!tasks_seeker_id_fkey(full_name, avatar_url, phone)`)
        .eq('status', 'accepted')
        .eq('volunteer_id', userProfile?.id || '')
        .order('accepted_at', { ascending: false })
      if (error) throw error
      return data as unknown as Task[]
    }
  })

  // Fetch Leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, help_score, tasks_completed, avatar_url, phone')
        .order('help_score', { ascending: false, nullsFirst: false })
        .limit(5)
      if (error) throw error
      return data
    }
  })

  // Mutations
  const acceptTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'accepted', 
          volunteer_id: userProfile?.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'open'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'active'] })
      setSelectedTaskDetails(null)
    }
  })

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, statusDetail }: { taskId: string, statusDetail: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ task_status_detail: statusDetail })
        .eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'active'] })
    }
  })

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, note, proofUrl, isUrgent }: { taskId: string, note: string, proofUrl: string, isUrgent: boolean }) => {
      // Mark as delivered (awaiting seeker confirmation)
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ 
          task_status_detail: 'delivered',
          completion_proof_url: proofUrl
        })
        .eq('id', taskId)
      if (taskError) throw taskError

      // Wait for Seeker to confirm before awarding points
      // We will move the point awarding to the Seeker confirmation step.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'active'] })
      setTaskToComplete(null)
      setSelectedImage(null)
    }
  })

  // Location Handlers
  const handleLiveLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let addressText = 'Your Location';

          try {
            const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lng},${lat}`);
            const data = await res.json();
            if (data?.address?.LongLabel) {
              addressText = data.address.LongLabel;
            }
          } catch (err) {
            console.error('Reverse geocoding failed', err);
          }

          const loc = { lat, lng, addressText };
          setUserLocation(loc);
          localStorage.setItem('volunteer_location', JSON.stringify(loc));
          setShowLocationPrompt(false);
        },
        (error) => {
          console.error("Error getting location", error)
          alert("Could not get live location. Please select manually.")
        }
      )
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }

  const handleManualLocation = (lat: number, lng: number, addressText: string) => {
    const loc = { lat, lng, addressText };
    setUserLocation(loc);
    localStorage.setItem('volunteer_location', JSON.stringify(loc));
    setShowLocationPrompt(false);
  }

  // Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSimulateUpload = () => {
    if (taskToComplete && selectedImage) {
      completeTaskMutation.mutate({ 
        taskId: taskToComplete.id, 
        note: 'Task completed via dashboard', 
        proofUrl: selectedImage,
        isUrgent: !!taskToComplete.is_urgent
      })
    }
  }

  // Filtering Logic
  const getDistance = (lat: number | null, lng: number | null) => {
    if (!userLocation || !lat || !lng) return undefined
    return calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
  }

  const filteredTasks = useMemo(() => {
    return openTasks?.filter(task => {
      let effectiveCategory = task.category
      if (task.category === 'other' && task.errand_details) {
        effectiveCategory = 'errands'
      }

      if (category !== 'all' && effectiveCategory !== category) return false
      if (isUrgentOnly && !task.is_urgent) return false
      
      // Only filter by distance if user location is set
      if (userLocation) {
        const dist = getDistance(task.latitude, task.longitude)
        if (dist !== undefined && dist > distanceFilter) return false
      }
      
      return true
    }).sort((a, b) => {
      const distA = getDistance(a.latitude, a.longitude)
      const distB = getDistance(b.latitude, b.longitude)
      if (distA !== undefined && distB !== undefined) return distA - distB
      return 0
    })
  }, [openTasks, category, isUrgentOnly, userLocation, distanceFilter])

  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : undefined

  // Upload Modal Component
  const UploadModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative zoom-in-95 animate-in duration-200">
        <button 
          onClick={() => { setTaskToComplete(null); setSelectedImage(null); }} 
          className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <Camera className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-black dark:text-white mb-2">Upload Proof of Delivery</h2>
        <p className="text-zinc-500 text-sm mb-6">Please attach a photo to confirm the task is complete. The seeker will review this to finalize the request.</p>
        
        {!selectedImage ? (
          <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <Upload className="w-10 h-10 text-zinc-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-sm text-zinc-600 dark:text-zinc-300">Click to upload photo</p>
            <p className="text-xs text-zinc-400 mt-1">JPEG, PNG, or WEBP</p>
          </label>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <img src={selectedImage} alt="Preview" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <button 
                 onClick={() => setSelectedImage(null)}
                 className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-colors"
               >
                 Remove Image
               </button>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleSimulateUpload} 
          disabled={completeTaskMutation.isPending || !selectedImage} 
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold h-14 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
        >
          {completeTaskMutation.isPending ? 'Uploading...' : 'Submit Photo'}
        </button>
      </div>
    </div>
  )

  // ==========================================
  // DESKTOP LAYOUT (ORIGINAL RESTORED)
  // ==========================================
  const DesktopDashboard = () => (
    <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 relative">
      <LocationPromptModal 
        isOpen={showLocationPrompt}
        onSelectLiveLocation={handleLiveLocation}
        onSelectManualLocation={handleManualLocation}
      />
      
      {/* Background Orbs */}
      <div className="fixed top-20 left-0 w-[500px] h-[500px] bg-gray-300/10 dark:bg-gray-700/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-20 right-0 w-[500px] h-[500px] bg-gray-300/10 dark:bg-gray-700/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Top Bar: Title & Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        <div className="xl:col-span-4 backdrop-blur-xl bg-white/60 dark:bg-black/60 p-8 rounded-[1rem] shadow-sm border border-gray-200 dark:border-zinc-800 flex flex-col justify-center transition-all hover:shadow-md">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Volunteer Mission Control</h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">Browse open requests nearby and make an impact.</p>
        </div>
        <div className="xl:col-span-8 flex items-stretch">
          <div className="w-full h-full flex flex-col justify-center">
             <StatsBar 
               helpScore={userProfile?.help_score || 0} 
               tasksCompleted={userProfile?.tasks_completed || 0} 
               activeTasksCount={activeTasks?.length || 0} 
             />
          </div>
        </div>
      </div>

      {isLoadingTasks ? (
        <div className="h-[600px] w-full bg-white/40 dark:bg-zinc-800/40 backdrop-blur-xl animate-pulse rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-2xl relative z-10"></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
          
          {/* Left Sidebar: Feed & Filters (4 Columns) */}
          <div className="xl:col-span-4 flex flex-col gap-6 h-[800px]">
            <FilterBar 
              category={category} 
              setCategory={setCategory} 
              distance={distanceFilter} 
              setDistance={setDistanceFilter} 
              isUrgentOnly={isUrgentOnly} 
              setIsUrgentOnly={setIsUrgentOnly} 
            />
            
            <div className="flex-1 overflow-y-auto backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md flex flex-col">
              <div className="sticky top-0 z-10 p-6 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center justify-between">
                  <span>Nearby Requests</span>
                  <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 py-1 px-3 rounded-full text-sm font-bold shadow-sm">
                    {filteredTasks?.length || 0}
                  </span>
                </h2>
              </div>
              <div className="p-6 space-y-6 flex-1">
                {filteredTasks?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 text-center mt-20">
                    <Star className="w-16 h-16 text-gray-300 dark:text-zinc-700 drop-shadow-md" />
                    <p className="font-medium text-lg">No requests match your filters.<br/>Try expanding your search!</p>
                  </div>
                ) : (
                  filteredTasks?.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      distance={getDistance(task.latitude, task.longitude)}
                      onViewClick={(t) => setSelectedTaskDetails(t)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Map & Active/Leaderboard (8 Columns) */}
          <div className="xl:col-span-8 flex flex-col gap-6 h-[850px]">
            
            {/* Top Right: Active Tasks & Leaderboard Split */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
              
              {/* Active Tasks Panel */}
              <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md flex flex-col overflow-hidden h-full">
                <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
                   <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center justify-between">
                     <span>My Active Tasks</span>
                     <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 py-1 px-3 rounded-full text-sm font-bold shadow-sm">
                        {activeTasks?.length || 0}
                     </span>
                   </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  {activeTasks?.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center p-6">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">You have no active tasks right now. Accept a request to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeTasks?.map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          isActive={true} 
                          onCompleteClick={(t) => setTaskToComplete(t)}
                          onUpdateStatus={(taskId, newStatus) => updateTaskStatusMutation.mutate({ taskId, statusDetail: newStatus })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Leaderboard Panel */}
              <div className="h-full overflow-hidden">
                <LeaderboardWidget leaders={leaderboard as any || []} />
              </div>

            </div>

            {/* Bottom Right: Compact Interactive Map */}
            <div className="h-[280px] shrink-0 relative rounded-[1rem] overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-black">
              <div className="flex-1 w-full relative">
                <DynamicTaskMap 
                  tasks={filteredTasks || []} 
                  userLocation={mapCenter} 
                  onTaskSelect={(t: Task) => setSelectedTaskDetails(t)} 
                />
              </div>
              {userLocation?.addressText && (
                <div className="p-4 md:p-5 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-xl text-gray-900 dark:text-white shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Your Selected Location</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{userLocation.addressText}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowLocationPrompt(true)}
                    className="px-6 py-3 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold transition-colors shrink-0 shadow-lg"
                  >
                    Change Location
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ==========================================
  // MOBILE LAYOUT (SOCIAL FEED)
  // ==========================================
  const MobileDashboard = () => (
    <div className="flex flex-col gap-6 w-full px-4 pt-6 pb-20 bg-slate-50 dark:bg-[#0A0A0A] min-h-screen">
      <LocationPromptModal isOpen={showLocationPrompt} onSelectLiveLocation={handleLiveLocation} onSelectManualLocation={handleManualLocation} />

      {/* Header & Location */}
      <div className="flex flex-col gap-3 mb-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Volunteer'}
        </h1>
        <button 
          onClick={() => setShowLocationPrompt(true)}
          className="flex items-center gap-2 w-fit px-4 py-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 font-bold hover:scale-105 transition-transform"
        >
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="truncate max-w-[200px]">{userLocation?.addressText || 'Set your location'}</span>
        </button>
      </div>

      {/* Active Task (If Any) */}
      {activeTasks && activeTasks.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          <h2 className="text-sm uppercase font-black tracking-widest text-blue-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Active Mission
          </h2>
          {activeTasks.map(task => (
            <div key={task.id} className="ring-2 ring-blue-500/50 rounded-2xl shadow-lg">
              <TaskCard task={task} isActive={true} onCompleteClick={(t) => setTaskToComplete(t)} onUpdateStatus={(taskId, newStatus) => updateTaskStatusMutation.mutate({ taskId, statusDetail: newStatus })} />
            </div>
          ))}
        </div>
      )}

      {/* Feed Divider / Filters */}
      <div className="sticky top-16 z-30 pt-4 pb-2 bg-slate-50/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/50">
         <FilterBar category={category} setCategory={setCategory} distance={distanceFilter} setDistance={setDistanceFilter} isUrgentOnly={isUrgentOnly} setIsUrgentOnly={setIsUrgentOnly} />
      </div>

      {/* Tasks Feed */}
      <div className="flex flex-col gap-6">
        {isLoadingTasks ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-[1.5rem]"></div>)
        ) : filteredTasks?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-gray-200 dark:border-zinc-800">
            <Star className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-4" />
            <p className="font-bold text-lg text-gray-900 dark:text-white">You're all caught up!</p>
            <p className="text-sm mt-1">No new requests match your filters right now.</p>
          </div>
        ) : (
          filteredTasks?.map(task => (
            <TaskCard key={task.id} task={task} distance={getDistance(task.latitude, task.longitude)} onViewClick={(t) => setSelectedTaskDetails(t)} />
          ))
        )}
      </div>
    </div>
  )

  return (
    <>
      {isMobile ? <MobileDashboard /> : <DesktopDashboard />}

      {taskToComplete && <UploadModal />}

      <TaskDetailsModal
        isOpen={!!selectedTaskDetails}
        onClose={() => setSelectedTaskDetails(null)}
        task={selectedTaskDetails}
        distance={selectedTaskDetails ? getDistance(selectedTaskDetails.latitude, selectedTaskDetails.longitude) : undefined}
        onAccept={(taskId) => acceptTaskMutation.mutate(taskId)}
      />
    </>
  )
}
