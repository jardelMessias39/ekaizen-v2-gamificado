import { FactoryDisplay } from './components/FactoryDisplay';
import { UpgradeStore } from './components/UpgradeStore';
import { Dashboard } from './components/Dashboard';
import { useGameLoop } from './hooks/useGameLoop';

function App() {
  useGameLoop();

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden font-sans text-slate-200">
      <div className="flex flex-col flex-1 h-full relative overflow-y-auto">
        <FactoryDisplay />
        <Dashboard />
      </div>
      <UpgradeStore />
    </div>
  );
}

export default App;
