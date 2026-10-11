import { Fragment, useContext, type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { MenuSeparator } from '@/registry/marcn/ui/menu/menu-item';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Text, type TextProps } from '@/registry/marcn/ui/text';
import { GroupContext, useCombobox } from '@/registry/marcn/ui/combobox/context';
import { ComboboxItem } from '@/registry/marcn/ui/combobox/combobox-item';
import { createListStyles } from '@/registry/marcn/ui/combobox/list-styles';
import type { ComboboxOption } from '@/registry/marcn/ui/combobox/types';

export type ComboboxGroupProps = ViewProps & { items: readonly ComboboxOption[] };

export function ComboboxGroup({ items, ...props }: ComboboxGroupProps) {
  return (
    <GroupContext.Provider value={items as ComboboxOption[]}>
      <View {...props} />
    </GroupContext.Provider>
  );
}

export function ComboboxLabel({ style, ...props }: TextProps) {
  const s = useStyles(createListStyles);
  return <Text style={[s.label, style]} {...props} />;
}

export type ComboboxCollectionProps<T = ComboboxOption> = { children?: (item: T, index: number) => ReactNode };

export function ComboboxCollection<T = ComboboxOption>({ children }: ComboboxCollectionProps<T>) {
  const items = useContext(GroupContext);
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={item.value}>{children ? children(item as T, index) : <ComboboxItem value={item.value} />}</Fragment>
      ))}
    </>
  );
}

export const ComboboxSeparator = MenuSeparator;

export function ComboboxEmpty({ style, ...props }: TextProps) {
  const s = useStyles(createListStyles);
  const { filtered } = useCombobox();
  if (filtered.length > 0) return null;
  return <Text accessibilityLiveRegion="polite" style={[s.empty, style]} {...props} />;
}
