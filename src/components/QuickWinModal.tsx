'use client';

import React from 'react';
import { Quest } from '@/types/quest';
import { CATEGORY_CONFIG } from '@/lib/gamification';
import { Zap, Clock, Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';

interface QuickWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest | null;
  onStartQuest: (questId: string) => void;
  onCompleteQuest: (questId: string) => void;
}

export const QuickWinModal: React.FC<QuickWinModalProps> = ({
  isOpen,
  onClose,
  quest,
  onStartQuest,
  onCompleteQuest,
}) => {
  if (!isOpen || !quest) return null;

  const cat = CATEGORY_CONFIG[quest.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-md p-6 sm:p-7 bg-[#0f1424] border border-amber-500/40 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Procrastination Buster
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Your Suggested Quick Win</h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The hardest part is just starting! Commit to just <strong>10 to 15 minutes</strong> on this single micro-quest to break resistance and trigger momentum:
        </p>

        {/* Selected Quest Card */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeClass}`}>
              {cat.label}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20 font-mono">
              +{quest.xp} XP
            </span>
            <span className="text-[10px] text-slate-400">
              • {quest.stage}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white">{quest.title}</h4>
          <p className="text-xs text-slate-400">{quest.description}</p>

          <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400 border-t border-white/5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Target Focus: <strong>15-25 minutes</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => {
              onStartQuest(quest.id);
              onClose();
            }}
            className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all active:scale-95"
          >
            <Clock className="w-4 h-4" />
            <span>Start Timer for This</span>
          </button>

          <button
            onClick={() => {
              onCompleteQuest(quest.id);
              onClose();
            }}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark As Done (+{quest.xp} XP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
