import { useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'gs-theme';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.dataset.theme = 'dark';
  } else {
    root.removeAttribute('data-theme');
  }
}

function resolveInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => 'dark');

  useEffect(() => {
    const initial = resolveInitialTheme();
    setMode(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    applyTheme(mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return (
    <button
      type="button"
      onClick={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      className="rounded-md border border-border px-3 py-1 text-sm text-muted transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-brand/40"
      style={{ transitionDuration: 'var(--dur)', transitionTimingFunction: 'var(--ease)' }}
      aria-label="Toggle theme"
    >
      {mode === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}

export default ThemeToggle;
