import { createContext, useContext, type RefObject } from 'react';
import type { View } from 'react-native';

export type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<View | null>;
  alive: RefObject<boolean>;
  hint?: string;
  setHint: (hint?: string) => void;
  delayDuration: number;
  duration: number;
};

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error('Tooltip parts must be used within a Tooltip');
  return ctx;
}
