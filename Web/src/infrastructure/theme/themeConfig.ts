export type TMWebThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'trademaster_theme_mode';

function applyClass(mode: TMWebThemeMode) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark', 'system');
  root.classList.add(mode);

  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
    root.classList.toggle('light', !prefersDark);
  }
}

export const themeConfig = {
  getMode(): TMWebThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as TMWebThemeMode | null;
      if (stored && ['system', 'light', 'dark'].includes(stored)) return stored;
    } catch {
      // ignore
    }
    return 'system';
  },

  setMode(mode: TMWebThemeMode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
    applyClass(mode);
  },

  init() {
    applyClass(this.getMode());

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.getMode() === 'system') applyClass('system');
      });
  },
};
