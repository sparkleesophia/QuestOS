import { GoalCategory, N8nConfig, Quest, UserStats, WorkSession } from '@/types/quest';
import { calculateLevel, INITIAL_QUESTS, INITIAL_STATS } from './gamification';

const STORAGE_KEYS = {
  QUESTS: 'questos_v1_quests',
  STATS: 'questos_v1_stats',
  SESSIONS: 'questos_v1_sessions',
  N8N_CONFIG: 'questos_v1_n8n_config',
};

export const DEFAULT_N8N_CONFIG: N8nConfig = {
  webhookUrl: '',
  enabled: false,
  syncOnComplete: true,
  syncOnWorkSession: true,
};

// Check if running in browser
const isClient = () => typeof window !== 'undefined';

export function getStoredQuests(): Quest[] {
  if (!isClient()) return INITIAL_QUESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTS);
    if (!raw) {
      saveStoredQuests(INITIAL_QUESTS);
      return INITIAL_QUESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load quests from localStorage', e);
    return INITIAL_QUESTS;
  }
}

export function saveStoredQuests(quests: Quest[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  } catch (e) {
    console.error('Failed to save quests to localStorage', e);
  }
}

export function getStoredStats(): UserStats {
  if (!isClient()) return INITIAL_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      saveStoredStats(INITIAL_STATS);
      return INITIAL_STATS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load stats from localStorage', e);
    return INITIAL_STATS;
  }
}

export function saveStoredStats(stats: UserStats): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats to localStorage', e);
  }
}

export function getStoredSessions(): WorkSession[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load sessions from localStorage', e);
    return [];
  }
}

export function saveStoredSessions(sessions: WorkSession[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage', e);
  }
}

export function getStoredN8nConfig(): N8nConfig {
  if (!isClient()) return DEFAULT_N8N_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.N8N_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_N8N_CONFIG;
  } catch (e) {
    console.error('Failed to load n8n config from localStorage', e);
    return DEFAULT_N8N_CONFIG;
  }
}

export function saveStoredN8nConfig(config: N8nConfig): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.N8N_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save n8n config to localStorage', e);
  }
}

// Dispatch event to n8n webhook via Next.js proxy
export async function sendN8nEvent(
  event: 'QUEST_COMPLETED' | 'QUEST_UNCHECKED' | 'WORK_SESSION_LOGGED' | 'LEVEL_UP',
  payload: Record<string, unknown>,
  stats: UserStats,
  configOverride?: N8nConfig
): Promise<{ success: boolean; message: string }> {
  const config = configOverride || getStoredN8nConfig();
  if (!config.enabled || !config.webhookUrl) {
    return { success: false, message: 'n8n integration disabled or Webhook URL empty' };
  }

  const levelInfo = calculateLevel(stats.totalXP);
  const body = {
    event,
    timestamp: new Date().toISOString(),
    player: {
      level: levelInfo.level,
      title: levelInfo.title,
      totalXP: stats.totalXP,
      streak: stats.currentStreak,
      totalHours: (stats.totalMinutesWorked / 60).toFixed(1),
    },
    data: payload,
  };

  try {
    const res = await fetch('/api/n8n/dispatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhookUrl: config.webhookUrl,
        apiKey: config.apiKey,
        payload: body,
      }),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, message: 'Event successfully dispatched to n8n!' };
    } else {
      return { success: false, message: result.error || `HTTP ${res.status}` };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('n8n Webhook Dispatch failed:', msg);
    return { success: false, message: `Webhook error: ${msg}` };
  }
}
