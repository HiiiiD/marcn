import { createContext, useContext } from 'react';
import type { ChartConfig } from '@/registry/marcn/ui/chart/config';

export type ChartContextValue = { config: ChartConfig; colors: Record<string, string> };

export const ChartContext = createContext<ChartContextValue | null>(null);

export function useChart(): ChartContextValue {
  const context = useContext(ChartContext);
  if (!context) throw new Error('useChart must be used within <ChartContainer>');
  return context;
}
