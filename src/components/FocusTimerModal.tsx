'use client';

import React, { useState, useEffect } from 'react';
import { Quest } from '@/types/quest';
import { Play, Pause, RotateCcw, Check, X, Clock, Sparkles } from 'lucide-react';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  onCompleteSession: (questId: string | undefined, minutes: number, notes: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  quests,
  onCompleteSession,
}) => {
  const [mode, setMode] = useState<'POMODORO' | 'STOPWATCH'>('POMODORO');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // 25 min default
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Handle countdown / count up
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (mode === 'POMODORO') {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              setIsActive(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, mode]);

  if (!isOpen) return null;

  const activeQuests = quests.filter((q) => !q.completed);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === 'POMODORO') {
      setSecondsLeft(25 * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const handleFinishAndSave = () => {
    let minutesWorked = 0;
    if (mode === 'POMODORO') {
      const elapsedSecs = 25 * 60 - secondsLeft;
      minutesWorked = Math.max(1, Math.round(elapsedSecs / 60));
    } else {
      minutesWorked = Math.max(1, Math.round(stopwatchSeconds / 60));
    }

    onCompleteSession(selectedQuestId || undefined, minutesWorked, sessionNotes);
    setIsActive(false);
    setSecondsLeft(25 * 60);
    setStopwatchSeconds(0);
    setSessionNotes('');
    onClose();
  };

  const currentTime = mode === 'POMODORO' ? secondsLeft : stopwatchSeconds;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-lg p-6 sm:p-8 bg-[#0c101d] border border-purple-500/30 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Focus & Work Session</h3>
            <p className="text-xs text-slate-400">
              Track your deep work time. Earn +10 XP for every 30 minutes focused!
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 mt-6 p-1 bg-slate-900/80 rounded-xl border border-white/5">
          <button
            onClick={() => {
              setIsActive(false);
              setMode('POMODORO');
              setSecondsLeft(25 * 60);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'POMODORO'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            25m Pomodoro Sprint
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              setMode('STOPWATCH');
              setStopwatchSeconds(0);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'STOPWATCH'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Stopwatch
          </button>
        </div>

        {/* Big Digital Timer Display */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative flex items-center justify-center">
            {/* Glowing ring animation */}
            <div
              className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'border-purple-500 shadow-2xl shadow-purple-500/40'
                  : 'border-slate-800'
              }`}
            >
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider mt-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {isActive ? 'In Deep Flow' : 'Timer Paused'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-95 border border-white/5"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleTimer}
              className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                isActive
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Start Focus
                </>
              )}
            </button>
          </div>
        </div>

        {/* Attach to Micro-Quest */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Attach Work to Quest (Optional)
            </label>
            <select
              value={selectedQuestId}
              onChange={(e) => setSelectedQuestId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">-- General Work Session (No specific quest) --</option>
              {activeQuests.map((q) => (
                <option key={q.id} value={q.id}>
                  [{q.category}] {q.title} (+{q.xp} XP)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Session Notes
            </label>
            <input
              type="text"
              placeholder="What did you build or accomplish?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleFinishAndSave}
            className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Finish Session & Log Work Time</span>
          </button>
        </div>
      </div>
    </div>
  );
};
