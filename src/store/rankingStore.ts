import { create } from 'zustand';

export interface ScoreEntry {
  name: string;
  score: number;
}

interface RankingStore {
  scores: ScoreEntry[];
  currentPlayerName: string | null;
  saveScore: (name: string, score: number) => void;
  setCurrentPlayerName: (name: string) => void;
}

const RANKING_KEY = 'kaizen-clicker-ranking';
const RANKING_SALT = 'jardel-ranking-salt-2026';

const generateChecksum = (data: ScoreEntry[]) => {
  return btoa(encodeURIComponent(JSON.stringify(data) + RANKING_SALT));
};

const loadScores = (): ScoreEntry[] => {
  try {
    const saved = localStorage.getItem(RANKING_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.data && parsed.checksum) {
        if (generateChecksum(parsed.data) === parsed.checksum) {
          return parsed.data;
        } else {
          console.warn('⚠️ ANTI-CHEAT: Ranking file adulterated!');
        }
      }
    }
  } catch (e) {
    console.error("Failed to load ranking", e);
  }
  return [
    // Pre-populate some fake data just to make the UI look good initially
    { name: 'Dev Sênior', score: 500000 },
    { name: 'Dev Pleno', score: 250000 },
    { name: 'Dev Júnior', score: 50000 },
  ];
};

export const useRankingStore = create<RankingStore>((set) => ({
  scores: loadScores(),
  currentPlayerName: localStorage.getItem('kaizen-clicker-player') || null,
  setCurrentPlayerName: (name: string) => {
    localStorage.setItem('kaizen-clicker-player', name);
    set({ currentPlayerName: name });
  },
  saveScore: (name: string, score: number) => {
    set((state) => {
      const newScores = [...state.scores];
      const existingIndex = newScores.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
      
      if (existingIndex >= 0) {
        if (score > newScores[existingIndex].score) {
          newScores[existingIndex].score = score;
        }
      } else {
        newScores.push({ name, score });
      }
      
      // Sort desc and keep top 10
      newScores.sort((a, b) => b.score - a.score);
      const top10 = newScores.slice(0, 10);
      
      localStorage.setItem(RANKING_KEY, JSON.stringify({
        data: top10,
        checksum: generateChecksum(top10)
      }));
      
      return { scores: top10 };
    });
  }
}));
