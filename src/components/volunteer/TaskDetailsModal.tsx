import React, { useEffect } from 'react';
import { TASK_CATEGORIES } from '@/lib/constants';
import { MapPin, User, Navigation, Handshake, CheckCircle, Ruler } from 'lucide-react';

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
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const categoryData = TASK_CATEGORIES.find((c) => c.value === task.category);
  const categoryLabel = categoryData?.label || task.category;
  const CategoryIcon = categoryData?.icon || MapPin;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md h-screen w-screen overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl border border-white/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between ${task.is_urgent ? 'bg-gray-100 dark:bg-zinc-800' : 'bg-gray-50 dark:bg-black/20'}`}>
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 text-[10px] sm:text-xs font-bold rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
                <CategoryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {categoryLabel}
              </span>
              {task.is_urgent && (
                <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg shadow-md">
                  Urgent
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{task.title}</h2>
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
        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 flex-1">
          {/* Details Row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
              <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Seeker</p>
              <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2 truncate">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" /> <span className="truncate">{task.profiles?.full_name}</span>
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
              <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Distance</p>
              <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" /> {distance !== undefined ? (distance < 1 ? '< 1 km' : `${distance.toFixed(1)} km`) : 'Unknown'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Location</p>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-white shrink-0" />
                <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-snug pt-0.5">{task.area_name || 'Location hidden until accepted'}</p>
              </div>
              {task.latitude && task.longitude && (
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto shrink-0 flex justify-center items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold text-sm rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Maps
                </a>
              )}
            </div>
          </div>

          {(task.category === 'errands' || (task.category === 'other' && task.errand_details)) && task.errand_details && (
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Errand Details</p>
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-inner space-y-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2">Items to purchase/pickup:</h4>
                  <ul className="space-y-2">
                    {task.errand_details.items?.map((item: any, i: number) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-700">
                        <div className="mt-0.5 sm:mt-1"><div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 border-indigo-400 dark:border-indigo-600 bg-white dark:bg-zinc-800"></div></div>
                        <div className="flex-1">
                          <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{item.name} <span className="text-indigo-600 dark:text-indigo-400 font-black px-1.5 sm:px-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-md ml-1 sm:ml-2">x{item.quantity}</span></p>
                          {item.notes && <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{item.notes}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {(task.errand_details.preferred_shop || task.errand_details.estimated_budget) && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-100 dark:border-zinc-700 mt-4">
                    {task.errand_details.preferred_shop && (
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Preferred Shop</p>
                        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{task.errand_details.preferred_shop}</p>
                      </div>
                    )}
                    {task.errand_details.estimated_budget && (
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Est. Budget</p>
                        <p className="font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">₹{task.errand_details.estimated_budget}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</p>
            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-inner">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-lg">{task.description}</p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 sm:p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium text-center sm:text-left pr-0 sm:pr-4">
            Accepting this request means you commit to helping the seeker.
          </p>
          <button
            onClick={() => {
              onAccept(task.id);
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 font-black text-base sm:text-lg rounded-xl shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 sm:gap-3 shrink-0"
          >
            <Handshake className="w-5 h-5 sm:w-6 sm:h-6" /> Accept Request
          </button>
        </div>
      </div>
    </div>
  );
}
