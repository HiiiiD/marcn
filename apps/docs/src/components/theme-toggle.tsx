import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </button>
  );
}
