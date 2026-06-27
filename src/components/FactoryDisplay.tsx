import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../utils/formatters';
import { DiagnosticPanel } from './DiagnosticPanel';
import { SortingMinigame } from './SortingMinigame';
import { BonusModal } from './BonusModal';
import { GameOverModal } from './GameOverModal';

export const FactoryDisplay = () => {
  const { points, stats, totalProduced, totalDefective, consecutiveCorrectManualBoxes } = useGameStore();
  const prevProducedRef = useRef(totalProduced);
  const prevDefectiveRef = useRef(totalDefective);
  
  useEffect(() => {
    prevProducedRef.current = totalProduced;
    prevDefectiveRef.current = totalDefective;
  }, [totalProduced, totalDefective]);

  const pps = stats.speed * stats.oee * (1 - stats.defectRate);

  return (
    <div className="flex-1 min-h-[600px] flex flex-col p-8 relative overflow-hidden bg-slate-900">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 pointer-events-none"></div>

      {/* Top Section: Score & Indicators */}
      <div className="relative z-10 flex w-full justify-between items-start mb-6">
        
        {/* Left: Points & PPS */}
        <div className="flex flex-col">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-sm">
            {Math.floor(points).toLocaleString('pt-BR')}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Produção</span>
            <span className="text-emerald-400 font-black px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-sm shadow-[0_0_10px_rgba(52,211,153,0.2)]">
              +{formatNumber(pps)} PPS
            </span>
            {consecutiveCorrectManualBoxes >= 10 && (
              <span className="ml-2 text-yellow-400 font-black px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-sm shadow-[0_0_10px_rgba(250,204,21,0.2)] animate-pulse">
                🔥 COMBO x{consecutiveCorrectManualBoxes}
              </span>
            )}
          </div>
        </div>

        {/* Right: Production Indicators */}
        <div className="absolute top-6 right-6 z-30 flex gap-2 pointer-events-none">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-2 flex flex-col items-center min-w-[90px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Velocidade</span>
            <span className="text-lg font-black text-white">{stats.speed.toFixed(1)}</span>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-2 flex flex-col items-center min-w-[90px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Defeitos</span>
            <span className={`text-lg font-black ${stats.defectRate > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {(stats.defectRate * 100).toFixed(0)}%
            </span>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-2 flex flex-col items-center min-w-[90px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">OEE</span>
            <span className="text-lg font-black text-indigo-400">
              {(stats.oee * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* IA Bottleneck Diagnostic (Floating bottom-left) */}
      <div className="absolute bottom-6 left-6 z-30 w-full max-w-sm pointer-events-none">
        <div className="pointer-events-auto">
          <DiagnosticPanel />
        </div>
      </div>

      {/* Sorting Minigame replacing the old manual button */}
      <div className="relative z-20 flex justify-center w-full my-auto max-w-2xl self-center">
        <SortingMinigame />
      </div>

      {/* Empty block, old floor was removed */}

      <BonusModal />
      <GameOverModal />
    </div>
  );
};
