import { UPGRADES, INITIAL_STATE } from './constants';
import type { GameState, DerivedStats, UpgradeId } from './types';

export const createInitialState = (): GameState => ({
  points: 0,
  totalProduced: 0,
  totalGood: 0,
  totalDefective: 0,
  upgrades: {
    '5s': 0,
    'kanban': 0,
    'pokayoke': 0,
    'tpm': 0,
    'andon': 0,
    'heijunka': 0,
  },
  lastTickTimestamp: Date.now(),
});

export const calculateUpgradeCost = (upgradeId: UpgradeId, currentPurchases: number): number => {
  const upgrade = UPGRADES[upgradeId];
  if (!upgrade) return Infinity;
  // custo_n = custo_base * 1.5 ^ n_compras
  return Math.floor(upgrade.baseCost * Math.pow(1.5, currentPurchases));
};

export const calculateDerivedStats = (upgrades: GameState['upgrades']): DerivedStats => {
  let speed = INITIAL_STATE.speed;
  let defectRate = INITIAL_STATE.defectRate;
  let oee = INITIAL_STATE.oee;
  let hasAutoRecovery = false;

  // 5S: -5% defeito, +10% velocidade por compra
  const count5S = upgrades['5s'] || 0;
  speed += 0.10 * count5S;
  defectRate -= 0.05 * count5S;

  // Kanban: +20% velocidade por compra
  const countKanban = upgrades['kanban'] || 0;
  speed += 0.20 * countKanban;

  // Poka-Yoke: -15% defeito por compra
  const countPokaYoke = upgrades['pokayoke'] || 0;
  defectRate -= 0.15 * countPokaYoke;

  // TPM: +15% OEE, -10% defeito por compra
  const countTPM = upgrades['tpm'] || 0;
  oee += 0.15 * countTPM;
  defectRate -= 0.10 * countTPM;

  // Andon: desbloqueia auto-recovery em paradas (at least 1 purchase)
  const countAndon = upgrades['andon'] || 0;
  if (countAndon > 0) {
    hasAutoRecovery = true;
  }

  // Heijunka: +25% OEE por compra
  const countHeijunka = upgrades['heijunka'] || 0;
  oee += 0.25 * countHeijunka;

  // Clamp values so they make sense
  if (defectRate < 0) defectRate = 0;
  if (oee > 1) oee = 1;

  return { speed, defectRate, oee, hasAutoRecovery };
};

export const buyUpgrade = (state: GameState, upgradeId: UpgradeId): GameState => {
  const upgrade = UPGRADES[upgradeId];
  if (!upgrade) return state;

  const currentPurchases = state.upgrades[upgradeId] || 0;
  if (currentPurchases >= upgrade.maxPurchases) {
    return state; // Already maxed
  }

  const cost = calculateUpgradeCost(upgradeId, currentPurchases);
  if (state.points < cost) {
    return state; // Not enough points
  }

  return {
    ...state,
    points: state.points - cost,
    upgrades: {
      ...state.upgrades,
      [upgradeId]: currentPurchases + 1,
    },
  };
};

export const processTick = (state: GameState, currentTimestamp: number): GameState => {
  // Regra 2: Aba em background continua produzindo.
  // Calculate how many ticks (seconds) have passed since last update
  const deltaSeconds = Math.floor((currentTimestamp - state.lastTickTimestamp) / 1000);
  
  if (deltaSeconds <= 0) {
    return state; // Not enough time has passed
  }

  const stats = calculateDerivedStats(state.upgrades);
  
  // Calculate total items produced in this time block
  // items = speed * seconds
  const itemsProducedFloat = stats.speed * deltaSeconds;
  
  // In a real idle game, we might deal with floats or round down. Let's floor for discrete items, 
  // but keep track of fractions if needed. For simplicity, let's round or just use float internally.
  // Since "produção" is an indicator, 1.2 peças por segundo over 10 seconds is 12 peças.
  // We'll just use the float values for accumulated points.
  const itemsProduced = itemsProducedFloat;
  
  const defectiveItems = itemsProduced * stats.defectRate;
  const goodItems = itemsProduced - defectiveItems;

  return {
    ...state,
    points: state.points + goodItems,
    totalProduced: state.totalProduced + itemsProduced,
    totalDefective: state.totalDefective + defectiveItems,
    totalGood: state.totalGood + goodItems,
    lastTickTimestamp: state.lastTickTimestamp + (deltaSeconds * 1000), // Advance exactly the processed seconds
  };
};

export const clickFactory = (state: GameState): GameState => {
  const stats = calculateDerivedStats(state.upgrades);
  // manual clicks are subject to the same defect rate, evaluated individually
  const isDefect = Math.random() < stats.defectRate;
  
  return {
    ...state,
    totalProduced: state.totalProduced + 1,
    totalDefective: state.totalDefective + (isDefect ? 1 : 0),
    totalGood: state.totalGood + (isDefect ? 0 : 1),
    points: state.points + (isDefect ? 0 : 1),
  };
};
