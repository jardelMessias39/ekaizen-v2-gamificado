import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, AlertCircle, Hand } from 'lucide-react';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { DiagnosticPanel } from './DiagnosticPanel';
import { SortingMinigame } from './SortingMinigame';
import { BonusModal } from './BonusModal';

interface FloatingItem {
  id: number;
  x: number;
  isDefect: boolean;
}

export const FactoryDisplay = () => {
  const { points, stats, totalProduced, totalDefective, consecutiveCorrectManualBoxes } = useGameStore();
  const [items, setItems] = useState<FloatingItem[]>([]);
  const prevProducedRef = useRef(totalProduced);
  const prevDefectiveRef = useRef(totalDefective);
  
  useEffect(() => {
    const diffProduced = Math.floor(totalProduced) - Math.floor(prevProducedRef.current);
    const diffDefective = Math.floor(totalDefective) - Math.floor(prevDefectiveRef.current);
    
    if (diffProduced > 0) {
      const newItems: FloatingItem[] = [];
      const animationsToPlay = Math.min(diffProduced, 15);
      
      for (let i = 0; i < animationsToPlay; i++) {
        newItems.push({
          id: Date.now() + i + Math.random(),
          x: Math.random() * 80 + 10,
          isDefect: i < diffDefective
        });
      }
      
      setItems(prev => [...prev.slice(-15), ...newItems]);
      
      setTimeout(() => {
        setItems(prev => prev.filter(item => !newItems.find(n => n.id === item.id)));
      }, 4000); 
    }
    
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
        <div className="flex gap-4">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-xl flex flex-col items-center shadow-lg w-28">
            <span className="text-slate-400 text-[10px] mb-1 uppercase font-semibold">Velocidade</span>
            <span className="text-xl font-bold text-white">
              {formatNumber(stats.speed)}
            </span>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-xl flex flex-col items-center shadow-lg w-28">
            <span className="text-slate-400 text-[10px] mb-1 uppercase font-semibold">Defeitos</span>
            <span className="text-xl font-bold text-emerald-400">
              {formatPercentage(stats.defectRate)}
            </span>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-xl flex flex-col items-center shadow-lg w-28 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/10"></div>
            <span className="text-slate-400 text-[10px] mb-1 uppercase font-semibold z-10">OEE</span>
            <span className="text-xl font-bold text-indigo-400 z-10">
              {formatPercentage(stats.oee)}
            </span>
          </div>
        </div>
      </div>

      {/* IA Bottleneck Diagnostic (Floating top-left) */}
      <div className="absolute top-28 left-8 z-30 w-full max-w-sm pointer-events-none">
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
    </div>
  );
};
