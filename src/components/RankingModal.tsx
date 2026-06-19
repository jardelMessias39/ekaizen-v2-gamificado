import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useRankingStore } from '../store/rankingStore';
import { Trophy, X, Save, Medal } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

interface RankingModalProps {
  onClose: () => void;
}

export const RankingModal = ({ onClose }: RankingModalProps) => {
  const { points } = useGameStore();
  const { scores, saveScore } = useRankingStore();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      saveScore(name.trim(), Math.floor(points));
      setSaved(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-400" /> Top 10 Engenheiros
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Current Score Box */}
          <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col items-center">
            <span className="text-indigo-300 text-sm font-semibold uppercase mb-1">Sua Pontuação Atual</span>
            <span className="text-3xl font-black text-indigo-400">{formatNumber(Math.floor(points))}</span>
            
            {!saved ? (
              <form onSubmit={handleSave} className="mt-4 w-full flex gap-2">
                <input
                  type="text"
                  placeholder="Seu nome no ranking..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  maxLength={15}
                  required
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                >
                  <Save size={16} /> Salvar
                </button>
              </form>
            ) : (
              <div className="mt-4 text-emerald-400 text-sm font-bold flex items-center gap-1">
                <Medal size={16} /> Pontuação salva no Leaderboard!
              </div>
            )}
          </div>

          {/* Ranking List */}
          <div className="space-y-2">
            {scores.map((entry, index) => (
              <div 
                key={`${entry.name}-${index}`}
                className={`flex justify-between items-center p-3 rounded-lg border ${
                  index === 0 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                  index === 1 ? 'bg-slate-300/10 border-slate-300/30 text-slate-300' :
                  index === 2 ? 'bg-amber-700/10 border-amber-700/30 text-amber-600' :
                  'bg-slate-900/50 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg w-6 text-center">{index + 1}</span>
                  <span className="font-bold text-slate-200">{entry.name}</span>
                </div>
                <span className="font-mono font-semibold">{formatNumber(entry.score)}</span>
              </div>
            ))}
            
            {scores.length === 0 && (
              <div className="text-center text-slate-500 py-4">Nenhuma pontuação registrada ainda.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
