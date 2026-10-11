import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { type Item, components, utilities } from '@/lib/registry';

const itemClass =
  'block rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground [&.active]:bg-muted [&.active]:font-medium [&.active]:text-foreground';

const Heading = ({ children }: { children: string }) => (
  <h4 className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
    {children}
  </h4>
);

function Group({ title, list }: { title: string; list: Item[] }) {
  if (!list.length) return null;
  return (
    <div className="mt-6">
      <Heading>{title}</Heading>
      {list.map((i) => (
        <Link
          key={i.name}
          to="/docs/$kind/$name"
          params={{ kind: i.kind, name: i.name }}
          className={itemClass}
        >
          {i.title}
        </Link>
      ))}
    </div>
  );
}

export function Sidebar() {
  const [q, setQ] = useState('');
  const match = (i: Item) => i.title.toLowerCase().includes(q.toLowerCase());
  return (
    <nav>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter components…"
        className="mb-4 w-full rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
      />
      <Heading>Getting started</Heading>
      <Link to="/docs" activeOptions={{ exact: true }} className={itemClass}>
        Introduction
      </Link>
      <Link to="/docs/installation" className={itemClass}>
        Installation
      </Link>
      <Link to="/docs/theming" className={itemClass}>
        Theming
      </Link>
      <Link to="/docs/render-prop" className={itemClass}>
        The render prop
      </Link>
      <Group title="Components" list={components.filter(match)} />
      <Group title="Utilities" list={utilities.filter(match)} />
    </nav>
  );
}
