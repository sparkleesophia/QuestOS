'use client';

import React from 'react';
import { UserStats, Quest } from '@/types/quest';
import { calculateLevel, CATEGORY_CONFIG } from '@/lib/gamification';
import {
  Flame,
  Clock,
  Sparkles,
  HeartHandshake,
  Car,
  Plane,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';

interface PlayerHUDProps {
  stats: UserStats;
  quests: Quest[];
  onOpenFocusModal: () => void;
  onQuickWinClick: () => void;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({
  stats,
  quests,
  onOpenFocusModal,
  onQuickWinClick,
}) => {
  const levelInfo = calculateLevel(stats.totalXP);
  const dailyQuests = quests.filter((q) => q.isDaily);
  const completedDaily = dailyQuests.filter((q) => q.completed).length;
  const hoursWorked = (stats.totalMinutesWorked / 60).toFixed(1);

  // Countdown calculations
  const calculateDaysLeft = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysToReunion = calculateDaysLeft('2027-04-30'); // ~6 months
  const daysToDriving = calculateDaysLeft('2026-12-31'); // End of 2026
  const daysToPassport = calculateDaysLeft('2027-03-31'); // Q1 2027

  return (
    <div className="space-y-6">
      {/* Top Hero Card */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[#0f172a]/90 via-[#131b2e]/80 to-[#0b101d]/90 border border-purple-500/20 shadow-2xl shadow-purple-950/20">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Player Identity */}
          <div className="flex items-center gap-5">
            {/* Glowing Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-purple-500/30 pulse-glow">
                <div className="w-full h-full rounded-2xl bg-[#090d18] flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Lvl {levelInfo.level}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                    Player
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-purple-600 border-2 border-[#090d18] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                RANK {levelInfo.level}
              </div>
            </div>

            {/* Title & Level Details */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Active Class
                </span>
                <span className="text-xs text-slate-400">XP Multiplier: 1.1x</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                {levelInfo.title}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Path of AI Automation & Agency Mastery
              </p>
            </div>
          </div>

          {/* Right: Quick Action Hub */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onQuickWinClick}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 font-semibold text-sm transition-all shadow-lg shadow-amber-950/20 active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Bust Procrastination (Quick Win)</span>
            </button>

            <button
              onClick={onOpenFocusModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/30 active:scale-95"
            >
              <Clock className="w-4 h-4 text-purple-200" />
              <span>Start Focus Timer</span>
            </button>
          </div>
        </div>

        {/* XP Progress Section */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Experience Progress</span>
              <span className="text-pink-400 font-mono">
                {stats.totalXP} / {levelInfo.nextLevelXP} XP
              </span>
            </div>
            <div className="text-slate-400 font-mono">
              <span className="text-white font-bold">{levelInfo.progressPercent}%</span> to Level{' '}
              {levelInfo.level + 1} ({levelInfo.nextLevelXP - stats.totalXP} XP remaining)
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full h-3.5 bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out animate-shimmer shadow-lg"
              style={{ width: `${Math.max(5, levelInfo.progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Bottom Vital Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Daily Streak</div>
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                {stats.currentStreak} Days
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Deep Work Logged</div>
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                {hoursWorked} hrs
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Today&apos;s Quests</div>
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                {completedDaily}/{dailyQuests.length} Done
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Active Rank</div>
              <div className="text-base sm:text-lg font-bold text-white truncate">
                Lvl {levelInfo.level}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realistic Timelines & Big Milestone Countdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Milestone 1: The Reunion Protocol ($2,000/mo) */}
        <div className="glass-panel p-5 bg-gradient-to-br from-emerald-950/20 to-slate-900/60 border border-emerald-500/30 relative group hover:border-emerald-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              6-Month Goal
            </span>
          </div>

          <div className="mt-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              The Reunion Protocol
            </h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Target: Reach $2,000+/mo agency revenue with baby to meet in person.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/10 flex items-center justify-between">
            <div className="text-xs text-slate-400">Target Deadline</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              ~{daysToReunion} Days Left
            </div>
          </div>
        </div>

        {/* Milestone 2: Driving License */}
        <div className="glass-panel p-5 bg-gradient-to-br from-amber-950/20 to-slate-900/60 border border-amber-500/30 relative group hover:border-amber-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              Target: 2026 Ends
            </span>
          </div>

          <div className="mt-3">
            <h2 className="text-base font-bold text-white">Drive a Car (SIM A)</h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Pass theory & practical driving test before 2026 ends.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-500/10 flex items-center justify-between">
            <div className="text-xs text-slate-400">Remaining Time</div>
            <div className="text-sm font-bold text-amber-400 font-mono">
              {daysToDriving} Days Left
            </div>
          </div>
        </div>

        {/* Milestone 3: Passport */}
        <div className="glass-panel p-5 bg-gradient-to-br from-cyan-950/20 to-slate-900/60 border border-cyan-500/30 relative group hover:border-cyan-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Plane className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              Target: Q1 2027
            </span>
          </div>

          <div className="mt-3">
            <h2 className="text-base font-bold text-white">Passport Readiness</h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Prepare documents, M-Paspor booking, and immigration biometrics.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-500/10 flex items-center justify-between">
            <div className="text-xs text-slate-400">Target Window</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">
              ~{daysToPassport} Days Left
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
