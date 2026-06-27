import { useGameStore } from '../store/gameStore';
import { UPGRADES } from '../engine/constants';
import { calculateUpgradeCost } from '../engine/core';
import type { UpgradeId } from '../engine/types';
import { formatNumber } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { motion } from 'framer-motion';
import { Zap, Wrench, AlertTriangle, ArrowUpCircle, ShieldCheck, Factory } from 'lucide-react';

const ICONS: Record<string, any> = {
  '5s': Zap,
  'kanban': ArrowUpCircle,
  'pokayoke': ShieldCheck,
  'tpm': Wrench,
  'andon': AlertTriangle,
  'heijunka': Factory,
};

export const UpgradeStore = () => {
  const { points, upgrades, buy } = useGameStore();

  return (
    <div className="w-full lg:w-80 flex-shrink-0 bg-slate-800/50 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-slate-700 p-6 flex flex-col h-full lg:overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-2">
        <ArrowUpCircle className="text-emerald-400" />
        Melhorias
      </h2>
      
      <div className="flex flex-col gap-4">
        {Object.values(UPGRADES).map((upgrade) => {
          const currentPurchases = upgrades[upgrade.id as UpgradeId] || 0;
          const cost = calculateUpgradeCost(upgrade.id as UpgradeId, currentPurchases);
          const isMaxed = currentPurchases >= upgrade.maxPurchases;
          const canAfford = points >= cost && !isMaxed;
          const Icon = ICONS[upgrade.id] || Factory;

          return (
            <motion.button
              key={upgrade.id}
              whileHover={canAfford ? { scale: 1.02 } : {}}
              whileTap={canAfford ? { scale: 0.98 } : {}}
              onClick={() => {
                if (canAfford) {
                  buy(upgrade.id as UpgradeId);
                  playSound('buy');
                } else {
                  playSound('error');
                }
              }}
              disabled={!canAfford}
              className={`relative overflow-hidden p-4 rounded-xl text-left border transition-colors ${
                isMaxed 
                  ? 'bg-slate-800/80 border-slate-700 opacity-60 cursor-not-allowed'
                  : canAfford
                  ? 'bg-slate-800 border-indigo-500/50 hover:border-indigo-400 hover:bg-slate-700/80 cursor-pointer shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-800/80 border-slate-700/50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isMaxed ? 'bg-slate-700' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Icon size={18} />
                  </div>
                  <span className="font-bold text-slate-200">{upgrade.name}</span>
                </div>
                <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-400">
                  {currentPurchases}/{upgrade.maxPurchases}
                </span>
              </div>
              
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                {upgrade.effectDesc}
              </p>
              
              <div className="flex justify-between items-center mt-auto">
                <span className="text-sm font-semibold text-slate-300">
                  {isMaxed ? 'MÁXIMO' : `${formatNumber(cost)} pts`}
                </span>
              </div>

              {/* Progress bar background indicator */}
              <div className="absolute bottom-0 left-0 h-1 bg-slate-700 w-full">
                <div 
                  className="h-full bg-indigo-500" 
                  style={{ width: `${(currentPurchases / upgrade.maxPurchases) * 100}%` }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
