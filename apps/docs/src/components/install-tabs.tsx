import { useState } from 'react';
import { CopyButton } from './copy-button';

const managers = [
  { label: 'npm', add: 'npx shadcn@latest add', install: 'npm install' },
  { label: 'yarn', add: 'yarn dlx shadcn@latest add', install: 'yarn add' },
  { label: 'pnpm', add: 'pnpm dlx shadcn@latest add', install: 'pnpm add' },
  { label: 'bun', add: 'bunx --bun shadcn@latest add', install: 'bun add' },
] as const;

export function InstallTabs({ name, packages }: { name?: string; packages?: string[] }) {
  const [active, setActive] = useState(0);
  const m = managers[active];
  const cmd = packages ? `${m.install} ${packages.join(' ')}` : `${m.add} @marcn/${name}`;
  return (
    <div className="overflow-hidden rounded-lg border bg-muted/40">
      <div className="flex items-center justify-between border-b pr-2">
        <div className="flex">
          {managers.map(({ label }, i) => (
            <button
              key={label}
              onClick={() => setActive(i)}
              className={`px-4 py-2 font-mono text-xs ${
                i === active
                  ? 'border-b-2 border-foreground text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <CopyButton text={cmd} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px]">{cmd}</pre>
    </div>
  );
}
