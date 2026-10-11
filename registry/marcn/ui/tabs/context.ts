import { createContext, useContext } from 'react';

export type Orientation = 'horizontal' | 'vertical';
export type TabsContextValue = { value: string; setValue: (value: string) => void; orientation: Orientation };
export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs parts must be used within Tabs');
  return ctx;
}
