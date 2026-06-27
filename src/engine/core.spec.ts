import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, processTick, buyUpgrade, calculateDerivedStats, calculateUpgradeCost, resolveManualBox, applyBonusChoice } from './core';
import type { GameState, UpgradeId } from './types';

describe('Game Engine', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialState();
  });

  describe('calculateUpgradeCost', () => {
    it('should calculate base cost for 0 purchases', () => {
      expect(calculateUpgradeCost('5s', 0)).toBe(50);
    });

    it('should calculate geometric cost correctly: base * 1.5^n', () => {
      // 50 * 1.5^1 = 75
      expect(calculateUpgradeCost('5s', 1)).toBe(75);
      // 50 * 1.5^2 = 112.5 -> floor -> 112
      expect(calculateUpgradeCost('5s', 2)).toBe(112);
    });

    it('should return Infinity for invalid upgrade', () => {
      expect(calculateUpgradeCost('invalid' as UpgradeId, 1)).toBe(Infinity);
    });
  });

  describe('calculateDerivedStats', () => {
    it('should calculate initial stats correctly', () => {
      const stats = calculateDerivedStats(initialState.upgrades);
      expect(stats.speed).toBe(1);
      expect(stats.defectRate).toBe(0.30);
      expect(stats.oee).toBe(0.40);
      expect(stats.hasAutoRecovery).toBe(false);
    });

    it('should apply 5S effects', () => {
      const stats = calculateDerivedStats({ ...initialState.upgrades, '5s': 1 });
      expect(stats.speed).toBeCloseTo(1.10);
      expect(stats.defectRate).toBeCloseTo(0.25);
    });

    it('should clamp defectRate to not be below 0', () => {
      const stats = calculateDerivedStats({ ...initialState.upgrades, '5s': 5, 'pokayoke': 5 });
      expect(stats.defectRate).toBe(0);
    });

    it('should apply Andon effect', () => {
      const stats = calculateDerivedStats({ ...initialState.upgrades, 'andon': 1 });
      expect(stats.hasAutoRecovery).toBe(true);
    });
  });

  describe('buyUpgrade', () => {
    it('should not buy if not enough points', () => {
      initialState.points = 40; // 5S costs 50
      const newState = buyUpgrade(initialState, '5s');
      expect(newState.upgrades['5s']).toBe(0);
      expect(newState.points).toBe(40);
    });

    it('should buy upgrade and deduct points', () => {
      initialState.points = 100;
      const newState = buyUpgrade(initialState, '5s');
      expect(newState.upgrades['5s']).toBe(1);
      expect(newState.points).toBe(50); // 100 - 50 = 50
    });

    it('should respect max purchases', () => {
      initialState.points = 10000;
      initialState.upgrades['5s'] = 5; // Max is 5
      const newState = buyUpgrade(initialState, '5s');
      expect(newState.upgrades['5s']).toBe(5);
    });
    
    it('should ignore invalid upgrade', () => {
      initialState.points = 10000;
      const newState = buyUpgrade(initialState, 'invalid' as UpgradeId);
      expect(newState).toEqual(initialState);
    });
  });

  describe('processTick', () => {
    it('should do nothing if less than 1 second has passed', () => {
      const newState = processTick(initialState, initialState.lastTickTimestamp + 500);
      expect(newState.totalProduced).toBe(0);
    });

    it('should process 1 tick (1 second) correctly', () => {
      const newState = processTick(initialState, initialState.lastTickTimestamp + 1000);
      expect(newState.totalProduced).toBe(1);
      expect(newState.totalDefective).toBe(0.3);
      expect(newState.totalGood).toBe(0.7);
      expect(newState.points).toBe(0.7);
    });

    it('should process background time correctly (Regra 2)', () => {
      // 5 minutes minimized = 300 seconds
      const newState = processTick(initialState, initialState.lastTickTimestamp + 300000);
      expect(newState.totalProduced).toBe(300);
      expect(newState.totalDefective).toBe(90);
      expect(newState.totalGood).toBe(210);
      expect(newState.points).toBe(210);
      expect(newState.lastTickTimestamp).toBe(initialState.lastTickTimestamp + 300000);
    });
  });

  describe('resolveManualBox & applyBonusChoice', () => {
    it('should reward point and combo on correct box', () => {
      const newState = resolveManualBox(initialState, true, Date.now());
      expect(newState.consecutiveCorrectManualBoxes).toBe(1);
      expect(newState.points).toBe(1);
    });

    it('should reset combo and register defect on incorrect box', () => {
      initialState.consecutiveCorrectManualBoxes = 5;
      const newState = resolveManualBox(initialState, false, Date.now());
      expect(newState.consecutiveCorrectManualBoxes).toBe(0);
      expect(newState.totalDefective).toBe(1);
    });

    it('should apply combo multipliers', () => {
      initialState.consecutiveCorrectManualBoxes = 10;
      const newState = resolveManualBox(initialState, true, Date.now());
      expect(newState.points).toBe(2); // 10+ combo gives 2 points
    });

    it('should apply bonus choice correctly', () => {
      const t = Date.now();
      const statePts = applyBonusChoice(initialState, 'points', 50, 0, t);
      expect(statePts.points).toBe(50);
      
      const stateSpd = applyBonusChoice(initialState, 'speed', 1.02, 20, t);
      expect(stateSpd.bonusSpeedMultiplier).toBe(1.02);
      expect(stateSpd.activeBonusUntil).toBe(t + 20000);
    });
  });
});
