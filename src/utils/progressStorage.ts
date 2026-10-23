export interface BiomeProgressRecord {
  stars: number; // 0 to 3
  completedRounds: number;
  totalRounds: number;
  highScore: number;
  unlockedLevel: number;
  lastPlayedAt?: string;
}

export interface SavedArtworkItem {
  id: string;
  title: string;
  dataUrl: string;
  createdAt: string;
  xpEarned: number;
}

export interface ChildProgressData {
  totalStars: number;
  totalXP: number;
  biomeProgress: Record<string, BiomeProgressRecord>;
  booksProgress: {
    floraExplored: string[];
    faunaExplored: string[];
  };
  savedArtworks: SavedArtworkItem[];
  updatedAt: string;
}

const PROGRESS_STORAGE_KEY = 'merdekakids_progress_v1';

const DEFAULT_BIOME_PROGRESS: Record<string, BiomeProgressRecord> = {
  rumah_budi: { stars: 3, completedRounds: 8, totalRounds: 8, highScore: 100, unlockedLevel: 1 },
  pantai: { stars: 2, completedRounds: 5, totalRounds: 8, highScore: 60, unlockedLevel: 1 },
  sawah: { stars: 1, completedRounds: 3, totalRounds: 8, highScore: 45, unlockedLevel: 1 },
  hutan: { stars: 2, completedRounds: 4, totalRounds: 8, highScore: 50, unlockedLevel: 1 },
  gunung: { stars: 3, completedRounds: 6, totalRounds: 8, highScore: 70, unlockedLevel: 2 },
  canyon: { stars: 1, completedRounds: 2, totalRounds: 8, highScore: 30, unlockedLevel: 1 },
  lembah: { stars: 1, completedRounds: 2, totalRounds: 8, highScore: 35, unlockedLevel: 1 },
  danau: { stars: 1, completedRounds: 2, totalRounds: 8, highScore: 45, unlockedLevel: 1 },
  karya: { stars: 2, completedRounds: 4, totalRounds: 8, highScore: 80, unlockedLevel: 1 },
};

const DEFAULT_PROGRESS: ChildProgressData = {
  totalStars: 13,
  totalXP: 240,
  biomeProgress: DEFAULT_BIOME_PROGRESS,
  booksProgress: {
    floraExplored: ['mawar'],
    faunaExplored: ['singa'],
  },
  savedArtworks: [],
  updatedAt: new Date().toISOString(),
};

export function loadChildProgress(): ChildProgressData {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<ChildProgressData>;
    return {
      totalStars: typeof parsed.totalStars === 'number' ? parsed.totalStars : DEFAULT_PROGRESS.totalStars,
      totalXP: typeof parsed.totalXP === 'number' ? parsed.totalXP : DEFAULT_PROGRESS.totalXP,
      biomeProgress: {
        ...DEFAULT_BIOME_PROGRESS,
        ...(parsed.biomeProgress || {}),
      },
      booksProgress: {
        floraExplored: Array.isArray(parsed.booksProgress?.floraExplored)
          ? parsed.booksProgress.floraExplored
          : DEFAULT_PROGRESS.booksProgress.floraExplored,
        faunaExplored: Array.isArray(parsed.booksProgress?.faunaExplored)
          ? parsed.booksProgress.faunaExplored
          : DEFAULT_PROGRESS.booksProgress.faunaExplored,
      },
      savedArtworks: Array.isArray(parsed.savedArtworks) ? parsed.savedArtworks : [],
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveChildProgress(next: ChildProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: ChildProgressData = {
      ...next,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('merdekakids-progress-updated', { detail: payload }));
  } catch {
    // Ignore storage quota errors safely
  }
}

export function recordBiomeCompletion(
  biomeKey: string,
  earnedStars: number,
  earnedXP: number
): ChildProgressData {
  const current = loadChildProgress();
  const prevBiome = current.biomeProgress[biomeKey] || {
    stars: 0,
    completedRounds: 0,
    totalRounds: 8,
    highScore: 0,
    unlockedLevel: 1,
  };

  const newStars = Math.max(prevBiome.stars, Math.min(3, Math.max(1, earnedStars)));
  const starDelta = Math.max(0, earnedStars);
  const nextCompletedRounds = Math.min(prevBiome.totalRounds, prevBiome.completedRounds + 1);

  const updated: ChildProgressData = {
    ...current,
    totalStars: current.totalStars + starDelta,
    totalXP: current.totalXP + earnedXP,
    biomeProgress: {
      ...current.biomeProgress,
      [biomeKey]: {
        stars: newStars,
        completedRounds: nextCompletedRounds,
        totalRounds: prevBiome.totalRounds,
        highScore: Math.max(prevBiome.highScore, earnedXP),
        unlockedLevel: nextCompletedRounds >= 4 ? Math.max(2, prevBiome.unlockedLevel + 1) : prevBiome.unlockedLevel,
        lastPlayedAt: new Date().toISOString(),
      },
    },
    updatedAt: new Date().toISOString(),
  };

  saveChildProgress(updated);
  return updated;
}

export function recordArtworkSaved(title: string, dataUrl: string, xpEarned = 30): ChildProgressData {
  const current = loadChildProgress();
  const newArtwork: SavedArtworkItem = {
    id: `art-${Date.now()}`,
    title,
    dataUrl,
    createdAt: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    xpEarned,
  };

  // Keep up to 8 recent artworks in localStorage to prevent exceeding browser storage quota
  const nextArtworks = [newArtwork, ...current.savedArtworks].slice(0, 8);

  const updated: ChildProgressData = {
    ...current,
    totalStars: current.totalStars + 1,
    totalXP: current.totalXP + xpEarned,
    savedArtworks: nextArtworks,
    updatedAt: new Date().toISOString(),
  };

  saveChildProgress(updated);
  return updated;
}

export function recordBookExplored(type: 'flora' | 'fauna', itemKey: string): ChildProgressData {
  const current = loadChildProgress();
  const list = type === 'flora' ? current.booksProgress.floraExplored : current.booksProgress.faunaExplored;
  const isNew = !list.includes(itemKey);

  const updated: ChildProgressData = {
    ...current,
    totalStars: isNew ? current.totalStars + 1 : current.totalStars,
    totalXP: isNew ? current.totalXP + 15 : current.totalXP,
    booksProgress: {
      ...current.booksProgress,
      floraExplored: type === 'flora' && isNew ? [...list, itemKey] : current.booksProgress.floraExplored,
      faunaExplored: type === 'fauna' && isNew ? [...list, itemKey] : current.booksProgress.faunaExplored,
    },
    updatedAt: new Date().toISOString(),
  };

  if (isNew) {
    saveChildProgress(updated);
  }
  return updated;
}
