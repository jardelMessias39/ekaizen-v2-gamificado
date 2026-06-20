import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Sparkles, AlertCircle, Hand } from 'lucide-react';
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
    // Determine how many were produced in this render cycle/tick
    // Using floor to deal with floats, just to animate integers
    const diffProduced = Math.floor(totalProduced) - Math.floor(prevProducedRef.current);
    const diffDefective = Math.floor(totalDefective) - Math.floor(prevDefectiveRef.current);
    
    if (diffProduced > 0) {
      const newItems: FloatingItem[] = [];
      // To prevent crazy DOM overload if they come back after 5 minutes, limit to 15 animations
      const animationsToPlay = Math.min(diffProduced, 15);
      
      for (let i = 0; i < animationsToPlay; i++) {
        newItems.push({
          id: Date.now() + i + Math.random(),
          x: Math.random() * 80 + 10, // random X position between 10% and 90%
          isDefect: i < diffDefective // approximate defects visually based on count
        });
      }
      
      setItems(prev => [...prev.slice(-15), ...newItems]);
      
      // Auto-remove items after animation (2.5s)
      setTimeout(() => {
        setItems(prev => prev.filter(item => !newItems.find(n => n.id === item.id)));
      }, 2500);
    }
    
    prevProducedRef.current = totalProduced;
    prevDefectiveRef.current = totalDefective;
  }, [totalProduced, totalDefective]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-slate-900">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80"></div>

      {/* Main Points Display */}
      <div className="relative z-10 flex flex-col items-center mt-6">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-sm mb-4">
          {Math.floor(points).toLocaleString('pt-BR')}
        </h1>
      </div>

      {/* IA Bottleneck Diagnostic */}
      <DiagnosticPanel />

      {/* Production Indicators */}
      <div className="relative z-10 grid grid-cols-3 gap-4 w-full max-w-3xl mb-6">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center shadow-xl">
          <span className="text-slate-400 text-sm mb-1 uppercase font-semibold">Velocidade</span>
          <span className="text-3xl font-bold text-white">
            {formatNumber(stats.speed)}
          </span>
          <span className="text-slate-500 text-xs mt-1">peças / seg</span>
        </div>
        
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center shadow-xl">
          <span className="text-slate-400 text-sm mb-1 uppercase font-semibold">Defeitos</span>
          <span className="text-3xl font-bold text-emerald-400">
            {formatPercentage(stats.defectRate)}
          </span>
          <span className="text-slate-500 text-xs mt-1">Taxa atuais</span>
        </div>

        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/10"></div>
          <span className="text-slate-400 text-sm mb-1 uppercase font-semibold z-10">OEE</span>
          <span className="text-3xl font-bold text-indigo-400 z-10">
            {formatPercentage(stats.oee)}
          </span>
          <span className="text-slate-500 text-xs mt-1 z-10">eficiência geral</span>
        </div>
      </div>

      {/* Manual Click Button */}
      <div className="relative z-10 mb-6 mt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            playSound('click');
            manualClick();
          }}
          className="group relative flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.4)] border-4 border-slate-900 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
          <Hand size={40} className="text-white mb-1" />
          <span className="text-white font-bold tracking-widest uppercase text-xs">Produzir</span>
        </motion.button>
      </div>

      {/* Animation Area - The Factory Floor */}
      <div className="relative w-full max-w-4xl h-32 border-b-4 border-slate-700 mt-auto flex items-end justify-center">
        <div className="absolute bottom-0 w-full h-12 bg-slate-800/50 border-t border-slate-700"></div>
        
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ 
                y: -150, 
                opacity: [0, 1, 1, 0],
                scale: 1,
                rotate: item.isDefect ? [0, 90] : 0 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute bottom-6"
              style={{ left: `${item.x}%` }}
            >
              {item.isDefect ? (
                <div className="flex flex-col items-center text-red-500">
                  <AlertCircle size={28} />
                  <span className="text-xs font-bold mt-1">-0</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
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
