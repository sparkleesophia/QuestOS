'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GoalCategory, LevelInfo, N8nConfig, Quest, UserStats, WorkSession } from '@/types/quest';
import {
  calculateLevel,
  INITIAL_QUESTS,
  INITIAL_STATS,
} from '@/lib/gamification';
import {
  getStoredN8nConfig,
  getStoredQuests,
  getStoredSessions,
  getStoredStats,
  saveStoredN8nConfig,
  saveStoredQuests,
  saveStoredSessions,
  saveStoredStats,
  sendN8nEvent,
} from '@/lib/storage';
import { Header } from '@/components/Header';
import { PlayerHUD } from '@/components/PlayerHUD';
import { AttributeRadar } from '@/components/AttributeRadar';
import { DailyQuestBoard } from '@/components/DailyQuestBoard';
import { FocusTimerModal } from '@/components/FocusTimerModal';
import { AddQuestModal } from '@/components/AddQuestModal';
import { N8nSettingsModal } from '@/components/N8nSettingsModal';
import { LevelUpModal } from '@/components/LevelUpModal';
import { QuickWinModal } from '@/components/QuickWinModal';
import { Sparkles, Trophy } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [n8nConfig, setN8nConfig] = useState<N8nConfig>({
    webhookUrl: '',
    enabled: false,
    syncOnComplete: true,
    syncOnWorkSession: true,
  });

  // Modal States
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultCategory, setAddModalDefaultCategory] = useState<GoalCategory | undefined>();
  const [isN8nModalOpen, setIsN8nModalOpen] = useState(false);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const [isQuickWinOpen, setIsQuickWinOpen] = useState(false);
  const [quickWinQuest, setQuickWinQuest] = useState<Quest | null>(null);
  const [newLevelInfo, setNewLevelInfo] = useState<LevelInfo>(calculateLevel(INITIAL_STATS.totalXP));

  // Floating XP toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from localStorage on client mount
  useEffect(() => {
    setQuests(getStoredQuests());
    setStats(getStoredStats());
    setSessions(getStoredSessions());
    setN8nConfig(getStoredN8nConfig());
    setMounted(true);
  }, []);

  // Show floating toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper to check for level up
  const checkLevelUp = (oldXP: number, newXP: number) => {
    const oldLevel = calculateLevel(oldXP);
    const newLevel = calculateLevel(newXP);

    if (newLevel.level > oldLevel.level) {
      setNewLevelInfo(newLevel);
      setIsLevelUpModalOpen(true);
      if (n8nConfig.enabled) {
        sendN8nEvent('LEVEL_UP', { newLevel: newLevel.level, title: newLevel.title }, { ...stats, totalXP: newXP });
      }
    }
  };

  // Toggle Quest Complete / Active
  const handleToggleQuest = (questId: string) => {
    const targetQuest = quests.find((q) => q.id === questId);
    if (!targetQuest) return;

    const isNowCompleted = !targetQuest.completed;
    const xpChange = isNowCompleted ? targetQuest.xp : -targetQuest.xp;
    const oldXP = stats.totalXP;
    const newXP = Math.max(0, oldXP + xpChange);

    // Update quest
    const updatedQuests = quests.map((q) => {
      if (q.id === questId) {
        return {
          ...q,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
      }
      return q;
    });

    // Update stats
    const updatedCategoryXP = {
      ...stats.categoryXP,
      [targetQuest.category]: Math.max(
        0,
        (stats.categoryXP[targetQuest.category] || 0) + xpChange
      ),
    };

    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = stats.currentStreak;
    if (isNowCompleted && stats.lastActiveDate !== todayStr) {
      newStreak += 1;
    }

    const updatedStats: UserStats = {
      ...stats,
      totalXP: newXP,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
      lastActiveDate: todayStr,
      categoryXP: updatedCategoryXP,
    };

    setQuests(updatedQuests);
    setStats(updatedStats);
    saveStoredQuests(updatedQuests);
    saveStoredStats(updatedStats);

    if (isNowCompleted) {
      // Confetti burst for satisfying reward!
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
      showToast(`+${targetQuest.xp} XP! Quest Completed: ${targetQuest.title}`);
      checkLevelUp(oldXP, newXP);

      if (n8nConfig.enabled && n8nConfig.syncOnComplete) {
        sendN8nEvent(
          'QUEST_COMPLETED',
          {
            questId: targetQuest.id,
            questTitle: targetQuest.title,
            category: targetQuest.category,
            xpEarned: targetQuest.xp,
          },
          updatedStats
        );
      }
    } else {
      showToast(`Quest marked as active (-${targetQuest.xp} XP)`);
    }
  };

  // Add quick work time to quest
  const handleAddQuickTime = (questId: string, minutes: number) => {
    const targetQuest = quests.find((q) => q.id === questId);
    if (!targetQuest) return;

    // Award bonus XP: 10 XP per 30 minutes (minimum 5 XP for 15m)
    const bonusXP = minutes >= 60 ? 20 : minutes >= 30 ? 10 : 5;
    const oldXP = stats.totalXP;
    const newXP = oldXP + bonusXP;

    const updatedQuests = quests.map((q) => {
      if (q.id === questId) {
        return {
          ...q,
          workMinutes: (q.workMinutes || 0) + minutes,
        };
      }
      return q;
    });

    const updatedStats: UserStats = {
      ...stats,
      totalXP: newXP,
      totalMinutesWorked: stats.totalMinutesWorked + minutes,
      categoryXP: {
        ...stats.categoryXP,
        [targetQuest.category]: (stats.categoryXP[targetQuest.category] || 0) + bonusXP,
      },
    };

    const newSession: WorkSession = {
      id: `session-${Date.now()}`,
      questId: targetQuest.id,
      questTitle: targetQuest.title,
      category: targetQuest.category,
      minutes,
      xpEarned: bonusXP,
      date: new Date().toISOString(),
      notes: `Quick log: +${minutes}m`,
    };

    const updatedSessions = [newSession, ...sessions];

    setQuests(updatedQuests);
    setStats(updatedStats);
    setSessions(updatedSessions);
    saveStoredQuests(updatedQuests);
    saveStoredStats(updatedStats);
    saveStoredSessions(updatedSessions);

    showToast(`Logged ${minutes}m on "${targetQuest.title}"! (+${bonusXP} XP)`);
    checkLevelUp(oldXP, newXP);

    if (n8nConfig.enabled && n8nConfig.syncOnWorkSession) {
      sendN8nEvent(
        'WORK_SESSION_LOGGED',
        {
          questTitle: targetQuest.title,
          category: targetQuest.category,
          minutes,
          bonusXP,
        },
        updatedStats
      );
    }
  };

  // Complete session from Focus Timer Modal
  const handleCompleteSession = (
    questId: string | undefined,
    minutes: number,
    notes: string
  ) => {
    const targetQuest = quests.find((q) => q.id === questId);
    const category: GoalCategory = targetQuest ? targetQuest.category : 'TECH';

    // 10 XP per 30 minutes of focused deep work!
    const bonusXP = Math.max(5, Math.round((minutes / 30) * 10));
    const oldXP = stats.totalXP;
    const newXP = oldXP + bonusXP;

    let updatedQuests = quests;
    if (targetQuest) {
      updatedQuests = quests.map((q) => {
        if (q.id === targetQuest.id) {
          return {
            ...q,
            workMinutes: (q.workMinutes || 0) + minutes,
          };
        }
        return q;
      });
    }

    const updatedStats: UserStats = {
      ...stats,
      totalXP: newXP,
      totalMinutesWorked: stats.totalMinutesWorked + minutes,
      categoryXP: {
        ...stats.categoryXP,
        [category]: (stats.categoryXP[category] || 0) + bonusXP,
      },
    };

    const newSession: WorkSession = {
      id: `session-${Date.now()}`,
      questId: targetQuest?.id,
      questTitle: targetQuest?.title || 'Deep Work Sprint',
      category,
      minutes,
      xpEarned: bonusXP,
      date: new Date().toISOString(),
      notes,
    };

    const updatedSessions = [newSession, ...sessions];

    setQuests(updatedQuests);
    setStats(updatedStats);
    setSessions(updatedSessions);
    saveStoredQuests(updatedQuests);
    saveStoredStats(updatedStats);
    saveStoredSessions(updatedSessions);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
    });
    showToast(`Flow State Logged: ${minutes} mins (+${bonusXP} XP)`);
    checkLevelUp(oldXP, newXP);

    if (n8nConfig.enabled && n8nConfig.syncOnWorkSession) {
      sendN8nEvent(
        'WORK_SESSION_LOGGED',
        {
          questTitle: targetQuest?.title || 'Open Focus Sprint',
          category,
          minutes,
          bonusXP,
          notes,
        },
        updatedStats
      );
    }
  };

  // Add new quest
  const handleAddQuest = (
    newQuestData: Omit<Quest, 'id' | 'completed' | 'workMinutes'>
  ) => {
    const newQuest: Quest = {
      ...newQuestData,
      id: `quest-${Date.now()}`,
      completed: false,
      workMinutes: 0,
    };

    const updatedQuests = [newQuest, ...quests];
    setQuests(updatedQuests);
    saveStoredQuests(updatedQuests);
    showToast(`New Micro-Quest added: "${newQuest.title}"`);
  };

  // Delete quest
  const handleDeleteQuest = (questId: string) => {
    if (!confirm('Are you sure you want to delete this quest?')) return;
    const updatedQuests = quests.filter((q) => q.id !== questId);
    setQuests(updatedQuests);
    saveStoredQuests(updatedQuests);
    showToast('Quest deleted');
  };

  // Procrastination Buster algorithm
  const handleQuickWin = () => {
    const uncompleted = quests.filter((q) => !q.completed);
    if (uncompleted.length === 0) {
      alert('Congratulations! All quests are completed! Add a new one to keep leveling up.');
      return;
    }

    // Pick top daily quest or shortest deadline quest with highest XP/friction ratio
    const dailyUncompleted = uncompleted.filter((q) => q.isDaily);
    const chosen = dailyUncompleted.length > 0 ? dailyUncompleted[0] : uncompleted[0];

    setQuickWinQuest(chosen);
    setIsQuickWinOpen(true);
  };

  // Save n8n settings
  const handleSaveN8nConfig = (cfg: N8nConfig) => {
    setN8nConfig(cfg);
    saveStoredN8nConfig(cfg);
    showToast('n8n Automation Bridge settings saved!');
  };

  // Reset to sample initial state
  const handleResetData = () => {
    if (!confirm('Reset all quests and stats to initial default RPG roadmap?')) return;
    setQuests(INITIAL_QUESTS);
    setStats(INITIAL_STATS);
    setSessions([]);
    saveStoredQuests(INITIAL_QUESTS);
    saveStoredStats(INITIAL_STATS);
    saveStoredSessions([]);
    showToast('QuestOS reset to fresh starter roadmap!');
  };

  // Import backup data
  const handleImportData = (data: {
    quests: Quest[];
    stats: UserStats;
    sessions: WorkSession[];
  }) => {
    setQuests(data.quests);
    setStats(data.stats);
    setSessions(data.sessions);
    saveStoredQuests(data.quests);
    saveStoredStats(data.stats);
    saveStoredSessions(data.sessions);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="text-sm font-bold font-mono">Initializing QuestOS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
      {/* Top Header */}
      <Header
        onOpenFocusModal={() => setIsFocusModalOpen(true)}
        onOpenAddModal={() => {
          setAddModalDefaultCategory(undefined);
          setIsAddModalOpen(true);
        }}
        onOpenN8nModal={() => setIsN8nModalOpen(true)}
        n8nConfig={n8nConfig}
        quests={quests}
        stats={stats}
        sessions={sessions}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-8 w-full">
        {/* Player Status HUD & Countdowns */}
        <PlayerHUD
          stats={stats}
          quests={quests}
          onOpenFocusModal={() => setIsFocusModalOpen(true)}
          onQuickWinClick={handleQuickWin}
        />

        {/* 4 Pillars & Skill Trees */}
        <AttributeRadar
          stats={stats}
          quests={quests}
          onSelectCategoryFilter={(cat) => {
            setAddModalDefaultCategory(cat);
          }}
        />

        {/* Daily Quests & Micro-Quest Board */}
        <DailyQuestBoard
          quests={quests}
          onToggleQuest={handleToggleQuest}
          onDeleteQuest={handleDeleteQuest}
          onAddQuickTime={handleAddQuickTime}
          onOpenAddModal={(cat) => {
            setAddModalDefaultCategory(cat);
            setIsAddModalOpen(true);
          }}
        />
      </main>

      {/* Floating XP Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-500/40 text-white shadow-2xl shadow-purple-950/50 backdrop-blur-md animate-in slide-in-from-bottom-5">
          <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300">
            <Trophy className="w-5 h-5 animate-bounce" />
          </div>
          <div className="text-xs sm:text-sm font-bold">{toastMessage}</div>
        </div>
      )}

      {/* Modals */}
      <FocusTimerModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        quests={quests}
        onCompleteSession={handleCompleteSession}
      />

      <AddQuestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddQuest={handleAddQuest}
        defaultCategory={addModalDefaultCategory}
      />

      <N8nSettingsModal
        isOpen={isN8nModalOpen}
        onClose={() => setIsN8nModalOpen(false)}
        config={n8nConfig}
        onSaveConfig={handleSaveN8nConfig}
        stats={stats}
      />

      <LevelUpModal
        isOpen={isLevelUpModalOpen}
        onClose={() => setIsLevelUpModalOpen(false)}
        newLevelInfo={newLevelInfo}
      />

      <QuickWinModal
        isOpen={isQuickWinOpen}
        onClose={() => setIsQuickWinOpen(false)}
        quest={quickWinQuest}
        onStartQuest={(questId) => {
          setIsFocusModalOpen(true);
        }}
        onCompleteQuest={(questId) => {
          handleToggleQuest(questId);
        }}
      />
    </div>
  );
}
