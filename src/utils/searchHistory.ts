export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

const STORAGE_KEY = 'pdfmaster_search_history';
const MAX_HISTORY_ITEMS = 10;

export const POPULAR_SEARCH_TERMS = [
  'Compress PDF',
  'পিডিএফ সাইজ কমানো',
  'Image to PDF',
  'ছবি থেকে পিডিএফ',
  'Merge PDF',
  'পিডিএফ জোড়া লাগানো',
  'PDF to Word',
  'পিডিএফ থেকে ওয়ার্ড',
  'OCR Text',
  'বাংলা ওসিআর',
  'Protect PDF',
  'পিডিএফ পাসওয়ার্ড',
];

export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) => item && typeof item.query === 'string' && item.query.trim().length > 0
      );
    }
  } catch (e) {
    console.error('Error reading search history:', e);
  }
  return [];
}

export function saveSearchQuery(query: string): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  const trimmed = query.trim();
  if (!trimmed) return getSearchHistory();

  try {
    const existing = getSearchHistory();
    // Filter out previous exact or case-insensitive matches
    const filtered = existing.filter(
      (item) => item.query.toLowerCase() !== trimmed.toLowerCase()
    );

    const newItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      query: trimmed,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving search query:', e);
    return getSearchHistory();
  }
}

export function removeSearchQuery(idOrQuery: string): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSearchHistory();
    const updated = existing.filter(
      (item) => item.id !== idOrQuery && item.query.toLowerCase() !== idOrQuery.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error removing search item:', e);
    return getSearchHistory();
  }
}

export function clearSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing search history:', e);
  }
  return [];
}

export function formatTimeAgo(timestamp: number): string {
  const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
  if (elapsedSeconds < 60) return 'Just now';
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
