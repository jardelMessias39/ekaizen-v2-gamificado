import type { Upgrade } from './types';

export const UPGRADES: Record<string, Upgrade> = {
  '5s': {
    id: '5s',
    name: '5S',
    baseCost: 50,
    maxPurchases: 5,
    effectDesc: '-5% defeito, +10% velocidade',
  },
  'kanban': {
    id: 'kanban',
    name: 'Kanban',
    baseCost: 200,
    maxPurchases: 5,
    effectDesc: '+20% velocidade',
  },
  'pokayoke': {
    id: 'pokayoke',
    name: 'Poka-Yoke',
    baseCost: 500,
    maxPurchases: 5,
    effectDesc: '-15% defeito',
  },
  'tpm': {
    id: 'tpm',
    name: 'TPM',
    baseCost: 1500,
    maxPurchases: 5,
    effectDesc: '+15% OEE, -10% defeito',
  },
  'andon': {
    id: 'andon',
    name: 'Andon',
    baseCost: 4000,
    maxPurchases: 5, // A strict requirement says "Cada melhoria pode ser comprada até 5 vezes". Even for Andon.
    effectDesc: 'Desbloqueia auto-recovery em paradas',
  },
  'heijunka': {
    id: 'heijunka',
    name: 'Heijunka',
    baseCost: 10000,
    maxPurchases: 5,
    effectDesc: 'Nivela produção, +25% OEE',
  },
};

export const INITIAL_STATE = {
  speed: 1, // 1 item per second
  defectRate: 0.30, // 30%
  oee: 0.40, // 40%
};
