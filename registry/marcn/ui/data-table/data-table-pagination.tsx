import { StyleSheet, useWindowDimensions, View } from 'react-native';
import type { ReactTable, RowData } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react-native';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Button } from '@/registry/marcn/ui/button';
import { Icon } from '@/registry/marcn/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/marcn/ui/select';
import { Text } from '@/registry/marcn/ui/text';
import type { DataTableFeatures } from '@/registry/marcn/ui/data-table/data-table-features';

const LG = 1024;
const PAGE_SIZES = [10, 20, 25, 30, 40, 50];

const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.spacing[4],
      paddingHorizontal: t.spacing[2],
    },
    selected: { flexGrow: 1, color: t.colors.mutedForeground, fontSize: t.fontSize.sm },
    controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing[6] },
    group: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
    label: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium },
    select: { height: 32, width: 70 },
    page: { minWidth: 100, alignItems: 'center' },
    icon: { width: 32, height: 32 },
  });

export function DataTablePagination<TData extends RowData>({ table }: { table: ReactTable<DataTableFeatures, TData> }) {
  const s = useStyles(createStyles);
  const wide = useWindowDimensions().width >= LG;
  const { pageIndex, pageSize } = table.state.pagination;
  return (
    <View style={s.root}>
      <Text style={s.selected}>
        {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
      </Text>
      <View style={s.controls}>
        <View style={s.group}>
          <Text style={s.label}>Rows per page</Text>
          <Select value={`${pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
            <SelectTrigger size="sm" style={s.select}>
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </View>
        <View style={s.page}>
          <Text style={s.label}>
            Page {pageIndex + 1} of {table.getPageCount()}
          </Text>
        </View>
        <View style={s.group}>
          {wide && (
            <Button
              variant="outline"
              size="icon"
              style={s.icon}
              accessibilityLabel="Go to first page"
              onPress={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <Icon icon={ChevronsLeft} size={16} />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            style={s.icon}
            accessibilityLabel="Go to previous page"
            onPress={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <Icon icon={ChevronLeft} size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            style={s.icon}
            accessibilityLabel="Go to next page"
            onPress={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <Icon icon={ChevronRight} size={16} />
          </Button>
          {wide && (
            <Button
              variant="outline"
              size="icon"
              style={s.icon}
              accessibilityLabel="Go to last page"
              onPress={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <Icon icon={ChevronsRight} size={16} />
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}
