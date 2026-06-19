import { create } from 'zustand';
import { GameState, UpgradeId, DerivedStats } from '../engine/types';
import { createInitialState, processTick, buyUpgrade, calculateDerivedStats, clickFactory } from '../engine/core';

interface GameStore extends GameState {
  stats: DerivedStats;
  history: Array<{ time: string; producao: number; defeitosPM: number; oee: number }>;
  buy: (upgradeId: UpgradeId) => void;
  tick: () => void;
  manualClick: () => void;
  reset: () => void;
  isHydrated: boolean;
  setHydrated: () => void;
}

const STORAGE_KEY = 'kaizen-clicker-save';
const ANTI_CHEAT_SALT = 'jardel-kaizen-senh4-s3cr3t4';

const generateChecksum = (data: GameState) => {
  return btoa(encodeURIComponent(JSON.stringify(data) + ANTI_CHEAT_SALT));
};

// Helper to load state from localStorage safely with Anti-Cheat
const loadState = (): GameState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.data && parsed.checksum) {
        if (generateChecksum(parsed.data) === parsed.checksum) {
          return parsed.data as GameState;
        } else {
          console.warn('⚠️ ANTI-CHEAT ATIVADO: O save file foi adulterado manualmente! O progresso foi resetado.');
        }
      }
    }
  } catch (e) {
    console.error("Failed to load save", e);
  }
  return createInitialState();
};

const saveState = (state: GameState) => {
  const payload = {
    data: state,
    checksum: generateChecksum(state)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const useGameStore = create<GameStore>((set, get) => {
  const loadedState = loadState();

  return {
    ...loadedState,
    stats: calculateDerivedStats(loadedState.upgrades),
    history: [],
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
        saveState(newState);
        return finalState;
      });
    },

    manualClick: () => {
      set((state) => {
        const newState = clickFactory(state);
        const finalState = {
          ...newState,
          stats: calculateDerivedStats(newState.upgrades),
        };
        saveState(newState);
        return finalState;
      });
    },

    tick: () => {
      set((state) => {
        const currentTimestamp = Date.now();
        const newState = processTick(state, currentTimestamp);
        
        if (newState === state) return state; // Less than 1 second passed

        const newStats = calculateDerivedStats(newState.upgrades);
        const date = new Date(currentTimestamp);
        const timeLabel = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        
        // Defeitos por minuto estimado = (taxa de defeito * velocidade) * 60
        const defeitosPM = Math.floor(newStats.defectRate * newStats.speed * 60);

        const newHistoryEntry = {
          time: timeLabel,
          producao: Math.floor(newState.totalProduced),
          defeitosPM,
          oee: Math.floor(newStats.oee * 100)
        };

        const finalState = {
          ...newState,
          stats: newStats,
          history: [...state.history, newHistoryEntry].slice(-30), // keep last 30 ticks for chart
        };
        
        // We only save the game state, not the transient history
        saveState(newState);
        return finalState;
      });
    },

    reset: () => {
      const freshState = createInitialState();
      localStorage.removeItem(STORAGE_KEY);
      set({ ...freshState, stats: calculateDerivedStats(freshState.upgrades), history: [] });
    },
  };
});
