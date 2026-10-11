import { createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader, type DataTableFeatures } from '@/components/ui/data-table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export type Payment = { id: string; amount: number; status: 'pending' | 'processing' | 'success' | 'failed'; email: string };

const names = ['ken', 'abe', 'monserrat', 'silas', 'carmella'];
const statuses = ['pending', 'processing', 'success', 'failed'] as const;

export const payments: Payment[] = Array.from({ length: 25 }, (_, i) => ({
  id: `728ed52f-${i + 1}`,
  amount: 50 + ((i * 37) % 400),
  status: statuses[i % 4],
  email: `${names[i % 5]}${i + 1}@example.com`,
}));

const columnHelper = createColumnHelper<DataTableFeatures, Payment>();

export const columns = columnHelper.columns([
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('status', { header: 'Status' }),
  columnHelper.accessor('email', {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.getValue<number>('amount'));
      return <Text style={{ fontWeight: '500' }}>{formatted}</Text>;
    },
  }),
  columnHelper.display({
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" accessibilityLabel="Open menu" />}>
          <Icon icon={MoreHorizontal} size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Copy payment ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View customer</DropdownMenuItem>
          <DropdownMenuItem>View payment details</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
]);
