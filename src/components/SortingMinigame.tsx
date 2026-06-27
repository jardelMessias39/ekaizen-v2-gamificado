import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BoxColor } from '../engine/types';
import { useGameStore } from '../store/gameStore';
import { Hand, Box as BoxIcon, Zap } from 'lucide-react';
import { playSound } from '../utils/audio';

const COLORS: BoxColor[] = ['red', 'green', 'blue', 'yellow'];

const TUBE_STYLES: Record<BoxColor, string> = {
  red: 'border-red-500 bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
  green: 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
  blue: 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  yellow: 'border-yellow-400 bg-yellow-400/20 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
};

interface PendingBox {
  id: number;
  color: BoxColor;
}

// High-frequency render component to prevent SortingMinigame from re-rendering every 100ms
const ScoreOverlay = () => {
  const { points, consecutiveCorrectManualBoxes } = useGameStore();
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 z-0">
      <h2 className="text-8xl font-black text-slate-300">
        {Math.floor(points).toLocaleString('pt-BR')}
      </h2>
      {consecutiveCorrectManualBoxes >= 10 && (
        <motion.p 
          key={consecutiveCorrectManualBoxes} // Force re-animate on change
          initial={{ scale: 1.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="text-4xl font-black text-yellow-400 mt-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]"
        >
          🔥 COMBO x{consecutiveCorrectManualBoxes} 🔥
        </motion.p>
      )}
    </div>
  );
};

// Isolate the manual error thermometer to prevent parent re-renders
const ThermometerOverlay = () => {
  const { manualErrors } = useGameStore();
  
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-[400px] bg-slate-900 border-2 border-slate-700 rounded-full flex flex-col-reverse p-1 gap-1 z-20">
      {Array.from({ length: 10 }).map((_, i) => (
        <div 
          key={i} 
          className={`flex-1 rounded-full transition-colors duration-300 ${
            i < manualErrors 
              ? (i >= 8 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-orange-500') 
              : 'bg-slate-800'
          }`}
        />
      ))}
    </div>
  );
};

