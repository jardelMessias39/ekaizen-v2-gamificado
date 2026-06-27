import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, PlayCircle, Target, TrendingUp } from 'lucide-react';
import { playSound } from '../utils/audio';

export const OnboardingModal = () => {
  const { hasSeenTutorial, completeTutorial } = useGameStore();

  if (hasSeenTutorial) return null;

  const handleStart = () => {
    playSound('buy');
    completeTutorial();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border-2 border-indigo-500/50 rounded-2xl max-w-2xl w-full text-slate-200 shadow-2xl overflow-hidden"
        >
          <div className="bg-indigo-600 p-6 text-center">
            <h2 className="text-3xl font-black text-white flex items-center justify-center gap-3">
              <BrainCircuit size={32} />
              eKaizen: Desafio Corporativo
            </h2>
          </div>
          
          <div className="p-8">
            <p className="text-lg mb-6 leading-relaxed text-slate-300">
              Bem-vindo ao simulador de linha de produção <strong>Kaizen</strong>. Este não é apenas um jogo, é um teste de habilidades reais exigidas no mundo corporativo!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
                <Target className="text-red-400 mx-auto mb-2" size={32} />
                <h3 className="font-bold text-white mb-2">Atenção Plena</h3>
                <p className="text-sm text-slate-400">Separe as caixas coloridas para os tubos corretos sem deixar nenhuma passar.</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
                <TrendingUp className="text-emerald-400 mx-auto mb-2" size={32} />
                <h3 className="font-bold text-white mb-2">Tomada de Decisão</h3>
                <p className="text-sm text-slate-400">Compre melhorias que equilibram Velocidade e Qualidade (OEE) de forma estratégica.</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
                <BrainCircuit className="text-indigo-400 mx-auto mb-2" size={32} />
                <h3 className="font-bold text-white mb-2">Reflexo Rápido</h3>
                <p className="text-sm text-slate-400">A produção acelera. Seus reflexos sob pressão definem a sua maestria.</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-xl mb-8 border border-slate-700/50">
              <h4 className="font-bold text-indigo-400 mb-2 uppercase text-sm tracking-wider">Como Jogar:</h4>
              <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm">
                <li>Arraste as caixas que brotam na tela para os <strong>tubos correspondentes</strong> no topo.</li>
                <li>Se errar a cor ou deixar a caixa estourar o tempo, sua <strong>Fábrica pode ser interditada (Andon)</strong>.</li>
                <li>Use o botão <strong>PRODUZIR</strong> para acelerar o processo manualmente.</li>
                <li>Ficar 5 minutos sem errar nada garante um Bônus de Alta Performance.</li>
              </ul>
            </div>
            
            <button
              onClick={handleStart}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-colors text-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              <PlayCircle size={24} />
              INICIAR DESAFIO
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
