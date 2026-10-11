import { View, type ViewProps } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Text } from '@/registry/marcn/ui/text';
import { createStyles, span } from '@/registry/marcn/ui/table/styles';

export type TableCellProps = ViewProps & { colSpan?: number };

export function TableCell({ colSpan = 1, style, children, ...props }: TableCellProps) {
  const s = useStyles(createStyles);
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <View role="cell" style={[s.column, s.cell, span(colSpan), style]} {...props}>
      {content}
    </View>
  );
}
