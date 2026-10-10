import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { Check, ChevronRight, Circle } from 'lucide-react-native';
import {
  MenuCloseContext, MenuItemRow, MenuLabel, MenuSeparator, MenuShortcut, useMenuClose, type MenuItemRowProps,
} from '@/registry/marcn/lib/menu-item';
import { MenuSurface, type MenuSurfaceProps } from '@/registry/marcn/lib/menu-surface';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import { OverlayRoot, OverlayTrigger, useOverlay, type OverlayRootProps } from '@/registry/marcn/lib/overlay-root';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { Icon } from '@/registry/marcn/ui/icon';

export const DropdownMenu = OverlayRoot;
export type DropdownMenuProps = OverlayRootProps;
export const DropdownMenuTrigger = OverlayTrigger;
export const DropdownMenuLabel = MenuLabel;
export const DropdownMenuSeparator = MenuSeparator;
export const DropdownMenuShortcut = MenuShortcut;

export function DropdownMenuGroup(props: ViewProps) {
  return <View {...props} />;
}

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

export type MenuSelectEvent = { defaultPrevented: boolean; preventDefault: () => void };

function selectEvent(): MenuSelectEvent {
  const event = {
    defaultPrevented: false,
    preventDefault() {
      event.defaultPrevented = true;
    },
  };
  return event;
}

function useSelect(onSelect?: (event: MenuSelectEvent) => void, before?: () => void) {
  const close = useMenuClose();
  return () => {
    before?.();
    const event = selectEvent();
    onSelect?.(event);
    if (!event.defaultPrevented) close();
  };
}

type ItemProps = Omit<MenuItemRowProps, 'onPress' | 'indicator' | 'indicatorSide'> & {
  onSelect?: (event: MenuSelectEvent) => void;
};

export type DropdownMenuItemProps = ItemProps;

export function DropdownMenuItem({ onSelect, ...props }: DropdownMenuItemProps) {
  const select = useSelect(onSelect);
  return <MenuItemRow accessibilityRole="menuitem" onPress={select} {...props} />;
}

export type DropdownMenuCheckboxItemProps = ItemProps & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function DropdownMenuCheckboxItem({ checked = false, onCheckedChange, onSelect, ...props }: DropdownMenuCheckboxItemProps) {
  const select = useSelect(onSelect, () => onCheckedChange?.(!checked));
  return (
    <MenuItemRow
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      indicator={checked ? <Icon icon={Check} /> : null}
      onPress={select}
      {...props}
    />
  );
}

type RadioContextValue = { value?: string; setValue: (value: string) => void };

const RadioContext = createContext<RadioContextValue | null>(null);

export type DropdownMenuRadioGroupProps = ViewProps & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export function DropdownMenuRadioGroup({ value: valueProp, defaultValue, onValueChange, ...props }: DropdownMenuRadioGroupProps) {
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  const ctx = useMemo(() => ({ value, setValue: (next: string) => setValue(next) }), [value, setValue]);
  return (
    <RadioContext.Provider value={ctx}>
      <View accessibilityRole="radiogroup" {...props} />
    </RadioContext.Provider>
  );
}

export type DropdownMenuRadioItemProps = ItemProps & { value: string };

export function DropdownMenuRadioItem({ value, onSelect, ...props }: DropdownMenuRadioItemProps) {
  const group = useContext(RadioContext);
  if (!group) throw new Error('DropdownMenuRadioItem must be used within a DropdownMenuRadioGroup');
  const checked = group.value === value;
  const select = useSelect(onSelect, () => group.setValue(value));
  return (
    <MenuItemRow
      accessibilityRole="radio"
      accessibilityState={{ checked }}
      indicator={checked ? <Icon icon={Circle} size={8} fill="currentColor" /> : null}
      onPress={select}
      {...props}
    />
  );
}

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
    <Overlay modal scrim={false} dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <MenuCloseContext.Provider value={close}>
        <MenuSurface role="menu" side="right" align="start" sideOffset={0} {...props} />
      </MenuCloseContext.Provider>
    </Overlay>
  );
}
