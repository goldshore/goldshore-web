import { resolveApiUrl } from '../../utils/api';
import ThemeToggle from './ThemeToggle';

const docsUrl = resolveApiUrl('./docs');

export function GSHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <a href="/" className="flex items-center gap-3 transition hover:opacity-90">
          <img src="/assets/goldshore/logo-wordmark-on-light.svg" alt="GoldShore" className="h-7" loading="lazy" />
          <span className="sr-only">GoldShore</span>
        </a>
        <nav className="ml-auto hidden items-center gap-6 text-sm text-muted md:flex">
          <a className="transition hover:text-text" href="/">
            Home
          </a>
          <a className="transition hover:text-text" href="/#products">
            Products
          </a>
          <a className="transition hover:text-text" href="/dash">
            Trading Dashboard
          </a>
          <a className="transition hover:text-text" href="/#pricing">
            Pricing
          </a>
          <a className="transition hover:text-text" href="/blog">
            Blog
          </a>
          <a className="transition hover:text-text" href={docsUrl}>
            Docs
          </a>
          <a className="transition hover:text-text" href="https://admin.goldshore.org">
            Admin
          </a>
          <a className="gs-btn-primary gs-btn-sm" href="/signup">
            Get Started
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-3 md:ml-6">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default GSHeader;
