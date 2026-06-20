'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BellRing, Check, Clock, AlertTriangle } from 'lucide-react'

export function AlarmManager() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [activeAlarm, setActiveAlarm] = useState<any | null>(null)
  
  // Initialize from localStorage if available
  const [snoozedIds, setSnoozedIds] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sahayak_snoozed_alarms')
      if (saved) {
        try { return JSON.parse(saved) } catch (e) {}
      }
    }
    return {}
  })
  
  const [audioPlayed, setAudioPlayed] = useState(false)

  // Fetch user
  const { data: user } = useQuery({
    queryKey: ['user_for_alarm'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  // Fetch pending reminders
  const { data: reminders } = useQuery({
    queryKey: ['ngo_pending_reminders'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resident_reminders')
        .select('*')
        .eq('created_by', user!.id)
        .eq('completed', false)
      
      if (error) throw error
      return data || []
    },
    refetchInterval: 30000 // Check DB every 30 seconds
  })

  // Check for alarms locally every second
  useEffect(() => {
    if (!reminders || activeAlarm) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const triggered = reminders.find(r => {
        if (!r.due_date) return false;
        const dueTime = new Date(r.due_date).getTime();
        const snoozeTime = snoozedIds[r.id] || 0;
        const targetTime = Math.max(dueTime, snoozeTime);
        
        // Ring if the target time has passed, but not if it's older than 2 minutes
        // This prevents old missed alarms from violently ringing when you open the app hours later
        return now >= targetTime && now <= targetTime + 2 * 60 * 1000; 
      });

      if (triggered) {
        setActiveAlarm(triggered);
        setAudioPlayed(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders, activeAlarm, snoozedIds]);

  // Audio effect
  useEffect(() => {
    if (activeAlarm && !audioPlayed) {
      // Create a gentle beep using web audio API to avoid needing external assets
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        
        // Play 3 short beeps
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime + i * 0.4); // A5
          
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.4);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.4 + 0.05);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.4 + 0.2);
          
          osc.start(ctx.currentTime + i * 0.4);
          osc.stop(ctx.currentTime + i * 0.4 + 0.2);
        }
        setAudioPlayed(true);
      } catch (e) {
        console.error("Audio playback failed", e);
      }
    }
  }, [activeAlarm, audioPlayed]);

  // Mutations
  const markDoneMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['ngo_pending_reminders'] })
      queryClient.invalidateQueries({ queryKey: ['ngo', 'reminders'] })
      setActiveAlarm(null)
    }
  })

  const handleSnooze = () => {
    if (!activeAlarm) return;
    const newSnoozed = {
      ...snoozedIds,
      [activeAlarm.id]: Date.now() + 5 * 60 * 1000 // Snooze for 5 minutes
    };
    setSnoozedIds(newSnoozed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahayak_snoozed_alarms', JSON.stringify(newSnoozed));
    }
    setActiveAlarm(null)
  }

  if (!activeAlarm) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 border-2 border-zinc-900 dark:border-white">
        
        <div className="bg-zinc-900 dark:bg-white p-8 flex flex-col items-center justify-center text-white dark:text-zinc-900 relative overflow-hidden">
          {/* Animated ringing bell */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
            <BellRing className="w-16 h-16 relative z-10 animate-[bounce_1s_infinite]" />
          </div>
          
          <h2 className="text-3xl font-black mt-6 tracking-tight text-center">Reminder!</h2>
          <p className="font-bold opacity-90 mt-2 uppercase tracking-widest text-sm text-center">
            {new Date(activeAlarm.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeAlarm.title}
          </h3>
          <div className="inline-flex items-center justify-center px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold rounded-full text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {activeAlarm.reminder_type}
          </div>
          
          {activeAlarm.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              {activeAlarm.description}
            </p>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-black/50 border-t border-gray-200 dark:border-zinc-800 grid grid-cols-2 gap-3">
          <button 
            onClick={handleSnooze}
            className="flex items-center justify-center gap-2 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Clock className="w-5 h-5" />
            Snooze 5m
          </button>
          <button 
            onClick={() => markDoneMutation.mutate(activeAlarm)}
            disabled={markDoneMutation.isPending}
            className="flex items-center justify-center gap-2 py-4 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white rounded-xl font-bold transition-all shadow-lg shadow-zinc-900/10"
          >
            <Check className="w-5 h-5" />
            Mark Done
          </button>
        </div>
      </div>
    </div>
  )
}
