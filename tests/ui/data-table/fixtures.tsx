import { useState, type ReactNode } from 'react';
import {
  createColumnHelper, useTable,
  type ColumnDef, type ColumnFiltersState, type ColumnVisibilityState, type ReactTable,
  type RowSelectionState, type SortingState,
} from '@tanstack/react-table';
import { features, type DataTableFeatures } from '@/registry/marcn/ui/data-table/data-table-features';

export type Payment = { id: string; amount: number; status: 'pending' | 'processing' | 'success' | 'failed'; email: string };

const statuses = ['pending', 'processing', 'success', 'failed'] as const;

export const payments: Payment[] = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i + 1}`,
  amount: (i + 1) * 10,
  status: statuses[i % 4],
  email: `user${i + 1}@example.com`,
}));

export const columnHelper = createColumnHelper<DataTableFeatures, Payment>();

type HarnessProps = {
  columns: ColumnDef<DataTableFeatures, Payment>[];
  data?: Payment[];
  children: (table: ReactTable<DataTableFeatures, Payment>) => ReactNode;
};

export function Harness({ columns, data = payments, children }: HarnessProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });
  return <>{children(table)}</>;
}
