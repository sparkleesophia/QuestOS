'use client';

import React, { useState } from 'react';
import { GoalCategory, Quest, QuestPriority } from '@/types/quest';
import { CATEGORY_CONFIG } from '@/lib/gamification';
import { X, Plus, Sparkles, Calendar, Tag, ShieldAlert } from 'lucide-react';

interface AddQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuest: (newQuest: Omit<Quest, 'id' | 'completed' | 'workMinutes'>) => void;
  defaultCategory?: GoalCategory;
}

export const AddQuestModal: React.FC<AddQuestModalProps> = ({
  isOpen,
  onClose,
  onAddQuest,
  defaultCategory = 'TECH',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>(defaultCategory);
  const [stage, setStage] = useState('');
  const [deadline, setDeadline] = useState('Today');
  const [isDaily, setIsDaily] = useState(true);
  const [priority, setPriority] = useState<QuestPriority>('HIGH');
  const [xp, setXp] = useState(50);
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    onAddQuest({
      title: title.trim(),
      description: description.trim() || 'No additional details provided.',
      category,
      stage: stage.trim() || `${CATEGORY_CONFIG[category].label} Sprint`,
      deadline: deadline.trim() || 'Today',
      isDaily,
      priority,
      xp: Number(xp) || 50,
      tags: tags.length > 0 ? tags : [category.toLowerCase()],
    });

    // Reset
    setTitle('');
    setDescription('');
    setTagsInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-lg p-6 sm:p-7 bg-[#0c101d] border border-purple-500/30 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Create New Micro-Quest</h3>
            <p className="text-xs text-slate-400">
              Break big goals into bite-sized tasks. Gain XP and level up your character.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quest Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Build Lead Scraper n8n Workflow with Baby"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Goal Track / Category <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['TECH', 'REVENUE', 'VENTURE', 'LIFE'] as GoalCategory[]).map((cat) => {
                const conf = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      category === cat
                        ? 'border-purple-500 bg-purple-500/15 text-white shadow'
                        : 'border-white/5 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold">{conf.label}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{conf.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Specific Action Items
            </label>
            <textarea
              rows={2}
              placeholder="What specifically needs to be done to check this off?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Row: Priority & XP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as QuestPriority)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="CRITICAL">🔥 Critical</option>
                <option value="HIGH">⚡ High Priority</option>
                <option value="MEDIUM">⚖️ Medium</option>
                <option value="LOW">🌱 Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                XP Reward
              </label>
              <div className="flex items-center gap-1.5">
                {[25, 50, 75, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setXp(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      xp === val
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row: Deadline & Stage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deadline
              </label>
              <input
                type="text"
                placeholder="e.g. Today, Tomorrow, Dec 2026"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stage / Milestone Group
              </label>
              <input
                type="text"
                placeholder="e.g. Month 1: Offer Crafting"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="siswaku, marketing, client-work"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Daily Quest Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDailyQuest"
              checked={isDaily}
              onChange={(e) => setIsDaily(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
            />
            <label htmlFor="isDailyQuest" className="text-xs font-medium text-slate-300 cursor-pointer">
              Mark as active Daily Quest (shows on today&apos;s checklist)
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Add Quest to QuestOS</span>
          </button>
        </form>
      </div>
    </div>
  );
};
