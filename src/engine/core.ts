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
  achievements: [],
  consecutiveCorrectManualBoxes: 0,
  lastMistakeTimestamp: Date.now(),
  activeBonusUntil: null,
  bonusSpeedMultiplier: 1.0,

  manualErrors: 0,
  isGameOver: false,
  boxesSortedSinceLastMistake: 0,
  
  hasSeenTutorial: false,
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
  // Se está em Game Over, a linha está parada.
  if (state.isGameOver) {
    return state;
  }
  
  let activeBonusUntil = state.activeBonusUntil || null;
  let bonusSpeedMultiplier = state.bonusSpeedMultiplier || 1.0;
  
  // Limpar bônus se expirou
  if (activeBonusUntil && currentTimestamp > activeBonusUntil) {
    activeBonusUntil = null;
    bonusSpeedMultiplier = 1.0;
  }

  const deltaSeconds = Math.floor((currentTimestamp - state.lastTickTimestamp) / 1000);
  
  if (deltaSeconds <= 0) {
    if (activeBonusUntil !== state.activeBonusUntil) {
      return { ...state, activeBonusUntil, bonusSpeedMultiplier };
    }
    return state; 
  }

  const stats = calculateDerivedStats(state.upgrades);
  const currentSpeed = stats.speed * bonusSpeedMultiplier;
  
  const itemsProducedFloat = currentSpeed * deltaSeconds;
  const itemsProduced = itemsProducedFloat;
  
  const defectiveItems = itemsProduced * stats.defectRate;
  const goodItems = itemsProduced - defectiveItems;

  return {
    ...state,
    points: state.points + goodItems,
    totalProduced: state.totalProduced + itemsProduced,
    totalDefective: state.totalDefective + defectiveItems,
    totalGood: state.totalGood + goodItems,
    lastTickTimestamp: state.lastTickTimestamp + (deltaSeconds * 1000),
    activeBonusUntil,
    bonusSpeedMultiplier,
  };
};

export const resolveManualBox = (state: GameState, isCorrect: boolean, currentTimestamp: number, boxColor?: string): GameState => {
  let newConsecutive = state.consecutiveCorrectManualBoxes || 0;
  let newLastMistake = state.lastMistakeTimestamp || currentTimestamp;
  let newManualErrors = state.manualErrors || 0;
  let newBoxesSorted = state.boxesSortedSinceLastMistake || 0;
  let newIsGameOver = state.isGameOver || false;
  
  // Se já está game over, não faz nada com caixas
  if (newIsGameOver) return state;

  let gainedPoints = 0;
  let gainedDefects = 0;
  
  if (isCorrect) {
    newConsecutive++;
    newBoxesSorted++;
    newManualErrors = Math.max(0, newManualErrors - 1); // Acertar cura a barra de vida
    
    // Diferent colors give different base points
    let basePoints = 10;
    if (boxColor === 'green') basePoints = 20;
    if (boxColor === 'blue') basePoints = 30;
    if (boxColor === 'yellow') basePoints = 40;

    gainedPoints = basePoints;
    if (newConsecutive >= 10) gainedPoints = basePoints * 2; // Bônus de Combo
    if (newConsecutive >= 30) gainedPoints = basePoints * 3;
    if (newConsecutive >= 50) gainedPoints = basePoints * 5;
  } else {
    newConsecutive = 0;
    newBoxesSorted = 0;
    newLastMistake = currentTimestamp;
    newManualErrors++;
    gainedDefects = 1;
  }
  
  let finalPoints = (state.points || 0) + gainedPoints;
  
  // Checagem de Game Over (Andon - Parada Crítica)
  if (newManualErrors >= 10) {
    newIsGameOver = true;
    finalPoints = 0; // Punição!
    newManualErrors = 0;
    newConsecutive = 0;
    newBoxesSorted = 0;
  }

  return {
    ...state,
    totalProduced: (state.totalProduced || 0) + 1,
    totalDefective: (state.totalDefective || 0) + gainedDefects,
    totalGood: (state.totalGood || 0) + (isCorrect ? 1 : 0),
    points: finalPoints,
    consecutiveCorrectManualBoxes: newConsecutive,
    lastMistakeTimestamp: newLastMistake,
    manualErrors: newManualErrors,
    isGameOver: newIsGameOver,
    boxesSortedSinceLastMistake: newBoxesSorted,
  };
};

export const applyBonusChoice = (state: GameState, type: 'speed' | 'points', value: number, durationSeconds: number, currentTimestamp: number): GameState => {
  if (type === 'points') {
    return {
      ...state,
      points: state.points + value,
      lastMistakeTimestamp: currentTimestamp, // Reseta o timer para o próximo bônus
    };
  } else {
    return {
      ...state,
      bonusSpeedMultiplier: value, // ex: 1.02
      activeBonusUntil: currentTimestamp + (durationSeconds * 1000),
      lastMistakeTimestamp: currentTimestamp,
    };
  }
};
