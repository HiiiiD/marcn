import { Outlet, createRootRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';

export const Route = createRootRoute({
  component: () => (
    <>
      <SiteHeader />
      <Outlet />
    </>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
    </div>
  ),
});
