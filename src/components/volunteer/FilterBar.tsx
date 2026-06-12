import React from 'react';
import { TASK_CATEGORIES } from '@/lib/constants';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
    <div className="flex flex-col gap-4 p-5 backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md relative z-10">
      <div className="flex items-center gap-3 w-full">
        <span className="font-bold text-gray-900 dark:text-gray-100">Filter by:</span>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none dark:text-white font-medium appearance-none transition-all cursor-pointer"
        >
          <option value="all">All Categories</option>
          {TASK_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Distance Filter */}
        <select
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:outline-none dark:text-white font-medium appearance-none transition-all cursor-pointer"
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
              ? 'bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900 shadow-md'
              : 'bg-white/50 border-gray-200 text-gray-600 dark:bg-black/50 dark:border-zinc-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          {isUrgentOnly ? (
            <><AlertCircle className="w-5 h-5 text-white dark:text-gray-900" /> Urgent Only</>
          ) : (
            <><CheckCircle className="w-5 h-5 text-gray-400" /> All Priorities</>
          )}
        </button>
      </div>
    </div>
  );
}
