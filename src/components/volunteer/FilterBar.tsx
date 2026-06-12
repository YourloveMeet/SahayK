import React from 'react';
import { TASK_CATEGORIES } from '@/lib/constants';

interface FilterBarProps {
  category: string;
  setCategory: (val: string) => void;
  distance: number;
  setDistance: (val: number) => void;
  isUrgentOnly: boolean;
  setIsUrgentOnly: (val: boolean) => void;
}

export function FilterBar({
  category,
  setCategory,
  distance,
  setDistance,
  isUrgentOnly,
  setIsUrgentOnly
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 rounded-2xl border border-white/60 dark:border-white/10 shadow-md relative z-10">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <span className="font-bold text-gray-700 dark:text-gray-300">Filter by:</span>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium appearance-none"
        >
          <option value="all">All Categories</option>
          {TASK_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>

        {/* Distance Filter */}
        <select
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full p-3 bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium appearance-none"
        >
          <option value={2}>Within 2 km</option>
          <option value={5}>Within 5 km</option>
          <option value={10}>Within 10 km</option>
          <option value={50}>Within 50 km</option>
          <option value={9999}>Anywhere</option>
        </select>

        {/* Urgent Only Toggle */}
        <button
          onClick={() => setIsUrgentOnly(!isUrgentOnly)}
          className={`w-full p-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
            isUrgentOnly
              ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/40 dark:border-rose-800 dark:text-rose-300'
              : 'bg-white/50 border-gray-200 text-gray-600 dark:bg-black/30 dark:border-zinc-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          {isUrgentOnly ? '🔴 Urgent Only' : '⚪ All Priorities'}
        </button>
      </div>
    </div>
  );
}
