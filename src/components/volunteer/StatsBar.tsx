import React from 'react';

interface StatsBarProps {
  helpScore: number;
  tasksCompleted: number;
  activeTasksCount: number;
}

export function StatsBar({ helpScore, tasksCompleted, activeTasksCount }: StatsBarProps) {
  // Determine rank based on helpScore
  let rankText = "Newbie";
  let rankIcon = "🌱";
  let rankColor = "text-green-600 dark:text-green-400";
  let rankBg = "bg-green-100 dark:bg-green-900/30";

  if (helpScore > 500) {
    rankText = "Gold Helper";
    rankIcon = "🏆";
    rankColor = "text-yellow-600 dark:text-yellow-400";
    rankBg = "bg-yellow-100 dark:bg-yellow-900/30";
  } else if (helpScore > 100) {
    rankText = "Silver Helper";
    rankIcon = "🥈";
    rankColor = "text-slate-600 dark:text-slate-400";
    rankBg = "bg-slate-100 dark:bg-slate-800/50";
  } else if (helpScore > 20) {
    rankText = "Bronze Helper";
    rankIcon = "🥉";
    rankColor = "text-orange-700 dark:text-orange-400";
    rankBg = "bg-orange-100 dark:bg-orange-900/30";
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
      <div className="backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 p-6 rounded-[2rem] shadow-lg border border-white/60 dark:border-white/10 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Help Score</span>
        <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{helpScore}</span>
      </div>
      
      <div className="backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 p-6 rounded-[2rem] shadow-lg border border-white/60 dark:border-white/10 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Completed</span>
        <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{tasksCompleted}</span>
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 p-6 rounded-[2rem] shadow-lg border border-white/60 dark:border-white/10 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Active Tasks</span>
        <span className="text-4xl font-black text-rose-600 dark:text-rose-400">{activeTasksCount}</span>
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 p-6 rounded-[2rem] shadow-lg border border-white/60 dark:border-white/10 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Rank Badge</span>
        <div className={`mt-1 px-4 py-2 rounded-xl flex items-center gap-2 font-bold ${rankBg} ${rankColor}`}>
          <span className="text-2xl">{rankIcon}</span>
          <span>{rankText}</span>
        </div>
      </div>
    </div>
  );
}
