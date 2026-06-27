import { create } from 'zustand';
import type { GameState, UpgradeId, DerivedStats } from '../engine/types';
import { createInitialState, processTick, buyUpgrade, calculateDerivedStats, resolveManualBox, applyBonusChoice } from '../engine/core';
import { toast } from 'sonner';
import { playSound } from '../utils/audio';

interface GameStore extends GameState {
  stats: DerivedStats;
  history: Array<{ time: string; producao: number; defeitosPM: number; oee: number }>;
  buy: (upgradeId: UpgradeId) => void;
  tick: () => void;
  resolveBox: (isCorrect: boolean) => void;
  chooseBonus: (type: 'speed' | 'points', value: number, durationSeconds: number) => void;
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

const checkAchievements = (state: GameState, stats: DerivedStats) => {
  const currentAchievements = new Set(state.achievements || []);
  let updated = false;

  const milestones = [
    { id: '100_pts', condition: state.points >= 100, msg: '🎉 Marco: 100 Pontos Kaizen!' },
    { id: '1k_pts', condition: state.points >= 1000, msg: '🚀 Marco: 1.000 Pontos!' },
    { id: '10k_pts', condition: state.points >= 10000, msg: '🏭 Marco: 10.000 Pontos! Mega Fábrica!' },
    { id: 'oee_80', condition: stats.oee >= 0.8, msg: '⚙️ Marco: 80% OEE Atingido! Alta Eficiência.' },
    { id: 'oee_100', condition: stats.oee >= 1.0, msg: '🏆 PERFEIÇÃO: 100% OEE Atingido!' },
    { id: 'zero_defect', condition: stats.defectRate <= 0 && state.totalProduced > 100, msg: '✨ ZERO DEFEITOS alcançado!' }
  ];

  milestones.forEach(m => {
    if (m.condition && !currentAchievements.has(m.id)) {
      currentAchievements.add(m.id);
      updated = true;
      toast.success(m.msg, {
        duration: 5000,
        style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #3b82f6', fontSize: '14px', fontWeight: 'bold' }
      });
      setTimeout(() => playSound('buy'), 100);
    }
  });

  if (updated) {
    state.achievements = Array.from(currentAchievements);
  }
};

export const useGameStore = create<GameStore>((set) => {
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
        checkAchievements(finalState, finalState.stats);
        saveState(finalState);
        return finalState;
      });
    },

    resolveBox: (isCorrect: boolean) => {
      set((state) => {
        const currentTimestamp = Date.now();
        const newState = resolveManualBox(state, isCorrect, currentTimestamp);
        const finalState = {
          ...newState,
          stats: calculateDerivedStats(newState.upgrades),
        };
        checkAchievements(finalState, finalState.stats);
        saveState(finalState);
        return finalState;
      });
    },

    chooseBonus: (type: 'speed' | 'points', value: number, durationSeconds: number) => {
      set((state) => {
        const currentTimestamp = Date.now();
        const newState = applyBonusChoice(state, type, value, durationSeconds, currentTimestamp);
        saveState(newState);
        return newState;
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
        
        checkAchievements(finalState, newStats);
        // We only save the game state, not the transient history
        saveState(finalState);
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
