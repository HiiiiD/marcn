import { createContext, useContext, useMemo } from 'react';
import { View, type ViewProps } from 'react-native';
import { Check, Circle } from 'lucide-react-native';
import { MenuItemRow, useMenuClose, type MenuItemRowProps } from '@/registry/marcn/ui/menu/menu-item';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { Icon } from '@/registry/marcn/ui/icon';

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

export type MenuItemProps = ItemProps;

export function MenuGroup(props: ViewProps) {
  return <View {...props} />;
}

export function MenuItem({ onSelect, ...props }: MenuItemProps) {
  const select = useSelect(onSelect);
  return <MenuItemRow accessibilityRole="menuitem" onPress={select} {...props} />;
}

export type MenuCheckboxItemProps = ItemProps & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function MenuCheckboxItem({ checked = false, onCheckedChange, onSelect, accessibilityState, ...props }: MenuCheckboxItemProps) {
  const select = useSelect(onSelect, () => onCheckedChange?.(!checked));
  return (
    <MenuItemRow
      accessibilityRole="checkbox"
      accessibilityState={{ ...accessibilityState, checked }}
      indicator={checked ? <Icon icon={Check} /> : null}
      onPress={select}
      {...props}
    />
  );
}

type RadioContextValue = { value?: string; setValue: (value: string) => void };

const RadioContext = createContext<RadioContextValue | null>(null);

export type MenuRadioGroupProps = ViewProps & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export function MenuRadioGroup({ value: valueProp, defaultValue, onValueChange, ...props }: MenuRadioGroupProps) {
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

export type MenuRadioItemProps = ItemProps & { value: string };

export function MenuRadioItem({ value, onSelect, accessibilityState, ...props }: MenuRadioItemProps) {
  const group = useContext(RadioContext);
  if (!group) throw new Error('Menu radio items must be used within a radio group');
  const checked = group.value === value;
  const select = useSelect(onSelect, () => group.setValue(value));
  return (
    <MenuItemRow
      accessibilityRole="radio"
      accessibilityState={{ ...accessibilityState, checked }}
      indicator={checked ? <Icon icon={Circle} size={8} fill="currentColor" /> : null}
      onPress={select}
      {...props}
    />
  );
}
