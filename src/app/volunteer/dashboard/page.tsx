'use client'

import { useState, useEffect } from 'react'
import { LogoutButton } from '@/components/LogoutButton'
import DynamicTaskMap from '@/components/map/DynamicTaskMap'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Database } from '@/types/database.types'
import { calculateDistance } from '@/lib/utils'

// Components
import { StatsBar } from '@/components/volunteer/StatsBar'
import { FilterBar } from '@/components/volunteer/FilterBar'
import { TaskCard } from '@/components/volunteer/TaskCard'
// ... (previous imports) ...
import { LeaderboardWidget } from '@/components/volunteer/LeaderboardWidget'
import { CompletionModal } from '@/components/volunteer/CompletionModal'
import { LocationPromptModal } from '@/components/volunteer/LocationPromptModal'
import { TaskDetailsModal } from '@/components/volunteer/TaskDetailsModal'

type Task = Database['public']['Tables']['tasks']['Row'] & { profiles: { full_name: string } | null }
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
        .select(`*, profiles!tasks_seeker_id_fkey(full_name)`)
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
        .select(`*, profiles!tasks_seeker_id_fkey(full_name)`)
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
        .select('id, full_name, help_score, tasks_completed')
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
    if (category !== 'all' && task.category !== category) return false
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
    <div className="max-w-7xl mx-auto space-y-10 p-4 md:p-10 relative">
      <LocationPromptModal 
        isOpen={showLocationPrompt}
        onSelectLiveLocation={handleLiveLocation}
        onSelectManualLocation={handleManualLocation}
      />
      <div className="absolute top-20 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 p-8 rounded-[2rem] shadow-xl border border-white/60 dark:border-white/10 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-200 dark:to-indigo-500 tracking-tight">Volunteer Mission Control</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">Browse open requests nearby. Every accepted task earns you Help Score points.</p>
        </div>
        <LogoutButton />
      </div>

      <StatsBar 
        helpScore={userProfile?.help_score || 0} 
        tasksCompleted={userProfile?.tasks_completed || 0} 
        activeTasksCount={activeTasks?.length || 0} 
      />

      <FilterBar 
        category={category} 
        setCategory={setCategory} 
        distance={distanceFilter} 
        setDistance={setDistanceFilter} 
        isUrgentOnly={isUrgentOnly} 
        setIsUrgentOnly={setIsUrgentOnly} 
      />

      {isLoadingTasks ? (
        <div className="h-[600px] w-full bg-white/40 dark:bg-zinc-800/40 backdrop-blur-xl animate-pulse rounded-[2.5rem] border border-white/40 dark:border-zinc-700/50 shadow-2xl relative z-10"></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 relative z-0 h-[650px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/60 dark:border-zinc-800/50 flex flex-col bg-white dark:bg-zinc-900">
            <div className="flex-1 w-full relative">
              <DynamicTaskMap 
                tasks={filteredTasks || []} 
                userLocation={mapCenter} 
                onTaskSelect={(t: Task) => setSelectedTaskDetails(t)} 
              />
            </div>
            
            {userLocation?.addressText && (
              <div className="p-5 md:p-6 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl text-indigo-600 dark:text-indigo-400 shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Selected Location</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{userLocation.addressText}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLocationPrompt(true)}
                  className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-xl font-bold transition-colors shrink-0"
                >
                  Change Location
                </button>
              </div>
            )}
          </div>
          
          <div className="backdrop-blur-2xl bg-white/70 dark:bg-zinc-900/70 rounded-[2.5rem] border border-white/60 dark:border-zinc-700/50 shadow-2xl flex flex-col h-[650px] overflow-hidden">
            <div className="p-8 border-b border-white/40 dark:border-zinc-700/50 bg-white/30 dark:bg-black/20">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center justify-between">
                <span>Nearby Requests</span>
                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 py-1.5 px-4 rounded-full text-sm font-bold shadow-sm">
                  {filteredTasks?.length || 0}
                </span>
              </h2>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {filteredTasks?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 text-center">
                  <span className="text-5xl drop-shadow-md">🌟</span>
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
      )}

      {/* Active Tasks & Leaderboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white pl-4 border-l-4 border-indigo-500">My Active Tasks</h2>
          {activeTasks?.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/40 dark:bg-zinc-900/40 border border-white/60 dark:border-zinc-700/50 rounded-[2rem] p-10 text-center shadow-lg">
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">You have no active tasks right now. Accept a request above to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTasks?.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  isActive={true} 
                  onCompleteClick={(t) => setTaskToComplete(t)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <LeaderboardWidget leaders={leaderboard as any || []} />
        </div>
      </div>

      <CompletionModal 
        isOpen={!!taskToComplete} 
        onClose={() => setTaskToComplete(null)} 
        taskTitle={taskToComplete?.title || ''}
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

