'use client';

import React, { useRef } from 'react';
import {
  Gamepad2,
  Network,
  Clock,
  Plus,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { N8nConfig, Quest, UserStats, WorkSession } from '@/types/quest';

interface HeaderProps {
  onOpenFocusModal: () => void;
  onOpenAddModal: () => void;
  onOpenN8nModal: () => void;
  n8nConfig: N8nConfig;
  quests: Quest[];
  stats: UserStats;
  sessions: WorkSession[];
  onImportData: (data: { quests: Quest[]; stats: UserStats; sessions: WorkSession[] }) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFocusModal,
  onOpenAddModal,
  onOpenN8nModal,
  n8nConfig,
  quests,
  stats,
  sessions,
  onImportData,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      quests,
      stats,
      sessions,
      n8nConfig,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.quests && parsed.stats) {
          onImportData({
            quests: parsed.quests,
            stats: parsed.stats,
            sessions: parsed.sessions || [],
          });
          alert('QuestOS data successfully imported!');
        } else {
          alert('Invalid QuestOS backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="border-b border-white/10 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-purple-600/30">
            <div className="w-full h-full rounded-[10px] bg-[#090d18] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                Quest<span className="text-cyan-400">OS</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                RPG TRACKER
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">
              Daily Micro-Quests &bull; XP Engine &bull; n8n Linked
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* n8n Status Badge / Button */}
          <button
            onClick={onOpenN8nModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              n8nConfig.enabled && n8nConfig.webhookUrl
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Configure n8n Webhook Sync"
          >
            <Network className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {n8nConfig.enabled && n8nConfig.webhookUrl ? 'n8n Connected' : 'Connect n8n'}
            </span>
          </button>

          {/* Backup & Import dropdown / buttons */}
          <button
            onClick={handleExport}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5 transition-colors hidden sm:flex"
            title="Export JSON Backup"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5 transition-colors hidden sm:flex"
            title="Import JSON Backup"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={onResetData}
            className="p-2 rounded-xl text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 border border-white/5 transition-colors hidden lg:flex"
            title="Reset to Initial Sample Quests"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Focus Mode button */}
          <button
            onClick={onOpenFocusModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-bold transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Focus</span>
          </button>

          {/* New Quest Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Quest</span>
          </button>
        </div>
      </div>
    </header>
  );
};
