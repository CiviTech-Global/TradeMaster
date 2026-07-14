/**
 * Persistent configuration for the TradeMaster server base URL.
 *
 * Each client (Web, App) stores its own server URL. The Web stores the URL in
 * localStorage and falls back to VITE_API_BASE_URL when nothing is saved yet.
 */

const STORAGE_KEY = 'trademaster_server_url';

function getDefaultUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
}

function sanitize(url: string): string {
  let sanitized = url.trim();
  if (sanitized.length === 0) return getDefaultUrl();
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    sanitized = `http://${sanitized}`;
  }
  return sanitized.replace(/\/$/, '');
}

export const serverUrlConfig = {
  getDefaultUrl,
  sanitize,

  getUrl(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return sanitize(stored);
    } catch {
      // localStorage may be unavailable in private mode or certain contexts.
    }
    return getDefaultUrl();
  },

  setUrl(url: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, sanitize(url));
    } catch {
      // Ignore write failures.
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore failures.
    }
  },

  isConfigured(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  },
};
