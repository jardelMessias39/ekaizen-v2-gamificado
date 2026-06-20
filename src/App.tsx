import { useState } from 'react';
import { FactoryDisplay } from './components/FactoryDisplay';
import { UpgradeStore } from './components/UpgradeStore';
import { Dashboard } from './components/Dashboard';
import { RankingModal } from './components/RankingModal';
import { RankingTicker } from './components/RankingTicker';
import { useGameLoop } from './hooks/useGameLoop';
import { Toaster } from 'sonner';

function App() {
  useGameLoop();
  const [showRanking, setShowRanking] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden font-sans text-slate-200">
      <RankingTicker onClick={() => setShowRanking(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Toaster position="bottom-left" />
        {showRanking && <RankingModal onClose={() => setShowRanking(false)} />}
        
        <div className="flex flex-col flex-1 h-full relative overflow-y-auto bg-slate-950 pb-12">
          <FactoryDisplay />
          <div className="mt-12">
            <Dashboard />
          </div>
        </div>
        <UpgradeStore />
      </div>
    </div>
  );
}

export default App;
