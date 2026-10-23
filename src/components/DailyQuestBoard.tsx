'use client';

import React, { useState } from 'react';
import { GoalCategory, Quest, QuestPriority } from '@/types/quest';
import { CATEGORY_CONFIG } from '@/lib/gamification';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  Flame,
  Check
} from 'lucide-react';

interface DailyQuestBoardProps {
  quests: Quest[];
  onToggleQuest: (questId: string) => void;
  onDeleteQuest: (questId: string) => void;
  onAddQuickTime: (questId: string, minutes: number) => void;
  onOpenAddModal: (defaultCategory?: GoalCategory) => void;
}

export const DailyQuestBoard: React.FC<DailyQuestBoardProps> = ({
  quests,
  onToggleQuest,
  onDeleteQuest,
  onAddQuickTime,
  onOpenAddModal,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'DAILY' | 'PRIORITY' | GoalCategory>('DAILY');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredQuests = quests.filter((q) => {
    // Search
    if (searchQuery.trim() !== '') {
      const qLower = searchQuery.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(qLower);
      const matchDesc = q.description.toLowerCase().includes(qLower);
      const matchTags = q.tags?.some((t) => t.toLowerCase().includes(qLower));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    // Tab filter
    if (activeTab === 'DAILY') return q.isDaily;
    if (activeTab === 'PRIORITY') return q.priority === 'CRITICAL' || q.priority === 'HIGH';
    if (activeTab === 'ALL') return true;
    return q.category === activeTab;
  });

  const getPriorityBadge = (priority: QuestPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" /> Critical
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">
            Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-white/5">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Quest Log & Daily Board</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
              {filteredQuests.filter((q) => q.completed).length}/{filteredQuests.length} Finished
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete micro-quests daily, gain XP, level up, and conquer realistic milestones.
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal(activeTab !== 'ALL' && activeTab !== 'DAILY' && activeTab !== 'PRIORITY' ? activeTab : undefined)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Micro-Quest</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveTab('DAILY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'DAILY'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Today&apos;s Quests</span>
          </button>

          <button
            onClick={() => setActiveTab('PRIORITY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'PRIORITY'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            🔥 High Priority
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'ALL'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Quests
          </button>

          <button
            onClick={() => setActiveTab('TECH')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'TECH'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>AI Skills</span>
          </button>

          <button
            onClick={() => setActiveTab('REVENUE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'REVENUE'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Agency $2k</span>
          </button>

          <button
            onClick={() => setActiveTab('VENTURE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'VENTURE'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Siswaku Biz</span>
          </button>

          <button
            onClick={() => setActiveTab('LIFE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'LIFE'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Life Mastery</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search micro-quests or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      {/* Quest Cards List */}
      <div className="space-y-3">
        {filteredQuests.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/20">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
            <h3 className="text-base font-bold text-slate-300">No active quests found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You&apos;ve cleared everything in this view or no quests match your filter. Add a new micro-quest to keep your momentum going!
            </p>
            <button
              onClick={() => onOpenAddModal()}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all"
            >
              + Create Micro-Quest
            </button>
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const cat = CATEGORY_CONFIG[quest.category];

            return (
              <div
                key={quest.id}
                className={`glass-panel p-4 sm:p-5 relative transition-all duration-200 ${
                  quest.completed
                    ? 'opacity-65 bg-slate-950/40 border-emerald-500/20'
                    : 'bg-slate-900/70 hover:bg-slate-800/80 hover:border-white/20 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Checkbox + Quest Details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Checkbox Button */}
                    <button
                      onClick={() => onToggleQuest(quest.id)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        quest.completed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'border-2 border-slate-600 hover:border-purple-400 bg-slate-900/80 hover:bg-purple-500/10'
                      }`}
                      title={quest.completed ? 'Mark as active' : 'Complete Quest'}
                    >
                      {quest.completed ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : null}
                    </button>

                    {/* Quest Text Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Category Tag */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeClass}`}>
                          {cat.label}
                        </span>

                        {/* Priority Badge */}
                        {getPriorityBadge(quest.priority)}

                        {/* XP Badge */}
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20 font-mono">
                          +{quest.xp} XP
                        </span>

                        {/* Stage */}
                        {quest.stage && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            • {quest.stage}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold text-white transition-all leading-snug ${
                          quest.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {quest.title}
                      </h3>

                      <p
                        className={`text-xs text-slate-400 mt-1 leading-relaxed ${
                          quest.completed ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {quest.description}
                      </p>

                      {/* Meta Footer (Tags, Deadline, Work Time) */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                        {/* Deadline */}
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Deadline: <strong className="text-slate-300 font-medium">{quest.deadline}</strong></span>
                        </div>

                        {/* Logged Work Time */}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Logged: <strong className="text-cyan-400 font-mono font-medium">{quest.workMinutes || 0}m</strong></span>
                        </div>

                        {/* Tags */}
                        {quest.tags && quest.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Tag className="w-3 h-3 text-slate-500" />
                            {quest.tags.map((tag) => (
                              <span key={tag} className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-white/5">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Quick Time Logging & Delete */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onAddQuickTime(quest.id, 15)}
                        title="Add 15 minutes of work"
                        className="text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-800/90 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/5 transition-all text-slate-300 font-mono"
                      >
                        +15m
                      </button>
                      <button
                        onClick={() => onAddQuickTime(quest.id, 30)}
                        title="Add 30 minutes of work (+10 XP bonus)"
                        className="text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-800/90 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/5 transition-all text-slate-300 font-mono"
                      >
                        +30m
                      </button>
                      <button
                        onClick={() => onAddQuickTime(quest.id, 60)}
                        title="Add 1 hour of work (+20 XP bonus)"
                        className="text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-800/90 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/5 transition-all text-slate-300 font-mono"
                      >
                        +1h
                      </button>
                    </div>

                    <button
                      onClick={() => onDeleteQuest(quest.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      title="Delete Quest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
