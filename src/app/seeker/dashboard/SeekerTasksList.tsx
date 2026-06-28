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
