import React, { useEffect } from 'react';
import { TASK_CATEGORIES } from '@/lib/constants';

interface TaskDetailsModalProps {
  task: any | null;
  distance?: number;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (taskId: string) => void;
}

export function TaskDetailsModal({ task, distance, isOpen, onClose, onAccept }: TaskDetailsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const categoryData = TASK_CATEGORIES.find((c) => c.value === task.category);
  const categoryLabel = categoryData?.label || task.category;
  const categoryIcon = categoryData?.icon || '📌';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md h-screen w-screen overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-white/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Header */}
        <div className={`p-6 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between ${task.is_urgent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20'}`}>
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                {categoryIcon} {categoryLabel}
              </span>
              {task.is_urgent && (
                <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-md shadow-red-500/20">
                  Urgent
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{task.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-colors shrink-0"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-8 space-y-8 flex-1">
          {/* Details Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Seeker</p>
              <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>👤</span> {task.profiles?.full_name}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Distance</p>
              <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>📏</span> {distance !== undefined ? (distance < 1 ? '< 1 km away' : `${distance.toFixed(1)} km away`) : 'Distance unknown'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Location</p>
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">📍</span>
                <p className="font-bold text-gray-900 dark:text-white leading-snug">{task.area_name || 'Location hidden until accepted'}</p>
              </div>
              {task.latitude && task.longitude && (
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-indigo-600 dark:text-indigo-400 font-bold text-sm rounded-xl border border-indigo-100 dark:border-zinc-700 shadow-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Open in Maps
                </a>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</p>
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-inner">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">{task.description}</p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-black/20 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Accepting this request means you commit to helping the seeker.
          </p>
          <button
            onClick={() => {
              onAccept(task.id);
              onClose();
            }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-black text-lg rounded-xl shadow-xl shadow-indigo-500/30 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 shrink-0"
          >
            <span>🤝</span> Accept Request
          </button>
        </div>
      </div>
    </div>
  );
}
