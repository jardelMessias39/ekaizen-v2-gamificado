import { useRankingStore } from '../store/rankingStore';
import { formatNumber } from '../utils/formatters';
import { Trophy, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export const RankingTicker = ({ onClick }: { onClick: () => void }) => {
  const { scores, currentPlayerName, saveScore } = useRankingStore();
  const [snapshotData, setSnapshotData] = useState<{ id: number; points: number } | null>(null);
  const [flash, setFlash] = useState(false);
  
  useEffect(() => {
    if (!currentPlayerName) return;
    const interval = setInterval(() => {
      const currentPoints = Math.floor(useGameStore.getState().points);
      saveScore(currentPlayerName, currentPoints);
      
      // Trigger snapshot effect
      setFlash(true);
      setSnapshotData({ id: Date.now(), points: currentPoints });
      
      setTimeout(() => setFlash(false), 150);
      setTimeout(() => setSnapshotData(null), 3000);
      
    }, 60000); // 1 minuto (para teste ser visível sem demorar 5 min)
    return () => clearInterval(interval);
  }, [currentPlayerName, saveScore]);

  if (scores.length === 0) return null;

  const tickerItems = scores.map((s, i) => {
    let medal = '';
    if (i === 0) medal = '🥇 ';
    else if (i === 1) medal = '🥈 ';
    else if (i === 2) medal = '🥉 ';
    return `${medal}${i + 1}º ${s.name}: ${formatNumber(s.score)} pts`;
  });

  return (
    <div 
      className="w-full h-8 bg-slate-950 border-b border-indigo-500/30 flex items-center overflow-hidden cursor-pointer hover:bg-slate-900 transition-colors shrink-0 relative z-50"
      onClick={onClick}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs px-4 h-full flex items-center z-10 shrink-0 gap-2 shadow-[4px_0_15px_rgba(0,0,0,0.5)]">
        <Trophy size={14} /> RANKING GLOBAL
      </div>
      
      {/* Marquee container */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center bg-slate-900/50">
        <motion.div 
          className="flex whitespace-nowrap gap-12 text-[11px] font-bold text-slate-300 absolute left-0"
          animate={{ x: ["100vw", "-100%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {tickerItems.join('   ✦   ')}
          {'   ✦   '}
          {tickerItems.join('   ✦   ')}
        </motion.div>
      </div>

      {/* Snapshot Visual Effects */}
      {flash && (
        <div className="fixed inset-0 z-[100] bg-white pointer-events-none opacity-80" />
      )}
      
      <AnimatePresence>
        {snapshotData && (
          <motion.div
            key={snapshotData.id}
            initial={{ scale: 2, opacity: 0, x: '-50%', y: '50vh', left: '50%' }}
            animate={{ 
              scale: 0.5, 
              opacity: [0, 1, 1, 0], 
              y: -10,
              rotate: [0, -5, 5, 0]
            }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="fixed z-[90] bg-indigo-600/90 backdrop-blur text-white border-2 border-indigo-400 p-4 rounded-xl shadow-[0_0_50px_rgba(79,70,229,0.8)] pointer-events-none flex flex-col items-center"
          >
            <Camera size={48} className="mb-2 text-indigo-300" />
            <span className="text-sm font-black tracking-widest uppercase">Auto-Save Ranking</span>
            <span className="text-3xl font-black text-yellow-400 mt-1">{formatNumber(snapshotData.points)}</span>
            <span className="text-xs text-indigo-200 mt-2">Enviando para os servidores...</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
