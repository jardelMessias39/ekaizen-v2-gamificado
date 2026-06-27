import { useState } from 'react';
import { FactoryDisplay } from './components/FactoryDisplay';
import { UpgradeStore } from './components/UpgradeStore';
import { Dashboard } from './components/Dashboard';
import { RankingModal } from './components/RankingModal';
import { RankingTicker } from './components/RankingTicker';
import { OnboardingModal } from './components/OnboardingModal';
import { useGameLoop } from './hooks/useGameLoop';
import { Toaster } from 'sonner';
import { useGameStore } from './store/gameStore';

function App() {
  useGameLoop();
  const [showRanking, setShowRanking] = useState(false);
  const setMinigamePaused = useGameStore(state => state.setMinigamePaused);

  // Pause minigame when ranking is open
  useEffect(() => {
    setMinigamePaused(showRanking);
  }, [showRanking, setMinigamePaused]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden font-sans text-slate-200">
      <RankingTicker onClick={() => setShowRanking(true)} />
      
      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
        <Toaster position="bottom-left" />
        <OnboardingModal />
        {showRanking && <RankingModal onClose={() => setShowRanking(false)} />}
        
        <div className="flex flex-col flex-1 h-full lg:overflow-y-auto relative bg-slate-950 pb-12">
          <FactoryDisplay />
          <div className="mt+1
          ">
            <Dashboard />
          </div>
        </div>
        <UpgradeStore />
      </div>
    </div>
  );
}

export default App;
