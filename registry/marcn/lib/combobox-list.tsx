import { createContext, Fragment, useCallback, useContext, useRef, type ReactNode, type Ref } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { Check } from 'lucide-react-native';
import { isGroup, type ComboboxOptionGroup, type ComboboxOption } from '@/registry/marcn/lib/combobox-filter';
import { useCombobox } from '@/registry/marcn/lib/combobox-state';
import { MenuItemRow, MenuSeparator, type MenuItemRowProps } from '@/registry/marcn/lib/menu-item';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

const createStyles = (t: Theme) =>
  StyleSheet.create({
    list: { flexGrow: 0, flexShrink: 1, maxHeight: 300 },
    listContent: { padding: t.spacing[1] },
    empty: { paddingVertical: t.spacing[6], textAlign: 'center', fontSize: t.fontSize.sm },
    label: { paddingHorizontal: t.spacing[2], paddingVertical: t.spacing[1], fontSize: t.fontSize.xs, color: t.colors.mutedForeground },
  });

const ScrollContext = createContext<((node: View) => void) | null>(null);
const GroupContext = createContext<ComboboxOption[]>([]);

export type ComboboxListProps<T = ComboboxOption> = Omit<ScrollViewProps, 'children'> & {
  children?: (row: T, index: number) => ReactNode;
  ref?: Ref<ScrollView>;
};

export function ComboboxList<T = ComboboxOption>({ children, style, contentContainerStyle, ref, ...props }: ComboboxListProps<T>) {
  const s = useStyles(createStyles);
  const { rows, filtered } = useCombobox();
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);

  const scrollIntoView = useCallback((node: View) => {
    const content = contentRef.current;
    if (!content) return;
    node.measureLayout(content, (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: false }), () => {});
  }, []);

  if (filtered.length === 0) return null;
  return (
    <ScrollView
      ref={mergeRefs(ref, scrollRef)}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      bounces={false}
      style={[s.list, style]}
      contentContainerStyle={[s.listContent, contentContainerStyle]}
      {...props}
    >
      <View ref={contentRef} collapsable={false}>
        <ScrollContext.Provider value={scrollIntoView}>
          {rows.map((row, index) => (
            <Fragment key={isGroup(row) ? `group:${row.value}` : row.value}>
              {children ? children(row as T, index) : isGroup(row) ? <DefaultGroup group={row} first={index === 0} /> : <ComboboxItem value={row.value} />}
            </Fragment>
          ))}
        </ScrollContext.Provider>
      </View>
    </ScrollView>
  );
}

function DefaultGroup({ group, first }: { group: ComboboxOptionGroup; first: boolean }) {
  return (
    <>
      {first ? null : <ComboboxSeparator />}
      <ComboboxGroup items={group.items}>
        <ComboboxLabel>{group.value}</ComboboxLabel>
        <ComboboxCollection />
      </ComboboxGroup>
    </>
  );
}

export type ComboboxGroupProps = ViewProps & { items: readonly ComboboxOption[] };

export function ComboboxGroup({ items, ...props }: ComboboxGroupProps) {
  return (
    <GroupContext.Provider value={items as ComboboxOption[]}>
      <View {...props} />
    </GroupContext.Provider>
  );
}

export function ComboboxLabel({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
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

export function ComboboxEmpty({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  const { filtered } = useCombobox();
  if (filtered.length > 0) return null;
  return <Text accessibilityLiveRegion="polite" style={[s.empty, style]} {...props} />;
}
