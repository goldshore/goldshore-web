(function setInitialTheme() {
  try {
    const storageKey = 'gs-theme';
    const stored = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    const root = document.documentElement;

    if (theme === 'dark') {
      root.dataset.theme = 'dark';
    } else {
      root.dataset.theme = '';
      root.removeAttribute('data-theme');
    }
  } catch (error) {
    console.warn('Theme hydration failed', error);
  }
})();
