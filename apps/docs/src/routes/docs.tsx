import { Outlet, createFileRoute } from '@tanstack/react-router';
import { Sidebar } from '@/components/sidebar';

export const Route = createFileRoute('/docs')({ component: DocsLayout });

function DocsLayout() {
  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-4">
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto py-8 pr-2 md:block">
        <Sidebar />
      </aside>
      <main className="min-w-0 flex-1 py-10 pb-24 md:max-w-3xl">
        <details className="mb-6 rounded-md border px-3 py-2 md:hidden">
          <summary className="cursor-pointer text-sm font-medium">Menu</summary>
          <div className="mt-3 max-h-80 overflow-y-auto">
            <Sidebar />
          </div>
        </details>
        <Outlet />
      </main>
    </div>
  );
}
