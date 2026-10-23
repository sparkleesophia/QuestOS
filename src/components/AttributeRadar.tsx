'use client';

import React from 'react';
import { GoalCategory, Quest, UserStats } from '@/types/quest';
import { CATEGORY_CONFIG } from '@/lib/gamification';
import { Code2, DollarSign, Briefcase, Compass, CheckCircle } from 'lucide-react';

interface AttributeRadarProps {
  stats: UserStats;
  quests: Quest[];
  onSelectCategoryFilter: (category: GoalCategory) => void;
}

export const AttributeRadar: React.FC<AttributeRadarProps> = ({
  stats,
  quests,
  onSelectCategoryFilter,
}) => {
  const categories: GoalCategory[] = ['TECH', 'REVENUE', 'VENTURE', 'LIFE'];

  const getIcon = (cat: GoalCategory) => {
    switch (cat) {
      case 'TECH':
        return <Code2 className="w-5 h-5 text-cyan-400" />;
      case 'REVENUE':
        return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case 'VENTURE':
        return <Briefcase className="w-5 h-5 text-purple-400" />;
      case 'LIFE':
        return <Compass className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="glass-panel p-6 bg-slate-900/60 border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Skill Trees & Goal Pillars</span>
          </h2>
          <p className="text-xs text-slate-400">
            Balanced growth across your top 4 active life and career tracks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((catKey) => {
          const config = CATEGORY_CONFIG[catKey];
          const catQuests = quests.filter((q) => q.category === catKey);
          const completedCount = catQuests.filter((q) => q.completed).length;
          const totalCount = catQuests.length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const xp = stats.categoryXP[catKey] || 0;

          // Next uncompleted quest
          const nextQuest = catQuests.find((q) => !q.completed);

          return (
            <div
              key={catKey}
              onClick={() => onSelectCategoryFilter(catKey)}
              className="p-4 rounded-xl bg-slate-900/80 border border-white/5 hover:border-white/20 transition-all cursor-pointer group hover:bg-slate-800/80"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-800 border border-white/10">
                    {getIcon(catKey)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {config.label}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {xp} XP Earned
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white font-mono">{percent}%</span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {completedCount}/{totalCount}
                  </div>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>

              {/* Next quest teaser */}
              <div className="mt-3 pt-2.5 border-t border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                  Next Step:
                </div>
                <div className="text-xs text-slate-300 font-medium truncate mt-0.5">
                  {nextQuest ? nextQuest.title : 'All Current Quests Done! 🎉'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
