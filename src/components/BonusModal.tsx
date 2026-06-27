import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { playSound } from '../utils/audio';

export const BonusModal = () => {
  const { consecutiveCorrectManualBoxes, lastMistakeTimestamp, chooseBonus } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [bonusDuration, setBonusDuration] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // If 5 minutes (300000ms) without mistake and has played at least a little
      if (consecutiveCorrectManualBoxes > 0 && (now - lastMistakeTimestamp) >= 300000) {
        if (!showModal) {
          setShowModal(true);
          playSound('buy');
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastMistakeTimestamp, consecutiveCorrectManualBoxes, showModal]);

  const handleChoose = (type: 'speed' | 'points') => {
    const val = type === 'speed' ? 1.02 : (Math.random() > 0.5 ? 100 : 200);
    chooseBonus(type, val, bonusDuration);
    setShowModal(false);
    // Increase duration for next time (cap at 60s)
    setBonusDuration(prev => Math.min(prev + 10, 60));
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-slate-800 p-8 rounded-2xl border border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center max-w-md"
        >
          <h2 className="text-3xl font-black text-emerald-400 mb-4">🏆 BÔNUS DE PRECISÃO!</h2>
          <p className="text-slate-300 mb-6">Você está há 5 minutos sem produzir nenhum refugo! Escolha sua recompensa Kaizen:</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => handleChoose('speed')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              +2% Vel ({bonusDuration}s)
            </button>
            <button onClick={() => handleChoose('points')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              Pontos Extras
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
