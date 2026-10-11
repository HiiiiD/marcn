import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { Column, RowData } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react-native';
import { Button } from '@/registry/marcn/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/registry/marcn/ui/dropdown-menu';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text } from '@/registry/marcn/ui/text';
import type { DataTableFeatures } from '@/registry/marcn/ui/data-table/data-table-features';

type DataTableColumnHeaderProps<TData extends RowData, TValue> = {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
  style?: StyleProp<ViewStyle>;
};

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trigger: { marginStart: -12, height: 32 },
});

const trigger = <Button variant="ghost" size="sm" style={styles.trigger} />;

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  style,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <View style={style}>
        <Text>{title}</Text>
      </View>
    );
  }

  const sorted = column.getIsSorted();
  return (
    <View style={[styles.root, style]}>
      <DropdownMenu>
        <DropdownMenuTrigger render={trigger}>
          <Text>{title}</Text>
          <Icon icon={sorted === 'desc' ? ArrowDown : sorted === 'asc' ? ArrowUp : ChevronsUpDown} size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => column.toggleSorting(false)}>
            <Icon icon={ArrowUp} size={16} />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => column.toggleSorting(true)}>
            <Icon icon={ArrowDown} size={16} />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => column.toggleVisibility(false)}>
            <Icon icon={EyeOff} size={16} />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
}
