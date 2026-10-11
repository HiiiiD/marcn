import { MenuSurface, type MenuSurfaceProps } from '@/registry/marcn/ui/menu/menu-surface';
import { Overlay, type OverlayProps } from '@/registry/marcn/ui/overlay';
import { usePoint } from '@/registry/marcn/ui/context-menu/context';

export type ContextMenuContentProps = MenuSurfaceProps & {
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

export function ContextMenuContent({ dismissable, initialFocusRef, ...props }: ContextMenuContentProps) {
  const { point } = usePoint();
  return (
    <Overlay modal scrim={false} dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <MenuSurface role="menu" align="start" sideOffset={0} anchorPoint={point} {...props} />
    </Overlay>
  );
}
