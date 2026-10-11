import { useContext, useRef } from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { MenuItemRow, type MenuItemRowProps } from '@/registry/marcn/ui/menu/menu-item';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { Icon } from '@/registry/marcn/ui/icon';
import { ScrollContext, useCombobox } from '@/registry/marcn/ui/combobox/context';

export type ComboboxItemProps = Omit<MenuItemRowProps, 'onPress' | 'indicator' | 'indicatorSide' | 'variant'> & { value: string };

export function ComboboxItem({ value, disabled, children, ref, onLayout, accessibilityState, ...props }: ComboboxItemProps) {
  const combobox = useCombobox();
  const scrollIntoView = useContext(ScrollContext);
  const rowRef = useRef<View>(null);
  const scrolled = useRef(false);
  const selected = combobox.isSelected(value);
  const first = combobox.selected[0]?.value === value;
  return (
    <MenuItemRow
      ref={mergeRefs(ref, rowRef)}
      role="option"
      accessibilityState={{ ...accessibilityState, selected }}
      indicator={selected ? <Icon icon={Check} /> : null}
      indicatorSide="end"
      onLayout={(e) => {
        onLayout?.(e);
        // Once per mount, and only for the unfiltered list: a long list opens on the current choice.
        if (first && !scrolled.current && !combobox.query && rowRef.current && scrollIntoView) {
          scrolled.current = true;
          scrollIntoView(rowRef.current);
        }
      }}
      onPress={() => combobox.select(value)}
      disabled={disabled ?? combobox.isDisabled(value)}
      {...props}
    >
      {children ?? combobox.labelOf(value)}
    </MenuItemRow>
  );
}
