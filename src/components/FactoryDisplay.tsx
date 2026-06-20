import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, AlertCircle, Hand } from 'lucide-react';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { DiagnosticPanel } from './DiagnosticPanel';

interface FloatingItem {
  id: number;
  x: number;
  isDefect: boolean;
}

export const FactoryDisplay = () => {
  const { points, stats, totalProduced, totalDefective, manualClick } = useGameStore();
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

      {/* IA Bottleneck Diagnostic (Floating mid-left) */}
      <div className="relative z-10 w-full max-w-lg mb-auto mt-16 ml-4">
        <DiagnosticPanel />
      </div>

      {/* Manual Click Button (DRAGGABLE) */}
      <div className="relative z-20 flex justify-center w-full my-auto">
        <motion.button
          drag
          dragConstraints={{ left: -300, right: 300, top: -150, bottom: 50 }}
          dragElastic={0.1}
          dragMomentum={false}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound('click');
            manualClick();
            window.dispatchEvent(new Event('manual-click'));
          }}
          className="group relative flex flex-col items-center justify-center w-36 h-36 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.6)] border-4 border-slate-900 overflow-hidden cursor-grab active:cursor-grabbing"
        >
          <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors pointer-events-none"></div>
          <Hand size={40} className="text-white mb-1 pointer-events-none" />
          <span className="text-white font-bold tracking-widest uppercase text-xs pointer-events-none">Produzir</span>
        </motion.button>
      </div>

      {/* Animation Area - The Factory Floor */}
      <div className="absolute bottom-0 left-0 w-full h-32 border-b-4 border-slate-700 flex items-end justify-center pointer-events-none">
        <div className="absolute bottom-0 w-full h-12 bg-slate-800/50 border-t border-slate-700"></div>
        
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ 
                y: -600, // Float high up the screen
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1.2, 1],
                rotate: item.isDefect ? [0, 180] : 0 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.5, ease: "easeOut" }}
              className="absolute bottom-6 z-30 pointer-events-none"
              style={{ left: `${item.x}%` }}
            >
              {item.isDefect ? (
                <div className="flex flex-col items-center text-red-500">
                  <AlertCircle size={28} />
                  <span className="text-xs font-bold mt-1">-0</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
                  <Box size={32} />
                  <span className="text-xs font-bold mt-1">+1</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
    </div>
  );
};
