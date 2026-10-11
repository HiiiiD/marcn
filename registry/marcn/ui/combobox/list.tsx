import { Fragment, useCallback, useRef, type ReactNode, type Ref } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { isGroup } from '@/registry/marcn/ui/combobox/filter';
import { ScrollContext, useCombobox } from '@/registry/marcn/ui/combobox/context';
import { ComboboxItem } from '@/registry/marcn/ui/combobox/combobox-item';
import { createListStyles } from '@/registry/marcn/ui/combobox/list-styles';
import { ComboboxCollection, ComboboxGroup, ComboboxLabel, ComboboxSeparator } from '@/registry/marcn/ui/combobox/parts';
import type { ComboboxOption, ComboboxOptionGroup } from '@/registry/marcn/ui/combobox/types';

export type ComboboxListProps<T = ComboboxOption> = Omit<ScrollViewProps, 'children'> & {
  children?: (row: T, index: number) => ReactNode;
  ref?: Ref<ScrollView>;
};

export function ComboboxList<T = ComboboxOption>({ children, style, contentContainerStyle, ref, ...props }: ComboboxListProps<T>) {
  const s = useStyles(createListStyles);
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
