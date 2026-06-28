'use client';

import React, { useState } from 'react';
import { TASK_CATEGORIES } from '@/lib/constants';
import { MapPin, User, Phone, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { SwipeToConfirm } from '@/components/ui/SwipeToConfirm';

interface TaskCardProps {
  task: any; // We'll pass the task object
  distance?: number; // Distance in km
  isActive?: boolean;
  onCompleteClick?: (task: any) => void;
  onViewClick?: (task: any) => void;
  onUpdateStatus?: (taskId: string, newStatus: string) => void;
  isSeekerView?: boolean;
  onSeekerConfirm?: (task: any) => void;
}

export function TaskCard({ task, distance, isActive, onCompleteClick, onViewClick, onUpdateStatus, isSeekerView, onSeekerConfirm }: TaskCardProps) {
  const isErrand = task.category === 'errands' || (task.category === 'other' && task.errand_details !== null);
  const effectiveCategory = isErrand ? 'errands' : task.category;
  
  let currentStatus = task.task_status_detail || 'not_started';
  if (['arrived', 'delivered'].includes(currentStatus)) currentStatus = 'delivered';
  
  const categoryData = TASK_CATEGORIES.find((c) => c.value === effectiveCategory);
  const categoryLabel = categoryData?.label || task.category;
  const CategoryIcon = categoryData?.icon || MapPin;

  // Determine dynamic button action for errands
  let mainActionLabel = 'Mark as Complete';
  let mainActionHandler = () => onCompleteClick?.(task);
  let isFinalStep = true;
  let hideVolunteerAction = false;

  if (currentStatus === 'delivered') {
    hideVolunteerAction = true;
  }

  if (isErrand && isActive && onUpdateStatus && !hideVolunteerAction) {
    if (currentStatus === 'not_started') {
      mainActionLabel = 'Head to Shop';
      mainActionHandler = () => onUpdateStatus(task.id, 'on_the_way_to_shop');
      isFinalStep = false;
    } else if (currentStatus === 'on_the_way_to_shop') {
      mainActionLabel = 'Start Shopping';
      mainActionHandler = () => onUpdateStatus(task.id, 'shopping_in_progress');
      isFinalStep = false;
    } else if (currentStatus === 'shopping_in_progress') {
      mainActionLabel = 'Head to Delivery';
      mainActionHandler = () => onUpdateStatus(task.id, 'on_the_way_to_seeker');
      isFinalStep = false;
    }
  }

  const isUrgentStyle = task.is_urgent
    ? 'border-gray-900 dark:border-white shadow-md shadow-black/10 dark:shadow-white/10 ring-1 ring-gray-900 dark:ring-white'
    : 'border-gray-200 dark:border-zinc-800 hover:shadow-md';

  return (
    <div
      className={`group p-6 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-black/90 hover:-translate-y-1 flex flex-col h-full ${isUrgentStyle}`}
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

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed flex-1">
        {task.description}
      </p>

      {/* Proof of Delivery Image */}
      {task.completion_proof_url && (
        <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 relative group/image">
          <img 
            src={task.completion_proof_url} 
            alt="Proof of work" 
            className="w-full h-32 object-cover object-center transition-transform duration-500 group-hover/image:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs font-bold text-white shadow-sm">Proof of Delivery</span>
            </div>
          </div>
        </div>
      )}

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

      {isErrand && (
        <div className="mt-5 pt-5 border-t border-gray-200 dark:border-zinc-800">
          <h4 className="text-[11px] font-black text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-[0.2em] mb-4">Task & Shopping Status</h4>
          <div className="flex items-start justify-between relative px-2 pt-2">
            {/* Background Line */}
            <div className="absolute top-4 left-8 right-8 h-1 bg-gray-200 dark:bg-zinc-800 -translate-y-1/2 z-0 rounded-full"></div>
            
            {(() => {
              const visualSteps = [
                { id: 'not_started', label: 'Not Started' },
                { id: 'on_the_way_to_shop', label: 'Going to shop' },
                { id: 'shopping_in_progress', label: 'Shopping' },
                { id: 'on_the_way_to_seeker', label: 'On the way' },
                { id: 'delivered', label: 'Delivered', aliases: ['arrived', 'delivered'] }
              ];
              const currentIndex = visualSteps.findIndex(s => s.id === currentStatus || s.aliases?.includes(currentStatus));
              const safeIndex = currentIndex === -1 ? 0 : currentIndex;

              return (
                <>
                  {/* Active Line */}
                  <div 
                    className="absolute top-4 left-8 h-1 bg-indigo-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                    style={{ width: `calc(${safeIndex / (visualSteps.length - 1)} * (100% - 4rem))` }}
                  ></div>

                  {visualSteps.map((step, idx) => {
                    const isCompleted = idx <= safeIndex;
                    const isActiveStep = idx === safeIndex;
                    const isNext = idx === safeIndex + 1;
                    // For volunteer view, they can click. For seeker view, it's read-only.
                    const canClick = !isSeekerView && isActive && (isNext || isCompleted); 

                    return (
                      <div 
                        key={step.id} 
                        className={`relative z-10 flex flex-col items-center gap-2 w-12 ${canClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                        onClick={() => {
                          if (canClick && onUpdateStatus && isActive) {
                            onUpdateStatus(task.id, step.id);
                          }
                        }}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 shrink-0 ${
                          isCompleted 
                            ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                            : 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700'
                        } ${isActiveStep ? 'scale-125' : ''}`} />
                        <span className={`text-[9px] font-bold ${isActiveStep ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} text-center leading-tight`}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Volunteer specific actions */}
      {!isSeekerView && isActive && task.latitude && task.longitude && (
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

      {!isSeekerView && isActive && !hideVolunteerAction && (onCompleteClick || onUpdateStatus) && (
        <SwipeToConfirm
          key={currentStatus}
          label={`Slide to ${mainActionLabel}`}
          onConfirm={mainActionHandler}
          isFinalStep={isFinalStep}
        />
      )}

      {!isSeekerView && isActive && hideVolunteerAction && (
        <div className="mt-4 w-full py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl font-bold flex flex-col items-center justify-center border border-green-200 dark:border-green-800 text-center gap-1">
           <CheckCircle className="w-5 h-5" />
           <span className="text-sm">Pending Seeker Confirmation</span>
        </div>
      )}

      {/* Seeker specific actions */}
      {isSeekerView && currentStatus === 'delivered' && onSeekerConfirm && (
        <div className="mt-4">
          <SwipeToConfirm
            key={`seeker-${currentStatus}`}
            label="Confirm Delivery"
            onConfirm={() => onSeekerConfirm(task)}
            isFinalStep={true}
          />
        </div>
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
