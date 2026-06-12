import React from 'react';

interface Leader {
  id: string;
  full_name: string;
  help_score: number | null;
  tasks_completed: number | null;
}

interface LeaderboardWidgetProps {
  leaders: Leader[];
}

export function LeaderboardWidget({ leaders }: LeaderboardWidgetProps) {
  if (!leaders || leaders.length === 0) return null;

  return (
    <div className="backdrop-blur-2xl bg-white/70 dark:bg-zinc-900/70 rounded-[2.5rem] border border-white/60 dark:border-zinc-700/50 shadow-2xl overflow-hidden relative z-10">
      <div className="p-6 border-b border-white/40 dark:border-zinc-700/50 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-between">
        <h2 className="text-xl font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
          <span>🏆</span> Top Volunteers This Week
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {leaders.map((leader, index) => {
          const isTop = index === 0;
          return (
            <div
              key={leader.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                isTop
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700 shadow-md'
                  : 'bg-white/50 dark:bg-zinc-800/50 border-white/60 dark:border-zinc-700/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                    isTop
                      ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/30'
                      : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{leader.full_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {leader.tasks_completed || 0} tasks completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-lg text-indigo-600 dark:text-indigo-400">
                  {leader.help_score || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Points</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
