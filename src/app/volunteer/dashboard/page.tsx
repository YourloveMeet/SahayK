'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import DynamicTaskMap from '@/components/map/DynamicTaskMap'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Database } from '@/types/database.types'
import { calculateDistance } from '@/lib/utils'

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
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; addressText?: string } | null>(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(true) // Show on initial load
  
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
      // Complete the task
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          completion_note: note,
          completion_proof_url: proofUrl
        })
        .eq('id', taskId)
      if (taskError) throw taskError

      // Increment Volunteer Stats
      if (userProfile) {
        const pointsEarned = isUrgent ? 20 : 10;
        const newScore = (userProfile.help_score || 0) + pointsEarned;
        const newTasksCompleted = (userProfile.tasks_completed || 0) + 1;

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
             help_score: newScore,
             tasks_completed: newTasksCompleted
          })
          .eq('id', userProfile.id)
        if (profileError) throw profileError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      setTaskToComplete(null)
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

  // Filtering Logic
  const getDistance = (lat: number | null, lng: number | null) => {
    if (!userLocation || !lat || !lng) return undefined
    return calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
  }

  const filteredTasks = openTasks?.filter(task => {
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

  // Prepare map center
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : undefined

  return (
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

      <CompletionModal 
        isOpen={!!taskToComplete} 
        onClose={() => setTaskToComplete(null)} 
        taskTitle={taskToComplete?.title || ''}
        isErrand={taskToComplete?.category === 'errands' || (taskToComplete?.category === 'other' && taskToComplete?.errand_details !== null)}
        onSubmit={(note, proofUrl) => {
          if (taskToComplete) {
            completeTaskMutation.mutate({ 
              taskId: taskToComplete.id, 
              note, 
              proofUrl,
              isUrgent: !!taskToComplete.is_urgent
            })
          }
        }}
      />

      <TaskDetailsModal
        isOpen={!!selectedTaskDetails}
        onClose={() => setSelectedTaskDetails(null)}
        task={selectedTaskDetails}
        distance={selectedTaskDetails ? getDistance(selectedTaskDetails.latitude, selectedTaskDetails.longitude) : undefined}
        onAccept={(taskId) => acceptTaskMutation.mutate(taskId)}
      />
    </div>
  )
}
