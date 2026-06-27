import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { playSound } from '../utils/audio';

export const GameOverModal = () => {
  const { isGameOver, acknowledgeGameOver } = useGameStore();

  if (!isGameOver) return null;

  const handleRestart = () => {
    playSound('click');
    acknowledgeGameOver();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/90 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border-4 border-red-500 rounded-2xl p-8 max-w-lg w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.5)]"
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-red-500"
            >
              <AlertTriangle size={80} />
            </motion.div>
          </div>
          
          <h2 className="text-4xl font-black text-red-500 mb-4 uppercase tracking-wider">
            Fábrica Interditada
          </h2>
          
          <p className="text-xl text-slate-300 mb-6">
            Excesso de erros manuais (Andon Crítico). Sua linha de produção foi paralisada e seus pontos atuais foram confiscados como multa de qualidade!
          </p>
          
          <p className="text-sm text-slate-500 mb-8 font-bold">
            Dica Kaizen: Mais atenção e foco. Acertar caixas recupera a sua barra de tolerância a erros.
          </p>
          
          <button
            onClick={handleRestart}
            className="group relative flex items-center justify-center gap-3 w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-colors text-xl uppercase tracking-widest overflow-hidden"
          >
            <RotateCcw size={24} className="group-hover:-rotate-90 transition-transform duration-300" />
            <span className="relative z-10">Retomar Operação</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
