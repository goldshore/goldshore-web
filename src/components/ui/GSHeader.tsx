import ThemeToggle from './ThemeToggle';

export function GSHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <img src="/logo.svg" alt="GoldShore" className="h-7 w-7" />
        <span className="font-display tracking-[-0.01em] text-lg text-text">GoldShore</span>
        <nav className="ml-auto flex items-center gap-6 text-sm text-muted">
          <a className="transition hover:text-text" href="/admin">Admin</a>
          <a className="transition hover:text-text" href="/dash">Trading</a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export default GSHeader;
