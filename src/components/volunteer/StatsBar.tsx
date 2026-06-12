import React from 'react';
import { Sprout, Medal, Award, Trophy } from 'lucide-react';

interface StatsBarProps {
  helpScore: number;
  tasksCompleted: number;
  activeTasksCount: number;
}

export function StatsBar({ helpScore, tasksCompleted, activeTasksCount }: StatsBarProps) {
  // Determine rank based on helpScore
  let rankText = "Newbie";
  let RankIcon = Sprout;
  let rankColor = "text-gray-900 dark:text-gray-100";
  let rankBg = "bg-gray-100 dark:bg-gray-800";

  if (helpScore > 500) {
    rankText = "Gold Helper";
    RankIcon = Trophy;
    rankColor = "text-[#b39552]";
    rankBg = "bg-[#b39552]/10";
  } else if (helpScore > 100) {
    rankText = "Silver Helper";
    RankIcon = Medal;
    rankColor = "text-gray-500 dark:text-gray-400";
    rankBg = "bg-gray-100 dark:bg-zinc-800";
  } else if (helpScore > 20) {
    rankText = "Bronze Helper";
    RankIcon = Award;
    rankColor = "text-stone-500 dark:text-stone-400";
    rankBg = "bg-stone-100 dark:bg-stone-900";
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 rounded-[1rem] shadow-lg border border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Help Score</span>
        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{helpScore}</span>
      </div>
      
      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 rounded-[1rem] shadow-lg border border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Completed</span>
        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{tasksCompleted}</span>
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 rounded-[1rem] shadow-lg border border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Active Tasks</span>
        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{activeTasksCount}</span>
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 p-6 rounded-[1rem] shadow-lg border border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Rank Badge</span>
        <div className={`mt-1 px-4 py-2 rounded-lg flex items-center gap-2 font-extrabold border border-transparent ${rankBg} ${rankColor}`}>
          <RankIcon className="w-5 h-5" />
          <span className="text-sm">{rankText}</span>
        </div>
      </div>
    </div>
  );
}
