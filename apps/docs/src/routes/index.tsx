import { Link, createFileRoute } from '@tanstack/react-router';
import { InstallTabs } from '@/components/install-tabs';
import { components } from '@/lib/registry';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-20 text-center">
      <a
        href="https://ui.shadcn.com"
        className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
      >
        shadcn/ui for React Native
      </a>
      <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
        Build your native component library
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
        Beautifully designed components for React Native and Expo. Plain StyleSheet, no NativeWind,
        no primitives library. Copy them in with the shadcn CLI, then edit them freely.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/docs"
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Get started
        </Link>
        <Link
          to="/docs/$kind/$name"
          params={{ kind: 'components', name: 'button' }}
          className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-muted"
        >
          Components
        </Link>
      </div>
      <div className="mx-auto mt-12 max-w-xl text-left">
        <InstallTabs name="button" />
      </div>
      <div className="mt-16 flex flex-wrap justify-center gap-2">
        {components.map((c) => (
          <Link
            key={c.name}
            to="/docs/$kind/$name"
            params={{ kind: c.kind, name: c.name }}
            className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {c.title}
          </Link>
        ))}
      </div>
    </main>
  );
}
