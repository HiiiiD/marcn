import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { MenuItemRow, useMenuClose, type MenuItemRowProps } from '@/registry/marcn/ui/menu/menu-item';
import { useScrollIntoView } from '@/registry/marcn/ui/menu/menu-surface';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { Icon } from '@/registry/marcn/ui/icon';
import { useSelect } from '@/registry/marcn/ui/select/context';

export type SelectItemProps = Omit<MenuItemRowProps, 'onPress' | 'indicator' | 'indicatorSide' | 'variant' | 'children'> & {
  children?: ReactNode;
  value: string;
  label?: string;
};

export const itemLabel = ({ value, label, children }: { value: string; label?: string; children?: ReactNode }) =>
  label ?? (typeof children === 'string' ? children : value);

export function SelectItem({ value, label, children, ref, onLayout, accessibilityState, ...props }: SelectItemProps) {
  const select = useSelect();
  const close = useMenuClose();
  const scrollIntoView = useScrollIntoView();
  const rowRef = useRef<View>(null);
  const text = itemLabel({ value, label, children });
  const { registerLabels } = select;
  useLayoutEffect(() => {
    registerLabels({ [value]: text });
  }, [registerLabels, value, text]);
  const selected = value !== '' && select.value === value;
  // Once per mount: a long list opens on the chosen option instead of the top.
  const scrolled = useRef(false);
  return (
    <MenuItemRow
      ref={mergeRefs(ref, rowRef)}
      role="option"
      accessibilityState={{ ...accessibilityState, selected }}
      indicator={selected ? <Icon icon={Check} /> : null}
      indicatorSide="end"
      onLayout={(e) => {
        onLayout?.(e);
        if (selected && !scrolled.current && rowRef.current && scrollIntoView) {
          scrolled.current = true;
          scrollIntoView(rowRef.current);
        }
      }}
      onPress={() => {
        select.setValue(value);
        close();
      }}
      {...props}
    >
      {children}
    </MenuItemRow>
  );
}
