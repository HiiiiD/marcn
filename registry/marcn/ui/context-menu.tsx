import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, type Ref } from 'react';
import { Pressable, type AccessibilityActionEvent, type GestureResponderEvent, type PressableProps, type View } from 'react-native';
import { MenuLabel, MenuSeparator, MenuShortcut } from '@/registry/marcn/lib/menu-item';
import {
  MenuCheckboxItem, MenuGroup, MenuItem, MenuRadioGroup, MenuRadioItem,
  type MenuCheckboxItemProps, type MenuItemProps, type MenuRadioGroupProps, type MenuRadioItemProps, type MenuSelectEvent,
} from '@/registry/marcn/lib/menu-parts';
import { MenuSurface, type MenuSurfaceProps } from '@/registry/marcn/lib/menu-surface';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import { OverlayRoot, asText, useOverlay, type OverlayRootProps, type OverlayState } from '@/registry/marcn/lib/overlay-root';
import { mergeRefs, renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { usePresence } from '@/registry/marcn/lib/use-presence';
import type { AnchorPoint } from '@/registry/marcn/lib/use-anchored-position';

type PointContextValue = { point: AnchorPoint | null; setPoint: (point: AnchorPoint | null) => void };

const PointContext = createContext<PointContextValue | null>(null);

function usePoint() {
  const ctx = useContext(PointContext);
  if (!ctx) throw new Error('ContextMenu parts must be used within a ContextMenu');
  return ctx;
}

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

export type ContextMenuTriggerProps = PressableProps & {
  render?: RenderProp<PressableProps, OverlayState>;
  ref?: Ref<View>;
};

export function ContextMenuTrigger({ render, onLongPress, onAccessibilityAction, ref, children, ...props }: ContextMenuTriggerProps) {
  const ctx = useOverlay();
  const { setPoint } = usePoint();
  return renderElement(
    Pressable,
    render,
    {
      accessibilityState: { expanded: ctx.open },
      accessibilityActions: [{ name: 'activate', label: 'Open menu' }],
      ...props,
      children: asText(children as ReactNode),
      ref: mergeRefs(ref, ctx.triggerRef),
      onLongPress: (e: GestureResponderEvent) => {
        onLongPress?.(e);
        setPoint({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
        ctx.setOpen(true);
      },
      onAccessibilityAction: (e: AccessibilityActionEvent) => {
        onAccessibilityAction?.(e);
        if (props.disabled || e.nativeEvent.actionName !== 'activate') return;
        setPoint(null);
        ctx.setOpen(true);
      },
    } as PressableProps,
    { open: ctx.open },
  );
}

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

export const ContextMenuGroup = MenuGroup;
export const ContextMenuItem = MenuItem;
export const ContextMenuCheckboxItem = MenuCheckboxItem;
export const ContextMenuRadioGroup = MenuRadioGroup;
export const ContextMenuRadioItem = MenuRadioItem;
export const ContextMenuLabel = MenuLabel;
export const ContextMenuSeparator = MenuSeparator;
export const ContextMenuShortcut = MenuShortcut;
export type ContextMenuItemProps = MenuItemProps;
export type ContextMenuCheckboxItemProps = MenuCheckboxItemProps;
export type ContextMenuRadioGroupProps = MenuRadioGroupProps;
export type ContextMenuRadioItemProps = MenuRadioItemProps;
export type { MenuSelectEvent };
