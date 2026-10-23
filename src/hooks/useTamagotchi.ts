import { useState, useEffect, useCallback } from 'react';
import { CharviEmotion } from '../types';

export interface TamagotchiState {
  energy: number; // 0-100
  honeyCount: number;
  appleCount: number;
  watermelonCount: number;
  starPoints: number;
  lastFed: number; // timestamp
}

const STORAGE_KEY = 'cincau_tamagotchi_state';

const DEFAULT_STATE: TamagotchiState = {
  energy: 80,
  honeyCount: 1,
  appleCount: 1,
  watermelonCount: 1,
  starPoints: 12,
  lastFed: Date.now(),
};

export const useTamagotchi = () => {
  const [state, setState] = useState<TamagotchiState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          typeof parsed.energy === 'number'
        ) {
          return {
            energy: Math.max(0, Math.min(100, parsed.energy)),
            honeyCount: Math.max(0, parsed.honeyCount ?? 1),
            appleCount: Math.max(0, parsed.appleCount ?? 1),
            watermelonCount: Math.max(0, parsed.watermelonCount ?? 1),
            starPoints: Math.max(0, parsed.starPoints ?? 12),
            lastFed: typeof parsed.lastFed === 'number' ? parsed.lastFed : Date.now(),
          };
        }
      }
    } catch {
      // Fallback to default if storage fails or contains corrupt JSON
    }
    return DEFAULT_STATE;
  });

  // Persist state safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota exceeded or restricted storage errors
    }
  }, [state]);

  // Natural decay of energy over time
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        energy: Math.max(0, prev.energy - 0.5), // slowly decrease energy
      }));
    }, 1000 * 60 * 5); // every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const feed = useCallback((foodType: 'honey' | 'apple' | 'watermelon' = 'honey'): boolean => {
    let success = false;
    setState((prev) => {
      const countKey = `${foodType}Count` as keyof TamagotchiState;
      const currentCount = prev[countKey] as number;

      if (currentCount > 0 && prev.energy < 100) {
        success = true;
        const energyGain = foodType === 'honey' ? 35 : foodType === 'apple' ? 30 : 25;
        return {
          ...prev,
          [countKey]: currentCount - 1,
          energy: Math.min(100, prev.energy + energyGain),
          lastFed: Date.now(),
        };
      }
      return prev;
    });
    return success;
  }, []);

  const pet = useCallback(() => {
    setState((prev) => ({
      ...prev,
      energy: Math.min(100, prev.energy + 6),
    }));
  }, []);

  const updateEnergy = useCallback((updater: number | ((prev: number) => number)) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev.energy) : updater;
      return {
        ...prev,
        energy: Math.max(0, Math.min(100, next)),
      };
    });
  }, []);

  const addMisiRewards = useCallback((food: number, stars: number) => {
    setState((prev) => ({
      ...prev,
      honeyCount: prev.honeyCount + Math.max(0, food),
      appleCount: prev.appleCount + Math.max(0, food),
      watermelonCount: prev.watermelonCount + Math.max(0, food),
      starPoints: prev.starPoints + Math.max(0, stars),
      energy: Math.min(100, prev.energy + 5), // boost for learning!
    }));
  }, []);

  const refillFood = useCallback(() => {
    setState((prev) => ({
      ...prev,
      honeyCount: Math.max(prev.honeyCount, 1),
      appleCount: Math.max(prev.appleCount, 1),
      watermelonCount: Math.max(prev.watermelonCount, 1),
    }));
  }, []);

  const gainStars = useCallback((stars: number) => {
    setState((prev) => ({
      ...prev,
      starPoints: prev.starPoints + Math.max(0, stars),
    }));
  }, []);

  const getEmotion = useCallback((): CharviEmotion => {
    if (state.energy < 25) return 'sad';
    return 'idle';
  }, [state.energy]);

  const getMascotDialog = useCallback(() => {
    if (state.energy >= 80) return 'Wah, terima kasih makanannya! Budi siap belajar lagi! ✨';
    if (state.energy >= 50) return 'Budi segar dan siap menemani harimu. 🌟';
    if (state.energy >= 30) return 'Hmm, perut Budi mulai keroncongan... 🥣';
    return 'Budi lapar dan rindu belajar bareng kamu... yuk buka 1 misi! 🥺';
  }, [state.energy]);

  return {
    ...state,
    foodStock: state.honeyCount + state.appleCount + state.watermelonCount,
    inventory: {
      honey: state.honeyCount,
      apple: state.appleCount,
      watermelon: state.watermelonCount,
    },
    feed,
    pet,
    updateEnergy,
    addMisiRewards,
    refillFood,
    gainStars,
    getEmotion,
    getMascotDialog,
  };
};

