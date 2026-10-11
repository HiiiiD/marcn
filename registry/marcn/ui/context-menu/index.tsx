import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { OverlayRoot, useOverlay, type OverlayRootProps } from '@/registry/marcn/ui/overlay/overlay-root';
import { usePresence } from '@/registry/marcn/lib/use-presence';
import type { AnchorPoint } from '@/registry/marcn/lib/use-anchored-position';
import { PointContext } from '@/registry/marcn/ui/context-menu/context';

export * from '@/registry/marcn/ui/context-menu/trigger';
export * from '@/registry/marcn/ui/context-menu/content';
export * from '@/registry/marcn/ui/context-menu/aliases';

export type ContextMenuProps = OverlayRootProps;

// The point is dropped once the exit animation ends, so a later programmatic open anchors to the trigger.
function PointProvider({ children }: { children: ReactNode }) {
  const { open } = useOverlay();
  const present = usePresence(open);
  const [point, setPoint] = useState<AnchorPoint | null>(null);
  useEffect(() => {
    if (!present) setPoint(null);
  }, [present]);
  const value = useMemo(() => ({ point, setPoint }), [point]);
  return <PointContext.Provider value={value}>{children}</PointContext.Provider>;
}

export function ContextMenu({ children, ...root }: ContextMenuProps) {
  return (
    <OverlayRoot {...root}>
      <PointProvider>{children}</PointProvider>
    </OverlayRoot>
  );
}
