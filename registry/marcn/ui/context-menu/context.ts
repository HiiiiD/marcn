import { createContext, useContext } from 'react';
import type { AnchorPoint } from '@/registry/marcn/lib/use-anchored-position';

type PointContextValue = { point: AnchorPoint | null; setPoint: (point: AnchorPoint | null) => void };

export const PointContext = createContext<PointContextValue | null>(null);

export function usePoint() {
  const ctx = useContext(PointContext);
  if (!ctx) throw new Error('ContextMenu parts must be used within a ContextMenu');
  return ctx;
}
