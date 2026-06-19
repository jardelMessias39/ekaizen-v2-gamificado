import { create } from 'zustand';
import { GameState, UpgradeId, DerivedStats } from '../engine/types';
import { createInitialState, processTick, buyUpgrade, calculateDerivedStats } from '../engine/core';

interface GameStore extends GameState {
  stats: DerivedStats;
  buy: (upgradeId: UpgradeId) => void;
  tick: () => void;
  reset: () => void;
  isHydrated: boolean;
  setHydrated: () => void;
}

const STORAGE_KEY = 'kaizen-clicker-save';

// Helper to load state from localStorage safely
const loadState = (): GameState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure we don't load a severely outdated format by verifying basic properties
      if (parsed && typeof parsed.points === 'number' && parsed.upgrades) {
        // Also update lastTickTimestamp to now so we calculate delta correctly on return
        // Actually, if we just parse it, the next processTick will calculate the delta automatically!
        // This is exactly what "Aba em background continua produzindo" requires. 
        // If they close the game for 10 hours, they get 10 hours of production!
        return parsed as GameState;
      }
    }
  } catch (e) {
    console.error("Failed to load save", e);
  }
  return createInitialState();
};

export const useGameStore = create<GameStore>((set, get) => {
  const loadedState = loadState();

  return {
    ...loadedState,
    stats: calculateDerivedStats(loadedState.upgrades),
    isHydrated: false,
    setHydrated: () => set({ isHydrated: true }),

    buy: (upgradeId: UpgradeId) => {
      set((state) => {
        const newState = buyUpgrade(state, upgradeId);
        if (newState === state) return state; // No change (e.g. not enough points)

        const finalState = {
          ...newState,
          stats: calculateDerivedStats(newState.upgrades),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalState));
        return finalState;
      });
    },

    tick: () => {
      set((state) => {
        const currentTimestamp = Date.now();
        const newState = processTick(state, currentTimestamp);
        
        if (newState === state) return state; // Less than 1 second passed

        const finalState = {
          ...newState,
          stats: calculateDerivedStats(newState.upgrades),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalState));
        return finalState;
      });
    },

    reset: () => {
      const freshState = createInitialState();
      localStorage.removeItem(STORAGE_KEY);
      set({ ...freshState, stats: calculateDerivedStats(freshState.upgrades) });
    },
  };
});
