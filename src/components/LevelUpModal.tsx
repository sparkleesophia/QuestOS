'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LevelInfo } from '@/types/quest';
import { Award, Sparkles, X, ChevronRight } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevelInfo: LevelInfo;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevelInfo,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger festive multi-stage confetti
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in">
      <div className="glass-panel w-full max-w-md p-8 bg-gradient-to-b from-[#131b2e] via-[#0d1222] to-[#080c16] border-2 border-yellow-500/40 shadow-2xl shadow-yellow-500/20 text-center relative overflow-hidden">
        {/* Background rays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/15 via-transparent to-transparent pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Level Up Crest */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-1 shadow-2xl shadow-amber-500/40 animate-bounce">
          <div className="w-full h-full rounded-3xl bg-[#090e1c] flex flex-col items-center justify-center">
            <Award className="w-10 h-10 text-amber-400" />
            <span className="text-xl font-black text-white mt-1">
              LVL {newLevelInfo.level}
            </span>
          </div>
        </div>

        {/* Level Up Text */}
        <div className="mt-5">
          <span className="text-xs uppercase tracking-widest font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            LEVEL UP ACHIEVED!
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 tracking-tight">
            {newLevelInfo.title}
          </h2>

          <p className="text-sm text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
            Your discipline paid off! You conquered micro-quests, defeated procrastination, and expanded your capabilities.
          </p>
        </div>

        {/* Next Tier preview */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-white/5 text-left">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Current Status
          </div>
          <div className="flex items-center justify-between text-xs text-white font-mono mt-1">
            <span>Minimum XP for this Tier:</span>
            <span className="text-amber-400 font-bold">{newLevelInfo.minXP} XP</span>
          </div>
          <div className="flex items-center justify-between text-xs text-white font-mono mt-1">
            <span>Next Rank Unlocks at:</span>
            <span className="text-purple-400 font-bold">{newLevelInfo.nextLevelXP} XP</span>
          </div>
        </div>

        {/* Claim button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Continue The Journey</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