export const SortingMinigame = () => {
  const { resolveBox, upgrades, isGameOver } = useGameStore();
  const [boxes, setBoxes] = useState<PendingBox[]>([]);
  const [tubePositions, setTubePositions] = useState<BoxColor[]>([...COLORS]);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnBox = () => {
    // Only spawn if we haven't flooded the screen (max 10 boxes at a time)
    setBoxes(prev => {
      if (prev.length >= 10) return prev;
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const newBox = { id: Date.now() + Math.random(), color: randomColor };
      return [...prev, newBox];
    });
  };

  const { consecutiveCorrectManualBoxes } = useGameStore();
  // Efeito de som para o Combo
  useEffect(() => {
    if (consecutiveCorrectManualBoxes > 0 && consecutiveCorrectManualBoxes % 10 === 0) {
      playSound('upgrade'); // Som de conquista para o combo!
    }
  }, [consecutiveCorrectManualBoxes]);

  useEffect(() => {
    // Se a fábrica tá interditada, não brota caixa.
    if (isGameOver) return;
    
    // Auto-spawn a box every 2 seconds to represent background production
    const interval = setInterval(() => {
      spawnBox();
    }, 2000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  // Limpar todas as caixas da tela se der Game Over
  useEffect(() => {
    if (isGameOver) {
      setBoxes([]);
    }
  }, [isGameOver]);

  // Embaralhar tubos a cada 2 minutos (Aumentar a dificuldade)
  useEffect(() => {
    if (isGameOver) return;
    
    const shuffleInterval = setInterval(() => {
      setTubePositions(prev => {
        const newPos = [...prev];
        return newPos.sort(() => Math.random() - 0.5);
      });
      playSound('click'); // Som de aviso da troca
    }, 120000); // 2 minutos (120000ms)
    
    return () => clearInterval(shuffleInterval);
  }, [isGameOver]);

  const handleBoxResolve = useCallback((id: number, boxColor: BoxColor, tubeColor: BoxColor) => {
    const isCorrect = boxColor === tubeColor;
    resolveBox(isCorrect, boxColor);
    if (isCorrect) {
      playSound('buy');
    } else {
      playSound('error');
    }
    setBoxes(prev => prev.filter(b => b.id !== id));
  }, [resolveBox]);

  const handleBoxTimeout = useCallback((id: number) => {
    // A caixa só dá timeout se o jogador não pegou (porque se pegar, o componente desmonta e limpa o timer)
    resolveBox(false);
    playSound('error');
    
    setBoxes(prev => prev.filter(b => b.id !== id));
  }, [resolveBox]);

  // The more 5S, the faster the boxes move up (less time to react, but faster points).
  // Wait, if it's faster, it's harder! We should give more points?
  // Let's keep it fixed at 4 seconds for now, maybe minus 100ms per 5S.
  const speedBonus = (upgrades['5s'] || 0) * 0.2;
  const fallDuration = Math.max(2.0, 4.0 - speedBonus);

  return (
    <div ref={containerRef} className="relative w-full min-h-[500px] lg:h-full border border-slate-700/50 rounded-2xl bg-slate-800/30 overflow-hidden flex flex-col justify-between p-4 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
      
      {/* SCORE & COMBO OVERLAY */}
      <ScoreOverlay />
      
      {/* MANUAL ERROR THERMOMETER */}
      <ThermometerOverlay />
      
      {/* TUBES AT THE TOP */}
      <div className="flex w-full justify-around z-20">
        {tubePositions.map((color) => {
          let pts = 10;
          if (color === 'green') pts = 20;
          if (color === 'blue') pts = 30;
          if (color === 'yellow') pts = 40;
          
          return (
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              key={color} 
              id={`tube-${color}`}
              className={`w-24 h-28 rounded-b-2xl border-b-4 border-l-4 border-r-4 flex flex-col items-center justify-end pb-2 ${TUBE_STYLES[color]}`}
            >
              <span className="text-[10px] font-black opacity-70 mb-1">+{pts} pts</span>
              <div className="w-12 h-4 bg-black/40 rounded-full blur-sm absolute top-4"></div>
              <Zap size={24} className="opacity-50" />
            </motion.div>
          );
        })}
      </div>

      {/* FLOATING BOXES */}
      <AnimatePresence>
        {boxes.map(box => (
          <DraggableBox 
            key={box.id} 
            box={box} 
            duration={fallDuration} 
            onResolve={handleBoxResolve}
            onTimeout={handleBoxTimeout}
          />
        ))}
      </AnimatePresence>

      {/* BUTTON AT THE BOTTOM */}
      <div className="flex w-full justify-center z-20 pb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound('click');
            spawnBox();
          }}
          className="group relative flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.6)] border-4 border-slate-900"
        >
          <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors rounded-full"></div>
          <Hand size={32} className="text-white mb-1" />
          <span className="text-white font-bold tracking-widest uppercase text-[10px]">Produzir</span>
        </motion.button>
      </div>
      
    </div>
  );
};

// Internal component for the draggable box
const DraggableBox = memo(({ box, duration, onResolve, onTimeout }: { box: PendingBox, duration: number, onResolve: Function, onTimeout: Function }) => {
  
  const timeoutRef = useRef(onTimeout);
  useEffect(() => {
    timeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    // 1.5s tolerance at the top before it vanishes
    const timer = setTimeout(() => {
      timeoutRef.current(box.id);
    }, (duration + 1.5) * 1000);
    return () => clearTimeout(timer);
  }, [box.id, duration]);

  return (
    <motion.div
      initial={{ y: 450, opacity: 0, scale: 0.5 }}
      animate={{ y: -50, opacity: 1, scale: 1 }} // Float up slowly
      exit={{ opacity: 0, scale: 0 }}
      transition={{ y: { duration, ease: "linear" }, opacity: { duration: 0.2 } }}
      className="absolute left-1/2 -ml-8 z-30"
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: -300, right: 300 }}
        dragSnapToOrigin
        onDragEnd={(event, info) => {
          const x = info.point.x;
          // In a real robust app, we'd use element bounds, but dividing screen in 4 is quick for MVP.
          let droppedColor: BoxColor | null = null;
          for (const c of COLORS) {
            const el = document.getElementById(`tube-${c}`);
            if (el) {
              const rect = el.getBoundingClientRect();
              // Allow a generous drop zone horizontally. The Y is handled by the wrapper.
              if (x >= rect.left - 60 && x <= rect.right + 60) {
                droppedColor = c;
                break;
              }
            }
          }
          
          if (droppedColor) {
            onResolve(box.id, box.color, droppedColor);
          }
        }}
        whileTap={{ scale: 0.9 }}
        className={`cursor-grab active:cursor-grabbing flex flex-col items-center p-3 rounded-xl bg-slate-800 border-2 ${
          box.color === 'red' ? 'border-red-500 text-red-500' :
          box.color === 'green' ? 'border-emerald-500 text-emerald-500' :
          box.color === 'blue' ? 'border-blue-500 text-blue-500' :
          'border-yellow-400 text-yellow-400'
        }`}
      >
        <BoxIcon size={32} />
      </motion.div>
    </motion.div>
  );
});
