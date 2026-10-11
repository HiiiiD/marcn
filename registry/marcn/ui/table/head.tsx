import { View, type ViewProps } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';
import { createStyles, fixedWidth, span } from '@/registry/marcn/ui/table/styles';

export type TableHeadProps = ViewProps & { colSpan?: number };

export function TableHead({ colSpan = 1, style, children, ...props }: TableHeadProps) {
  const s = useStyles(createStyles);
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <View role="columnheader" style={[s.column, s.head, span(colSpan), fixedWidth(style), style]} {...props}>
      <TextStyleContext.Provider value={s.textMedium}>{content}</TextStyleContext.Provider>
    </View>
  );
}
