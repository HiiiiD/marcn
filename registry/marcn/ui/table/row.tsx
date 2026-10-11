import { useContext } from 'react';
import { View, type ViewProps } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { LastRowContext, RowGroupContext } from '@/registry/marcn/ui/table/context';
import { createStyles } from '@/registry/marcn/ui/table/styles';

export type TableRowProps = ViewProps & {
  /** Highlights the row and exposes it as selected to assistive technology. */
  selected?: boolean;
};

export function TableRow({ selected = false, style, accessibilityState, ...props }: TableRowProps) {
  const s = useStyles(createStyles);
  const group = useContext(RowGroupContext);
  const last = useContext(LastRowContext);
  const bordered = group === 'header' || !last;
  return (
    <View
      role="row"
      accessibilityState={{ selected, ...accessibilityState }}
      style={[s.row, !bordered && s.rowLast, selected && s.rowSelected, style]}
      {...props}
    />
  );
}
