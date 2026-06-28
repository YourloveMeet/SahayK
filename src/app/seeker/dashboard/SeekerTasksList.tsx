'use client'


//for updates
import React, { useState } from 'react'
import { TaskCard } from '@/components/volunteer/TaskCard'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SeekerTasksList({ tasks }: { tasks: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState<string | null>(null)

  const handleConfirm = async (task: any) => {
    setIsConfirming(task.id)
    try {
      // 1. Award points to volunteer
      const pointsEarned = task.is_urgent ? 20 : 10;
      const { data: volProfile } = await supabase.from('profiles').select('help_score, tasks_completed').eq('id', task.volunteer_id).single();
      if (volProfile) {
        await supabase.from('profiles').update({
          help_score: (volProfile.help_score || 0) + pointsEarned,
          tasks_completed: (volProfile.tasks_completed || 0) + 1
        }).eq('id', task.volunteer_id);
      }

      // 2. Mark task as fully completed
      await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          task_status_detail: 'completed'
        })
        .eq('id', task.id)

      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setIsConfirming(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map(task => (
        <div key={task.id} className="relative">
          {isConfirming === task.id && (
            <div className="absolute inset-0 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <TaskCard
            task={task}
            isSeekerView={true}
            onSeekerConfirm={handleConfirm}
          />
        </div>
      ))}
    </div>
  )
}
