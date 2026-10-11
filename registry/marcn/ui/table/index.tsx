import { Children, isValidElement } from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { TextStyleContext } from '@/registry/marcn/ui/text';
import { TableCaption } from '@/registry/marcn/ui/table/caption';
import { createStyles } from '@/registry/marcn/ui/table/styles';

export { TableHeader } from '@/registry/marcn/ui/table/header';
export { TableBody } from '@/registry/marcn/ui/table/body';
export { TableFooter } from '@/registry/marcn/ui/table/footer';
export { TableRow, type TableRowProps } from '@/registry/marcn/ui/table/row';
export { TableHead, type TableHeadProps } from '@/registry/marcn/ui/table/head';
export { TableCell, type TableCellProps } from '@/registry/marcn/ui/table/cell';
export { TableCaption } from '@/registry/marcn/ui/table/caption';

export function Table({ style, children, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  const items = Children.toArray(children);
  const isCaption = (c: unknown) => isValidElement(c) && c.type === TableCaption;
  return (
    <ScrollView horizontal style={s.scroll} contentContainerStyle={s.scrollContent}>
      <View role="table" style={[s.table, style]} {...props}>
        <TextStyleContext.Provider value={s.text}>
          {items.filter((c) => !isCaption(c))}
          {items.filter(isCaption)}
        </TextStyleContext.Provider>
      </View>
    </ScrollView>
  );
}
