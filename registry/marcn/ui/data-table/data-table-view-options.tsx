import { StyleSheet } from 'react-native';
import type { ReactTable, RowData } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react-native';
import { Button } from '@/registry/marcn/ui/button';
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/marcn/ui/dropdown-menu';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text } from '@/registry/marcn/ui/text';
import type { DataTableFeatures } from '@/registry/marcn/ui/data-table/data-table-features';

const styles = StyleSheet.create({
  trigger: { marginStart: 'auto', height: 32 },
  capitalize: { textTransform: 'capitalize' },
});

const trigger = <Button variant="outline" size="sm" style={styles.trigger} />;

export function DataTableViewOptions<TData extends RowData>({ table }: { table: ReactTable<DataTableFeatures, TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger}>
        <Icon icon={Settings2} size={16} />
        <Text>View</Text>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              <Text style={styles.capitalize}>{column.id}</Text>
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
