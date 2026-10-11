import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  flexRender, useTable,
  type ColumnDef, type ColumnFiltersState, type ColumnVisibilityState, type RowData,
  type RowSelectionState, type SortingState,
} from '@tanstack/react-table';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Input } from '@/registry/marcn/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/marcn/ui/table';
import { Text } from '@/registry/marcn/ui/text';
import { DataTablePagination } from '@/registry/marcn/ui/data-table/data-table-pagination';
import { DataTableViewOptions } from '@/registry/marcn/ui/data-table/data-table-view-options';
import { features, type DataTableFeatures } from '@/registry/marcn/ui/data-table/data-table-features';

export { DataTableColumnHeader } from '@/registry/marcn/ui/data-table/data-table-column-header';
export { DataTablePagination } from '@/registry/marcn/ui/data-table/data-table-pagination';
export { DataTableViewOptions } from '@/registry/marcn/ui/data-table/data-table-view-options';
export { features, type DataTableFeatures } from '@/registry/marcn/ui/data-table/data-table-features';

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    toolbar: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2], paddingVertical: t.spacing[4] },
    filter: { flex: 1, maxWidth: 384 },
    frame: { overflow: 'hidden', borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border },
    empty: { height: 96, alignItems: 'center' },
    pagination: { paddingVertical: t.spacing[4] },
  });

const text = (node: ReactNode) => (typeof node === 'string' || typeof node === 'number' ? <Text>{node}</Text> : node);

// flexRender wraps function renderers in an element, which hides a returned string from `text`.
function Render({ comp, props }: { comp: unknown; props: object }) {
  if (typeof comp === 'function' && !comp.prototype?.isReactComponent) return text(comp(props));
  return text(flexRender(comp as ReactNode, props));
}

const sized = (size: number | undefined) => (size === undefined ? undefined : { width: size });

export function DataTable<TData extends RowData>({ columns, data }: DataTableProps<TData>) {
  const s = useStyles(createStyles);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useTable({
    features,
    data,
    columns,
    // TanStack defaults every column to size 150; only an explicit size should fix a width.
    defaultColumn: { size: undefined },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <View>
      <View style={s.toolbar}>
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChangeText={(value) => table.getColumn('email')?.setFilterValue(value)}
          style={s.filter}
        />
        <DataTableViewOptions table={table} />
      </View>
      <View style={s.frame}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={sized(header.column.columnDef.size)}>
                    {header.isPlaceholder ? null : (
                      <Render comp={header.column.columnDef.header} props={header.getContext()} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} selected={row.getIsSelected()}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={sized(cell.column.columnDef.size)}>
                      <Render comp={cell.column.columnDef.cell} props={cell.getContext()} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} style={s.empty}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </View>
      <View style={s.pagination}>
        <DataTablePagination table={table} />
      </View>
    </View>
  );
}
