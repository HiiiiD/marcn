import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { View } from 'react-native';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { TooltipContext } from '@/registry/marcn/ui/tooltip/context';

export * from '@/registry/marcn/ui/tooltip/trigger';
export * from '@/registry/marcn/ui/tooltip/content';

export type TooltipProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  duration?: number;
  children?: ReactNode;
};

export function Tooltip({ open: openProp, defaultOpen = false, onOpenChange, delayDuration = 300, duration = 2000, children }: TooltipProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [hint, setHint] = useState<string>();
  const triggerRef = useRef<View>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const value = useMemo(
    () => ({ open, setOpen, triggerRef, alive, hint, setHint, delayDuration, duration }),
    [open, setOpen, hint, delayDuration, duration],
  );
  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}
