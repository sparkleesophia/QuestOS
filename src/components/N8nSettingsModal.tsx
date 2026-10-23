'use client';

import React, { useState } from 'react';
import { N8nConfig, UserStats } from '@/types/quest';
import { sendN8nEvent } from '@/lib/storage';
import { X, Network, Send, CheckCircle2, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface N8nSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: N8nConfig;
  onSaveConfig: (config: N8nConfig) => void;
  stats: UserStats;
}

export const N8nSettingsModal: React.FC<N8nSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  stats,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || '');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [enabled, setEnabled] = useState(config.enabled ?? false);
  const [syncOnComplete, setSyncOnComplete] = useState(config.syncOnComplete ?? true);
  const [syncOnWorkSession, setSyncOnWorkSession] = useState(config.syncOnWorkSession ?? true);

  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [copiedBlueprint, setCopiedBlueprint] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      webhookUrl: webhookUrl.trim(),
      apiKey: apiKey.trim(),
      enabled,
      syncOnComplete,
      syncOnWorkSession,
    });
    onClose();
  };

  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      setTestStatus({
        loading: false,
        success: false,
        message: 'Please enter a webhook URL first!',
      });
      return;
    }

    setTestStatus({ loading: true });
    const tempConfig: N8nConfig = {
      webhookUrl: webhookUrl.trim(),
      apiKey: apiKey.trim(),
      enabled: true,
      syncOnComplete: true,
      syncOnWorkSession: true,
    };

    const res = await sendN8nEvent(
      'QUEST_COMPLETED',
      {
        test: true,
        message: 'QuestOS connection test successful! RPG leveling engine linked.',
        questTitle: 'Test Webhook Verification Quest',
        xpEarned: 50,
      },
      stats,
      tempConfig
    );

    setTestStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  const sampleN8nBlueprint = `{
  "name": "QuestOS Telegram Level Bot",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "questos",
        "responseMode": "onReceived",
        "responseData": "allEntries"
      },
      "name": "QuestOS Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "chatId": "YOUR_TELEGRAM_CHAT_ID",
        "text": "=🔥 *QuestOS Event*: {{$json.body.event}}\\n👤 *Player Level*: {{$json.body.player.level}} ({{$json.body.player.title}})\\n⚡ *Total XP*: {{$json.body.player.totalXP}} XP\\n🎯 *Quest*: {{$json.body.data.questTitle || 'Deep Work Session'}}\\n⏳ *Total Hours Logged*: {{$json.body.player.totalHours}} hrs",
        "additionalFields": { "parse_mode": "Markdown" }
      },
      "name": "Telegram Bot",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1,
      "position": [460, 300]
    }
  ]
}`;

  const copyBlueprint = () => {
    navigator.clipboard.writeText(sampleN8nBlueprint);
    setCopiedBlueprint(true);
    setTimeout(() => setCopiedBlueprint(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-xl p-6 sm:p-7 bg-[#0c101d] border border-cyan-500/30 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">n8n Automation Bridge</h3>
            <p className="text-xs text-slate-400">
              Connect QuestOS to your self-hosted n8n server to trigger Telegram bots, Notion sync, and AI alerts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-white/10">
            <div>
              <div className="text-xs font-bold text-white">Enable n8n Webhook Sync</div>
              <div className="text-[11px] text-slate-400">
                Dispatch live events when completing quests or logging work sessions
              </div>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              n8n Webhook URL
            </label>
            <input
              type="url"
              placeholder="https://n8n.yourserver.com/webhook/questos-trigger"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Paste the Test or Production Webhook URL from your n8n workflow.
            </p>
          </div>

          {/* Optional Bearer / API Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Authorization Token / Secret (Optional)
            </label>
            <input
              type="password"
              placeholder="Optional Bearer token or HMAC secret"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Event Triggers */}
          <div className="space-y-2 pt-1">
            <span className="block text-xs font-semibold text-slate-300">
              Active Trigger Events
            </span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="syncComplete"
                checked={syncOnComplete}
                onChange={(e) => setSyncOnComplete(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
              />
              <label htmlFor="syncComplete" className="text-xs text-slate-300 cursor-pointer">
                Send event when a Quest is marked complete (with XP & player level)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="syncWork"
                checked={syncOnWorkSession}
                onChange={(e) => setSyncOnWorkSession(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
              />
              <label htmlFor="syncWork" className="text-xs text-slate-300 cursor-pointer">
                Send event when a Focus Work Session is finished
              </label>
            </div>
          </div>

          {/* Connection Test Output */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus.loading}
                className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testStatus.loading ? 'Testing Webhook...' : 'Test n8n Webhook'}</span>
              </button>

              {testStatus.message && (
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold ${
                    testStatus.success ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {testStatus.success ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* n8n Workflow Blueprint / Template */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                📋 n8n Workflow Blueprint (Copy & Paste)
              </span>
              <button
                type="button"
                onClick={copyBlueprint}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedBlueprint ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Paste this directly into your n8n canvas (Webhook Node + Telegram Bot Node) to receive live RPG level-up alerts!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
