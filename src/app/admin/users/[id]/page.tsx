'use client'

import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, UserCircle, ShieldCheck, MapPin, Phone, Briefcase, Calendar, HeartHandshake, CheckCircle, Activity, Globe } from 'lucide-react'

export default function AdminUserDetailsPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  const router = useRouter()
  const supabase = createClient()

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (error) throw error
      return data
    }
  })

  // Volunteer Data (Tasks they accepted)
  const { data: volunteerTasks } = useQuery({
    queryKey: ['volunteerTasks', id],
    enabled: profile?.role === 'volunteer',
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('*').eq('volunteer_id', id).order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  // Donor Data (Donations made)
  const { data: donorDonations } = useQuery({
    queryKey: ['donorDonations', id],
    enabled: profile?.role === 'donor',
    queryFn: async () => {
      const { data, error } = await supabase.from('donations').select('*').eq('donor_id', id).order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  // Seeker Data (Tasks created + financial requests)
  const { data: seekerTasks } = useQuery({
    queryKey: ['seekerTasks', id],
    enabled: profile?.role === 'seeker',
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('*').eq('seeker_id', id).order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const { data: seekerRequests } = useQuery({
    queryKey: ['seekerRequests', id],
    enabled: profile?.role === 'seeker',
    queryFn: async () => {
      const { data, error } = await supabase.from('seeker_financial_requests').select('*').eq('seeker_id', id).order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  // Activity Logs
  const { data: activityLogs } = useQuery({
    queryKey: ['activityLogs', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('activity_logs').select('*').eq('user_id', id).order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  if (isProfileLoading) {
    return <div className="p-20 flex justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!profile) {
    return <div className="p-20 text-center text-white">User not found.</div>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Back & Header */}
      <div className="flex items-center gap-4 text-white">
        <button onClick={() => router.back()} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black">User Profile Overview</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">{profile.role} Workflow</p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-zinc-800 shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserCircle className="w-full h-full text-zinc-600 p-4" />
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-2">
              {profile.full_name}
              {profile.verification_status === 'verified' && <span title="Verified User"><ShieldCheck className="w-6 h-6 text-emerald-500" /></span>}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${profile.is_active === false ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                {profile.is_active === false ? 'Suspended' : 'Active Account'}
              </span>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-900/50 text-blue-400 capitalize">
                {profile.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 text-zinc-300">
              <Phone className="w-5 h-5 text-zinc-500" /> {profile.phone || 'N/A'}
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <MapPin className="w-5 h-5 text-zinc-500" /> {profile.area_name || 'N/A'}
            </div>
            {profile.role === 'volunteer' && (
              <>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Briefcase className="w-5 h-5 text-zinc-500" /> Tasks Completed: {profile.tasks_completed || 0}
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <HeartHandshake className="w-5 h-5 text-zinc-500" /> Help Score: {profile.help_score || 0}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Role Specific Workflows */}
      
      {/* VOLUNTEER WORKFLOW */}
      {profile.role === 'volunteer' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5" /> Task Workflow History</h3>
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden">
            {volunteerTasks && volunteerTasks.length > 0 ? (
              <div className="divide-y divide-zinc-800">
                {volunteerTasks.map(task => (
                  <div key={task.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/50">
                    <div>
                      <p className="font-bold text-white text-lg">{task.title}</p>
                      <p className="text-sm text-zinc-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date'} &bull; {task.category}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${task.status === 'completed' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900' : task.status === 'in_progress' ? 'bg-blue-900/30 text-blue-400 border border-blue-900' : 'bg-zinc-800 text-zinc-400'}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                      {task.completed_at && <span className="text-xs text-zinc-600 mt-1">Done: {new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-zinc-500">No tasks accepted yet.</div>
            )}
          </div>
        </div>
      )}

      {/* DONOR WORKFLOW */}
      {profile.role === 'donor' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><HeartHandshake className="w-5 h-5" /> Donation History</h3>
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden">
            {donorDonations && donorDonations.length > 0 ? (
              <div className="divide-y divide-zinc-800">
                {donorDonations.map(donation => (
                  <div key={donation.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/50">
                    <div>
                      <p className="font-bold text-emerald-400 text-lg">₹{donation.amount}</p>
                      <p className="text-sm text-zinc-400 capitalize">{donation.cause}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-zinc-500">{donation.created_at ? new Date(donation.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-emerald-500"><CheckCircle className="w-3 h-3" /> Processed</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-zinc-500">No donations made yet.</div>
            )}
          </div>
        </div>
      )}

      {/* SEEKER WORKFLOW */}
      {profile.role === 'seeker' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5" /> Created Tasks</h3>
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden">
              {seekerTasks && seekerTasks.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {seekerTasks.map(task => (
                    <div key={task.id} className="p-4 hover:bg-zinc-900/50">
                      <p className="font-bold text-white">{task.title}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{task.status?.replace('_', ' ')}</span>
                        <span className="text-xs text-zinc-500">{task.created_at && new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="p-10 text-center text-zinc-500">No tasks created.</div>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><HeartHandshake className="w-5 h-5" /> Financial Requests</h3>
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden">
              {seekerRequests && seekerRequests.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {seekerRequests.map(req => (
                    <div key={req.id} className="p-4 hover:bg-zinc-900/50">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-white">{req.title}</p>
                        <p className="font-black text-blue-400">₹{req.amount_needed}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{req.status}</span>
                        <span className="text-xs text-zinc-500">{req.created_at && new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="p-10 text-center text-zinc-500">No requests made.</div>}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY LOGS (ALL ROLES) */}
      <div className="space-y-4 pt-8">
        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /> Security & Activity Log</h3>
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          {activityLogs && activityLogs.length > 0 ? (
            <div className="divide-y divide-zinc-800">
              {activityLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-zinc-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-white flex items-center gap-2">
                      {log.action}
                    </p>
                    {log.details && <p className="text-sm text-zinc-400 mt-1">{log.details}</p>}
                  </div>
                  <div className="flex flex-col md:items-end gap-1 shrink-0">
                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                      {log.location && log.location !== 'Unknown Location' && (
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {log.location}</span>
                      )}
                      {log.ip_address && log.ip_address !== 'Unknown' && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {log.ip_address}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-zinc-600 bg-zinc-900 px-2 py-1 rounded">
                      {log.created_at ? new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Unknown Date'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 font-medium">No recent activity logged for this user.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
