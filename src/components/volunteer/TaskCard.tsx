import React from 'react';
import { TASK_CATEGORIES } from '@/lib/constants';

interface TaskCardProps {
  task: any; // We'll pass the task object
  distance?: number; // Distance in km
  isActive?: boolean;
  onCompleteClick?: (task: any) => void;
  onViewClick?: (task: any) => void;
}

export function TaskCard({ task, distance, isActive, onCompleteClick, onViewClick }: TaskCardProps) {
  const categoryData = TASK_CATEGORIES.find((c) => c.value === task.category);
  const categoryLabel = categoryData?.label || task.category;
  const categoryIcon = categoryData?.icon || '📌';

  const isUrgentStyle = task.is_urgent
    ? 'border-red-400 dark:border-red-600 shadow-red-500/20 shadow-lg'
    : 'border-white/60 dark:border-zinc-700/50 hover:shadow-xl';

  return (
    <div
      className={`group p-6 bg-white/60 dark:bg-zinc-800/60 border rounded-2xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-zinc-800/90 hover:-translate-y-1 ${isUrgentStyle}`}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {task.title}
        </h3>
        {task.is_urgent && (
          <span className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-md shadow-red-500/20">
            Urgent
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-800/50">
          {categoryIcon} {categoryLabel}
        </span>
        {distance !== undefined && (
          <span className="inline-block px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-zinc-700">
            📏 {distance < 1 ? '< 1 km away' : `${distance.toFixed(1)} km away`}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold pt-4 border-t border-indigo-100/50 dark:border-zinc-700/50">
        <span className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md truncate max-w-[50%]">
          📍 {task.area_name || 'Location hidden'}
        </span>
        <span className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md truncate max-w-[50%]">
          👤 {task.profiles?.full_name}
        </span>
      </div>

      {isActive && task.latitude && task.longitude && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Navigate to Seeker
        </a>
      )}

      {isActive && onCompleteClick && (
        <button
          onClick={() => onCompleteClick(task)}
          className="mt-4 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          ✅ Mark as Complete
        </button>
      )}

      {!isActive && onViewClick && (
        <button
          onClick={() => onViewClick(task)}
          className="mt-4 w-full py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          View Details
        </button>
      )}
    </div>
  );
}
