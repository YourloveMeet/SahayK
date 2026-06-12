'use client'

import React, { useState } from 'react';
import { Trophy, Phone, ShieldCheck, UserCircle, MapPin } from 'lucide-react';

interface Leader {
  id: string;
  full_name: string;
  help_score: number | null;
  tasks_completed: number | null;
  avatar_url?: string | null;
  phone?: string | null;
}

interface LeaderboardWidgetProps {
  leaders: Leader[];
}

export function LeaderboardWidget({ leaders }: LeaderboardWidgetProps) {
  const [hoveredLeader, setHoveredLeader] = useState<Leader | null>(null);

  if (!leaders || leaders.length === 0) return null;

  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md flex flex-col h-full relative z-10">
      <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-between shrink-0 rounded-t-[1rem]">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gray-900 dark:text-white" /> Top Volunteers
        </h2>
      </div>
      
      <div className="p-5 space-y-4 flex-1 overflow-y-auto">
        {leaders.map((leader, index) => {
          const isTop = index === 0;
          return (
            <div
              key={leader.id}
              className="relative"
              onMouseEnter={() => setHoveredLeader(leader)}
              onMouseLeave={() => setHoveredLeader(null)}
            >
              <div
                className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                  isTop
                    ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white shadow-md hover:scale-[1.02]'
                    : 'bg-white/50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {leader.avatar_url ? (
                      <img 
                        src={leader.avatar_url} 
                        alt={leader.full_name} 
                        className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${isTop ? 'border-white dark:border-gray-900' : 'border-gray-200 dark:border-zinc-700'}`}
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm ${isTop ? 'bg-white dark:bg-gray-900 border-white dark:border-gray-900' : 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700'}`}>
                        <UserCircle className={`w-8 h-8 ${isTop ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs border-2 ${isTop ? 'bg-[#b39552] text-white border-gray-900 dark:border-white' : 'bg-gray-800 dark:bg-white text-white dark:text-gray-900 border-white dark:border-zinc-800'}`}>
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-bold ${isTop ? 'text-white dark:text-gray-900' : 'text-gray-900 dark:text-white'}`}>{leader.full_name}</h3>
                    <p className={`text-xs font-medium ${isTop ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                      {leader.tasks_completed || 0} tasks completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-extrabold text-lg ${isTop ? 'text-[#b39552]' : 'text-gray-900 dark:text-white'}`}>
                    {leader.help_score || 0}
                  </div>
                  <div className={`text-[10px] uppercase tracking-wider font-bold ${isTop ? 'text-gray-300 dark:text-gray-500' : 'text-gray-400'}`}>Points</div>
                </div>
              </div>

              {/* Discord-Style Hover Card */}
              {hoveredLeader?.id === leader.id && (
                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 w-72 bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 z-[100] animate-in slide-in-from-left-2 fade-in duration-200 overflow-hidden">
                  <div className="h-20 bg-gray-900 dark:bg-white w-full relative">
                     <div className="absolute -bottom-8 left-6">
                        {leader.avatar_url ? (
                          <img src={leader.avatar_url} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-zinc-950 bg-white" />
                        ) : (
                          <div className="w-20 h-20 rounded-full border-4 border-white dark:border-zinc-950 bg-gray-100 flex items-center justify-center">
                             <UserCircle className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                     </div>
                  </div>
                  <div className="pt-10 px-6 pb-6">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      {leader.full_name}
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </h3>
                    
                    <div className="mt-4 space-y-3">
                      {leader.phone && (
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center">
                            <Phone className="w-4 h-4 text-gray-900 dark:text-white" />
                          </div>
                          {leader.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-[#b39552]" />
                        </div>
                        {leader.help_score || 0} Help Score
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-gray-900 dark:text-white" />
                        </div>
                        {leader.tasks_completed || 0} Tasks Completed
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
