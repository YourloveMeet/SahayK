import React from 'react';
import { TASK_CATEGORIES } from '@/lib/constants';
import { MapPin, User, Phone } from 'lucide-react';

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
  const CategoryIcon = categoryData?.icon || MapPin;

  const isUrgentStyle = task.is_urgent
    ? 'border-gray-900 dark:border-white shadow-md shadow-black/10 dark:shadow-white/10 ring-1 ring-gray-900 dark:ring-white'
    : 'border-gray-200 dark:border-zinc-800 hover:shadow-md';

  return (
    <div
      className={`group p-6 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-black/90 hover:-translate-y-1 ${isUrgentStyle}`}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
          {task.title}
        </h3>
        {task.is_urgent && (
          <span className="flex-shrink-0 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black uppercase tracking-widest rounded-lg shadow-md">
            Urgent
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 text-xs font-bold rounded-lg border border-gray-200 dark:border-zinc-700">
          <CategoryIcon className="w-3.5 h-3.5" /> {categoryLabel}
        </span>
        {distance !== undefined && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-zinc-700">
            <MapPin className="w-3.5 h-3.5" /> {distance < 1 ? '< 1 km away' : `${distance.toFixed(1)} km away`}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold pt-4 border-t border-gray-200 dark:border-zinc-800">
        <span className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md truncate max-w-[50%]">
          <MapPin className="w-3.5 h-3.5" /> {task.area_name || 'Location hidden'}
        </span>
        <div className="relative group/profile flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md max-w-[50%] cursor-pointer hover:bg-white/80 dark:hover:bg-zinc-800 transition-colors">
          {task.profiles ? (
            <>
              {task.profiles.avatar_url ? (
                <img src={task.profiles.avatar_url} className="w-4 h-4 rounded-full object-cover border border-gray-300 dark:border-zinc-700 shrink-0" alt="Avatar" />
              ) : (
                <User className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">{task.profiles.full_name}</span>

              {/* Mini Profile Hover Card */}
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 z-[100] opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-200 pointer-events-none group-hover/profile:pointer-events-auto">
                <div className="p-5 flex flex-col items-center text-center">
                  {task.profiles.avatar_url ? (
                    <img src={task.profiles.avatar_url} className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-zinc-950 shadow-sm bg-white" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white dark:border-zinc-950 shadow-sm">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <h4 className="mt-3 font-bold text-gray-900 dark:text-white text-base">{task.profiles.full_name}</h4>
                  
                  {task.profiles.phone && (
                    <div className="mt-3 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-xl text-sm font-bold w-full justify-center shadow-inner">
                      <Phone className="w-4 h-4" />
                      {task.profiles.phone}
                    </div>
                  )}
                  
                  <p className="mt-3 text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">Verified User</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0"></div>
              <span className="truncate text-orange-600 dark:text-orange-400">Not assigned yet</span>
            </>
          )}
        </div>
      </div>

      {isActive && task.latitude && task.longitude && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 w-full py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-700"
        >
          <MapPin className="w-4 h-4 shrink-0" />
          Navigate to Seeker
        </a>
      )}

      {isActive && onCompleteClick && (
        <button
          onClick={() => onCompleteClick(task)}
          className="mt-4 w-full py-2.5 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Mark as Complete
        </button>
      )}

      {!isActive && onViewClick && (
        <button
          onClick={() => onViewClick(task)}
          className="mt-4 w-full py-2.5 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          View Details
        </button>
      )}
    </div>
  );
}
