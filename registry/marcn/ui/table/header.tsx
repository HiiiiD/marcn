import { View, type ViewProps } from 'react-native';
import { RowGroup } from '@/registry/marcn/ui/table/row-group';

export function TableHeader({ children, ...props }: ViewProps) {
  return (
    <View role="rowgroup" {...props}>
      <RowGroup group="header">{children}</RowGroup>
    </View>
  );
}
