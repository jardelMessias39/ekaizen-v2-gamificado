import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Activity, TrendingUp, PowerOff, ShoppingCart } from 'lucide-react';
import { playSound } from '../utils/audio';
import { calculateUpgradeCost } from '../engine/core';
import type { UpgradeId } from '../engine/types';

export const DiagnosticPanel = () => {
  const { stats, reset, points, upgrades, buy } = useGameStore();
  
  let status = 'good';
  let message = 'Fábrica operando no estado da arte Kaizen! Continue escalando.';
  let Icon = TrendingUp;
  let colorClass = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
  let glowClass = 'shadow-[0_0_15px_rgba(52,211,153,0.15)]';
  let suggestedUpgrade: UpgradeId | null = null;

  if (stats.defectRate >= 0.15) {
    status = 'critical';
    message = 'GARGALO CRÍTICO: Alta taxa de defeitos! A qualidade está destruindo os lucros.';
    Icon = AlertTriangle;
    colorClass = 'text-red-400 bg-red-400/10 border-red-500/50';
    glowClass = 'shadow-[0_0_20px_rgba(248,113,113,0.4)] animate-pulse';
    suggestedUpgrade = 'pokayoke';
  } else if (stats.oee < 0.6) {
    status = 'warning';
    message = 'ALERTA: OEE (Eficiência) muito baixo. A linha sofre micro-paradas frequentes.';
    Icon = Activity;
    colorClass = 'text-yellow-400 bg-yellow-400/10 border-yellow-500/40';
    glowClass = 'shadow-[0_0_15px_rgba(250,204,21,0.2)]';
    suggestedUpgrade = 'tpm';
  } else if (stats.speed < 1.3) {
    status = 'info';
    message = 'DICA: A qualidade está controlada, mas a produção está lenta. É hora de aumentar o fluxo.';
    Icon = ShieldCheck;
    colorClass = 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    glowClass = 'shadow-[0_0_15px_rgba(96,165,250,0.2)]';
    suggestedUpgrade = 'kanban';
  }

  // Calculate suggestion cost if any
  const suggestedCost = suggestedUpgrade ? calculateUpgradeCost(suggestedUpgrade, upgrades[suggestedUpgrade] || 0) : 0;
  const canAfford = points >= suggestedCost;

  return (
    <motion.div 
      key={status} // Forces re-animation when diagnostic changes
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`w-full max-w-3xl mb-4 p-3 rounded-xl border flex items-center gap-3 transition-colors duration-500 backdrop-blur-sm ${colorClass} ${glowClass}`}
    >
      <div>
        <Icon className={status === 'critical' ? 'animate-bounce' : ''} size={24} />
      </div>
      <div className="flex flex-col flex-1">
        <h3 className="font-black text-[10px] uppercase tracking-widest opacity-80">
          Diagnóstico do Analista IA
        </h3>
        <p className="text-sm font-bold leading-snug">{message}</p>
      </div>
      
      {suggestedUpgrade && (upgrades[suggestedUpgrade] || 0) < 5 && (
        <button
          onClick={() => {
            if (canAfford) {
              buy(suggestedUpgrade!);
              playSound('buy');
            } else {
              playSound('error');
            }
          }}
          disabled={!canAfford}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            canAfford 
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <ShoppingCart size={14} />
          {suggestedUpgrade.toUpperCase()} ({Math.floor(suggestedCost)})
        </button>
      )}

      <button 
        onClick={() => {
          if (confirm("ATENÇÃO: Deseja zerar toda a fábrica e recomeçar do zero? Todos os pontos e melhorias serão perdidos.")) {
            playSound('error');
            reset();
          }
        }}
        title="Hard Reset - Zerar Save"
        className="ml-auto p-2 bg-red-950/50 hover:bg-red-600 border border-red-500/50 rounded-lg text-red-300 hover:text-white transition-colors"
      >
        <PowerOff size={18} />
      </button>
    </motion.div>
  );
};
