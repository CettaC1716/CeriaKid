export interface SavedBookItem {
  id: string;
  bookType: 'flora' | 'fauna' | 'bahasa' | 'matematika' | 'pancasila';
  subKey?: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  xp: string;
  savedAt: string;
  gradient: string;
}

export type HighlightColorKey = 'yellow' | 'green' | 'pink' | 'blue' | 'eraser';

export interface HighlightColorOption {
  key: HighlightColorKey;
  label: string;
  hex: string;
  bgStyle: string;
  ringColor: string;
}

export const HIGHLIGHT_COLORS: HighlightColorOption[] = [
  {
    key: 'yellow',
    label: 'Kuning Cerah',
    hex: '#fde047',
    bgStyle: 'rgba(253, 224, 71, 0.42)',
    ringColor: '#facc15',
  },
  {
    key: 'green',
    label: 'Hijau Daun',
    hex: '#86efac',
    bgStyle: 'rgba(134, 239, 172, 0.42)',
    ringColor: '#4ade80',
  },
  {
    key: 'pink',
    label: 'Pink Hangat',
    hex: '#f9a8d4',
    bgStyle: 'rgba(249, 168, 212, 0.45)',
    ringColor: '#f472b6',
  },
  {
    key: 'blue',
    label: 'Biru Langit',
    hex: '#7dd3fc',
    bgStyle: 'rgba(125, 211, 252, 0.42)',
    ringColor: '#38bdf8',
  },
];

export const SAVED_BOOKS_STORAGE_KEY = 'ceriakids_saved_books';
export const BOOK_HIGHLIGHTS_STORAGE_KEY = 'ceriakids_book_highlights';

export const loadSavedBooks = (): SavedBookItem[] => {
  try {
    const raw = localStorage.getItem(SAVED_BOOKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveBooksList = (list: SavedBookItem[]) => {
  try {
    localStorage.setItem(SAVED_BOOKS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('ceriakids-saved-books-updated'));
  } catch {
    // ignore storage errors
  }
};

export const isBookInChest = (id: string, list?: SavedBookItem[]): boolean => {
  const current = list ?? loadSavedBooks();
  return current.some((b) => b.id === id);
};

export const toggleBookInChest = (
  book: Omit<SavedBookItem, 'savedAt'>
): { saved: boolean; list: SavedBookItem[] } => {
  const current = loadSavedBooks();
  const exists = current.some((b) => b.id === book.id);
  let next: SavedBookItem[];
  if (exists) {
    next = current.filter((b) => b.id !== book.id);
  } else {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    next = [{ ...book, savedAt: formattedDate }, ...current];
  }
  saveBooksList(next);
  return { saved: !exists, list: next };
};

export const removeBookFromChest = (id: string): SavedBookItem[] => {
  const current = loadSavedBooks();
  const next = current.filter((b) => b.id !== id);
  saveBooksList(next);
  return next;
};

// Book Highlighter Storage per Page
export type PageHighlightsMap = Record<string, Record<string, Exclude<HighlightColorKey, 'eraser'>>>;

export const loadAllPageHighlights = (): PageHighlightsMap => {
  try {
    const raw = localStorage.getItem(BOOK_HIGHLIGHTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getPageHighlights = (
  pageKey: string
): Record<string, Exclude<HighlightColorKey, 'eraser'>> => {
  const all = loadAllPageHighlights();
  return all[pageKey] || {};
};

export const setElementHighlight = (
  pageKey: string,
  elementId: string,
  color: HighlightColorKey
): Record<string, Exclude<HighlightColorKey, 'eraser'>> => {
  const all = loadAllPageHighlights();
  const currentPage = { ...(all[pageKey] || {}) };

  if (color === 'eraser') {
    delete currentPage[elementId];
  } else if (currentPage[elementId] === color) {
    // Tapping again with same color toggles it off
    delete currentPage[elementId];
  } else {
    currentPage[elementId] = color;
  }

  all[pageKey] = currentPage;
  try {
    localStorage.setItem(BOOK_HIGHLIGHTS_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('ceriakids-highlights-updated'));
  } catch {
    // ignore
  }
  return currentPage;
};

export const clearPageHighlights = (pageKey: string) => {
  const all = loadAllPageHighlights();
  delete all[pageKey];
  try {
    localStorage.setItem(BOOK_HIGHLIGHTS_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('ceriakids-highlights-updated'));
  } catch {
    // ignore
  }
};

export const getHighlightStyle = (
  colorKey?: Exclude<HighlightColorKey, 'eraser'>
): React.CSSProperties | undefined => {
  if (!colorKey) return undefined;
  const found = HIGHLIGHT_COLORS.find((c) => c.key === colorKey);
  if (!found) return undefined;
  return {
    backgroundColor: found.bgStyle,
    boxShadow: `0 0 0 2px ${found.ringColor}, 0 4px 14px ${found.bgStyle}`,
    borderBottom: `3px solid ${found.hex}`,
  };
};
