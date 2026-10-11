import { createContext, useContext } from 'react';

export type CollapsibleState = { open: boolean; disabled: boolean };
type CollapsibleContextValue = CollapsibleState & { setOpen: (open: boolean) => void };

export const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export function useCollapsible() {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error('Collapsible parts must be used within a Collapsible');
  return ctx;
}
