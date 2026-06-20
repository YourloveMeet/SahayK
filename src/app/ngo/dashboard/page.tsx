'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, ListTodo, Bell, CheckCircle, Clock, Repeat, ArrowRight, Activity, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function NGODashboard() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const [snoozedIds, setSnoozedIds] = useState<Record<string, number>>({})

  React.useEffect(() => {
    const checkSnooze = () => {
      const saved = localStorage.getItem('sahayak_snoozed_alarms')
      if (saved) {
        try { setSnoozedIds(JSON.parse(saved)) } catch (e) {}
      }
    }
    checkSnooze()
    const interval = setInterval(checkSnooze, 1000)
    return () => clearInterval(interval)
  }, [])

  const { data: userProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      return user
    }
  })

  // 1. Get NGO Profile ID
  const { data: ngoProfile } = useQuery({
    queryKey: ['ngoProfile', userProfile?.id],
    enabled: !!userProfile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('ngo_profiles')
        .select('id, ngo_name')
        .eq('user_id', userProfile!.id)
        .single()
      return data || null
    }
  })

  // 2. Get Total Residents
  const { data: residentsCount } = useQuery({
    queryKey: ['ngo', 'residentsCount', ngoProfile?.id],
    enabled: !!ngoProfile?.id,
    queryFn: async () => {
      const { count } = await supabase
        .from('ngo_residents')
        .select('*', { count: 'exact', head: true })
        .eq('ngo_id', ngoProfile!.id)
        .eq('status', 'active')
      return count || 0
    }
  })

  // 3. Get Active Tasks (Requested by this NGO)
  const { data: activeTasksCount } = useQuery({
    queryKey: ['ngo', 'activeTasksCount', userProfile?.id],
    enabled: !!userProfile?.id,
    queryFn: async () => {
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('seeker_id', userProfile!.id)
        .in('status', ['open', 'accepted'])
      return count || 0
    }
  })

  // 4. Get Today's Reminders
  const { data: reminders } = useQuery({
    queryKey: ['ngo', 'reminders', ngoProfile?.id],
    enabled: !!ngoProfile?.id,
    queryFn: async () => {
      // First get resident IDs
      const { data: residents } = await supabase
        .from('ngo_residents')
        .select('id, full_name')
        .eq('ngo_id', ngoProfile!.id)
      
      if (!residents || residents.length === 0) return []

      const residentIds = residents.map(r => r.id)
      const residentMap = Object.fromEntries(residents.map(r => [r.id, r.full_name]))

      // Start of today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: remindersData } = await supabase
        .from('resident_reminders')
        .select('*')
        .in('resident_id', residentIds)
        .gte('due_date', today.toISOString())
        .lt('due_date', tomorrow.toISOString())
        .order('due_date', { ascending: true })

      return (remindersData || []).map(r => ({ ...r, resident_name: residentMap[r.resident_id] }))
    }
  })

  // Mutation to mark reminder completed or reschedule if recurring
  const completeReminderMutation = useMutation({
    mutationFn: async (reminder: any) => {
      if (reminder.recurring && reminder.recurrence_pattern) {
        const nextDate = new Date(reminder.due_date);
        if (reminder.recurrence_pattern === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        else if (reminder.recurrence_pattern === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (reminder.recurrence_pattern === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        else if (reminder.recurrence_pattern.startsWith('custom:')) {
          const daysStr = reminder.recurrence_pattern.split(':')[1];
          if (daysStr) {
            const days = daysStr.split(',').map(Number).sort((a: number, b: number) => a - b);
            const currentDay = nextDate.getDay();
            const nextDay = days.find((d: number) => d > currentDay);
            let daysToAdd = 0;
            if (nextDay !== undefined) {
              daysToAdd = nextDay - currentDay;
            } else {
              daysToAdd = 7 - currentDay + days[0];
            }
            nextDate.setDate(nextDate.getDate() + daysToAdd);
          } else {
            nextDate.setDate(nextDate.getDate() + 1);
          }
        }
        
        const { error } = await supabase
          .from('resident_reminders')
          .update({ due_date: nextDate.toISOString() })
          .eq('id', reminder.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('resident_reminders')
          .update({ completed: true })
          .eq('id', reminder.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'reminders'] })
    }
  })

  const repeatReminderMutation = useMutation({
    mutationFn: async (reminder: any) => {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1); // Repeat tomorrow
      nextDate.setHours(new Date(reminder.due_date).getHours(), new Date(reminder.due_date).getMinutes(), 0, 0); // Keep original time

      const { error } = await supabase
        .from('resident_reminders')
        .update({ completed: false, due_date: nextDate.toISOString() })
        .eq('id', reminder.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngo', 'reminders'] })
    }
  })

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 bg-zinc-50 dark:bg-[#09090b] min-h-screen text-zinc-900 dark:text-zinc-50">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          <Activity className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          Welcome back, {ngoProfile?.ngo_name || 'Admin'}
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl">
          Here is the latest status of your care home operations and pending tasks.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metric Card 1 */}
        <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex items-center justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Total Residents</p>
            <p className="text-4xl font-black">{residentsCount ?? '-'}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
            <Users className="w-8 h-8" />
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex items-center justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Active Tasks</p>
            <p className="text-4xl font-black">{activeTasksCount ?? '-'}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
            <ListTodo className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Reminders Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Bell className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            </div>
            <h2 className="text-xl font-bold">Today's Reminders</h2>
          </div>
          <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
        
        <div className="p-0">
          {reminders && reminders.length > 0 ? (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {reminders.map(reminder => {
                const isCompleted = reminder.completed;
                const dateObj = reminder.due_date ? new Date(reminder.due_date) : null;
                const timeStr = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                
                const snoozeUntil = snoozedIds[reminder.id]
                const isSnoozed = !isCompleted && snoozeUntil && snoozeUntil > Date.now()

                return (
                  <div key={reminder.id} className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${isCompleted ? 'bg-zinc-50 dark:bg-zinc-900/50' : (isSnoozed ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50')}`}>
                    <div className="flex items-start gap-4 flex-1">
                      {/* Time Column */}
                      <div className="w-20 pt-1 shrink-0">
                        <span className={`text-sm font-bold block ${isCompleted ? 'text-zinc-400 line-through' : (isSnoozed ? 'text-zinc-500' : 'text-zinc-900 dark:text-zinc-100')}`}>
                          {timeStr}
                        </span>
                      </div>
                      
                      {/* Details Column */}
                      <div className="space-y-1">
                        <h4 className={`text-lg font-bold flex items-center gap-2 ${isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {reminder.title}
                          
                          {/* Snooze Badge */}
                          {isSnoozed && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              <Clock className="w-3.5 h-3.5 mr-1.5" /> Snoozed {Math.ceil((snoozeUntil - Date.now()) / 60000)}m
                            </span>
                          )}
                        </h4>
                        <p className={`text-sm font-medium ${isCompleted ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          For: <Link href={`/ngo/residents/${reminder.resident_id}`} className="text-zinc-900 dark:text-zinc-200 hover:underline">{reminder.resident_name}</Link>
                        </p>
                      </div>
                    </div>

                    {/* Action Column */}
                    <div className="flex items-center gap-2 mt-4 md:mt-0 ml-24 md:ml-0">
                      {!isCompleted ? (
                        <>
                          <button 
                            onClick={() => completeReminderMutation.mutate(reminder)}
                            disabled={completeReminderMutation.isPending}
                            className="px-5 py-2.5 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Done
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-400 font-bold text-sm flex items-center gap-1.5 px-3">
                            <CheckCircle className="w-4 h-4" /> Done
                          </span>
                          {/* Repeat Button for completed reminders */}
                          <button 
                            onClick={() => repeatReminderMutation.mutate(reminder)}
                            disabled={repeatReminderMutation.isPending}
                            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm rounded-xl transition-all flex items-center gap-2"
                          >
                            <Repeat className="w-4 h-4" />
                            Repeat Tomorrow
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">All caught up!</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto">
                No pending reminders for today. Take a break or check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
