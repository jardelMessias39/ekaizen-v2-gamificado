import { useState } from 'react';
import { FactoryDisplay } from './components/FactoryDisplay';
import { UpgradeStore } from './components/UpgradeStore';
import { Dashboard } from './components/Dashboard';
import { RankingModal } from './components/RankingModal';
import { useGameLoop } from './hooks/useGameLoop';
import { Trophy } from 'lucide-react';
import { Toaster } from 'sonner';

function App() {
  useGameLoop();
  const [showRanking, setShowRanking] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden font-sans text-slate-200">
      <Toaster position="bottom-left" />
      {showRanking && <RankingModal onClose={() => setShowRanking(false)} />}
      
      <div className="flex flex-col flex-1 h-full relative overflow-y-auto">
        {/* Header/Nav overlay */}
        <div className="absolute top-0 w-full p-6 flex justify-end z-20 pointer-events-none">
          <button 
            onClick={() => setShowRanking(true)}
            className="pointer-events-auto bg-slate-800/80 hover:bg-slate-700 text-yellow-500 border border-slate-700 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Trophy size={18} /> Ranking
          </button>
        </div>

        <FactoryDisplay />
        <Dashboard />
      </div>
      <UpgradeStore />
    </div>
  );
}

export default App;
