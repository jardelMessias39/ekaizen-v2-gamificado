export type UpgradeId = '5s' | 'kanban' | 'pokayoke' | 'tpm' | 'andon' | 'heijunka';

export interface Upgrade {
  id: UpgradeId;
  name: string;
  baseCost: number;
  maxPurchases: number;
  effectDesc: string;
}

export interface GameState {
  points: number;
  totalProduced: number;
  totalGood: number;
  totalDefective: number;
  upgrades: Record<UpgradeId, number>;
  lastTickTimestamp: number;
  achievements: string[];
}

export interface DerivedStats {
  speed: number; // Items per second
  defectRate: number; // 0.0 to 1.0 (e.g., 0.3 means 30%)
  oee: number; // 0.0 to 1.0 (e.g., 0.4 means 40%)
  hasAutoRecovery: boolean; // Unlocked by Andon
}
