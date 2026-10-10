import { useCallback, useContext, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react-native';
import {
  MenuCloseContext, MenuItemRow, MenuLabel, MenuSeparator, MenuShortcut, useMenuClose, type MenuItemRowProps,
} from '@/registry/marcn/lib/menu-item';
import { MenuSurface, type MenuSurfaceProps } from '@/registry/marcn/lib/menu-surface';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import { OverlayRoot, OverlayTrigger, useOverlay, type OverlayRootProps } from '@/registry/marcn/lib/overlay-root';
import {
  MenuCheckboxItem, MenuGroup, MenuItem, MenuRadioGroup, MenuRadioItem,
  type MenuCheckboxItemProps, type MenuItemProps, type MenuRadioGroupProps, type MenuRadioItemProps, type MenuSelectEvent,
} from '@/registry/marcn/lib/menu-parts';
import { Icon } from '@/registry/marcn/ui/icon';

export const DropdownMenu = OverlayRoot;
export type DropdownMenuProps = OverlayRootProps;
export const DropdownMenuTrigger = OverlayTrigger;
export const DropdownMenuLabel = MenuLabel;
export const DropdownMenuSeparator = MenuSeparator;
export const DropdownMenuShortcut = MenuShortcut;

export type DropdownMenuContentProps = MenuSurfaceProps & {
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

export function DropdownMenuContent({ dismissable, initialFocusRef, ...props }: DropdownMenuContentProps) {
  return (
    <Overlay modal scrim={false} dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <MenuSurface role="menu" {...props} />
    </Overlay>
  );
}

export const DropdownMenuGroup = MenuGroup;
export const DropdownMenuItem = MenuItem;
export const DropdownMenuCheckboxItem = MenuCheckboxItem;
export const DropdownMenuRadioGroup = MenuRadioGroup;
export const DropdownMenuRadioItem = MenuRadioItem;
export type DropdownMenuItemProps = MenuItemProps;
export type DropdownMenuCheckboxItemProps = MenuCheckboxItemProps;
export type DropdownMenuRadioGroupProps = MenuRadioGroupProps;
export type DropdownMenuRadioItemProps = MenuRadioItemProps;
export type { MenuSelectEvent };

function SubClose({ closeParent, children }: { closeParent: () => void; children: ReactNode }) {
  const { setOpen } = useOverlay();
  const close = useCallback(() => {
    setOpen(false);
    closeParent();
  }, [setOpen, closeParent]);
  return <MenuCloseContext.Provider value={close}>{children}</MenuCloseContext.Provider>;
}

// closeParent is read above the sub's OverlayRoot so it resolves the parent menu, not the sub.
export function DropdownMenuSub({ children, ...root }: OverlayRootProps) {
  const closeParent = useMenuClose();
  return (
    <OverlayRoot {...root}>
      <SubClose closeParent={closeParent}>{children}</SubClose>
    </OverlayRoot>
  );
}

export type DropdownMenuSubTriggerProps = Omit<MenuItemRowProps, 'onPress' | 'indicator' | 'indicatorSide'>;

export function DropdownMenuSubTrigger(props: DropdownMenuSubTriggerProps) {
  const { open, setOpen, triggerRef } = useOverlay();
  return (
    <MenuItemRow
      ref={triggerRef}
      accessibilityRole="menuitem"
      accessibilityState={{ expanded: open }}
      indicator={<Icon icon={ChevronRight} />}
      indicatorSide="end"
      onPress={() => setOpen(true)}
      {...props}
    />
  );
}

export function DropdownMenuSubContent({ dismissable, initialFocusRef, ...props }: DropdownMenuContentProps) {
  const close = useContext(MenuCloseContext);
  return (
    <Overlay modal scrim={false} dismissable={dismissable} initialFocusRef={initialFocusRef} onBackdropPress={close ?? undefined}>
      <MenuCloseContext.Provider value={close}>
        <MenuSurface role="menu" side="right" align="start" sideOffset={0} {...props} />
      </MenuCloseContext.Provider>
    </Overlay>
  );
}
