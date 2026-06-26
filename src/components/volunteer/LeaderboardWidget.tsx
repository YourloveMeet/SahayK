'use client'

import React, { useState } from 'react';
import { Trophy, Phone, ShieldCheck, UserCircle, MapPin, X } from 'lucide-react';

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
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  if (!leaders || leaders.length === 0) return null;

  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-black/60 rounded-[1rem] border border-gray-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md flex flex-col h-full relative z-10">
      <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-between shrink-0 rounded-t-[1rem]">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gray-900 dark:text-white" /> Top Volunteers
        </h2>
      </div>
      
      <div className="p-5 space-y-4 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
        {leaders.map((leader, index) => {
          const isTop = index === 0;
          return (
            <div
              key={leader.id}
              className=""
              onClick={() => setSelectedLeader(leader)}
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

            </div>
          );
        })}
      </div>

      {/* Volunteer Details Popup */}
      {selectedLeader && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0A0A0A] rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-white/10">
            <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2 text-white">
                <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" /> 
                Volunteer Details
              </h2>
              <button onClick={() => setSelectedLeader(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 sm:p-8 overflow-y-auto">
              <div className="flex gap-3 sm:gap-4 items-start mb-6 sm:mb-8">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                  {selectedLeader.avatar_url ? (
                    <img src={selectedLeader.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <UserCircle className="w-full h-full text-white/30 p-2" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-black flex items-center gap-2 text-white break-words line-clamp-2">
                    {selectedLeader.full_name}
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  </h3>
                  <div className="flex gap-2 mt-1 sm:mt-2">
                    <span className="bg-[#b39552]/20 text-[#b39552] text-[9px] sm:text-[10px] uppercase font-black px-2 py-0.5 rounded-full border border-[#b39552]/30">Top Volunteer</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <p className="font-bold text-sm sm:text-base text-white">{selectedLeader.phone || 'Not provided'}</p>
                </div>
                
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Tasks
                  </p>
                  <p className="font-black text-base sm:text-lg text-white">{selectedLeader.tasks_completed || 0}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#b39552]/20 to-[#b39552]/5 p-4 sm:p-5 rounded-2xl border border-[#b39552]/30 flex items-center justify-between shadow-inner">
                <div>
                  <p className="text-[#b39552] font-black text-[10px] sm:text-xs uppercase tracking-widest mb-1">Impact Score</p>
                  <p className="text-2xl sm:text-3xl font-black text-white">{selectedLeader.help_score || 0}</p>
                </div>
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#b39552]/50 drop-shadow-md" />
              </div>

              <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-white/10 flex gap-3">
                <button 
                  onClick={() => {
                    if (selectedLeader.phone) {
                      window.open(`tel:${selectedLeader.phone}`, '_self');
                    } else {
                      alert('No phone number available.');
                    }
                  }}
                  className="flex-1 py-4 flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black font-black rounded-xl transition-all shadow-lg hover:scale-[1.02]"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Volunteer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
