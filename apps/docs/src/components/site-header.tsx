import { Link } from '@tanstack/react-router';
import { REPO_URL } from '@/lib/registry';
import { LogoMark } from './logo';
import { ThemeToggle } from './theme-toggle';

const nav = 'text-muted-foreground hover:text-foreground [&.active]:text-foreground';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <LogoMark className="size-6" />
          marcn
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/docs" activeOptions={{ exact: true }} className={nav}>
            Docs
          </Link>
          <Link to="/docs/$kind/$name" params={{ kind: 'components', name: 'button' }} className={nav}>
            Components
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a href={REPO_URL} className="text-sm text-muted-foreground hover:text-foreground">
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
