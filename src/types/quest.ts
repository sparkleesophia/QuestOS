export type GoalCategory = 'TECH' | 'REVENUE' | 'VENTURE' | 'LIFE';

export type QuestPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type QuestStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  xp: number;
  stage: string;
  deadline: string; // ISO date or descriptive
  isDaily: boolean;
  completed: boolean;
  completedAt?: string;
  priority: QuestPriority;
  workMinutes: number;
  tags: string[];
}

export interface UserStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalMinutesWorked: number;
  categoryXP: {
    TECH: number;
    REVENUE: number;
    VENTURE: number;
    LIFE: number;
  };
}

export interface WorkSession {
  id: string;
  questId?: string;
  questTitle?: string;
  category: GoalCategory;
  minutes: number;
  xpEarned: number;
  date: string;
  notes?: string;
}

export interface N8nConfig {
  webhookUrl: string;
  apiKey?: string;
  enabled: boolean;
  syncOnComplete: boolean;
  syncOnWorkSession: boolean;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  nextLevelXP: number;
  progressPercent: number;
}
