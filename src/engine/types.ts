export type UpgradeId = '5s' | 'kanban' | 'pokayoke' | 'tpm' | 'andon' | 'heijunka';

export interface Upgrade {
  id: UpgradeId;
  name: string;
  baseCost: number;
  maxPurchases: number;
  effectDesc: string;
}

export type BoxColor = 'red' | 'green' | 'blue' | 'yellow';

export interface GameState {
  points: number;
  totalProduced: number;
  totalGood: number;
  totalDefective: number;
  upgrades: Record<UpgradeId, number>;
  lastTickTimestamp: number;
  achievements: string[];
  
  // Novas variáveis para o minigame dos Tubos Coloridos
  consecutiveCorrectManualBoxes: number;
  lastMistakeTimestamp: number; // Para o bônus de 5 minutos
  activeBonusUntil: number | null; // Timestamp de expiração do bônus de velocidade
  bonusSpeedMultiplier: number; // 1.0 = normal, 1.02 = +2% bônus, etc.
  
  // Game Over (Andon Crítico) e Limites do Bônus
  manualErrors: number;
  isGameOver: boolean;
  boxesSortedSinceLastMistake: number;
  
  // Tutorial
  hasSeenTutorial: boolean;
}

export interface DerivedStats {
  speed: number; // Items per second
  defectRate: number; // 0.0 to 1.0 (e.g., 0.3 means 30%)
  oee: number; // 0.0 to 1.0 (e.g., 0.4 means 40%)
  hasAutoRecovery: boolean; // Unlocked by Andon
}
