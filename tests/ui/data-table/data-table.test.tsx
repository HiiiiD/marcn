import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, type ViewStyle } from 'react-native';
import type { ReactTestInstance, ReactTestRendererJSON } from 'react-test-renderer';
import { PortalHost } from '@/registry/marcn/ui/portal';
import { Checkbox } from '@/registry/marcn/ui/checkbox';
import { Text } from '@/registry/marcn/ui/text';
import { DataTable, DataTableColumnHeader } from '@/registry/marcn/ui/data-table';
import { columnHelper, payments } from './fixtures';

const hidden = { includeHiddenElements: true };

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const settle = () => act(() => { jest.advanceTimersByTime(300); });

const columns = columnHelper.columns([
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('status', { header: 'Status' }),
  columnHelper.accessor('email', { header: ({ column }) => <DataTableColumnHeader column={column} title="Email" /> }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: ({ row }) => <Text>${row.getValue<number>('amount')}.00</Text>,
  }),
]);

const setup = (data = payments) =>
  render(
    <PortalHost>
      <DataTable columns={columns} data={data} />
    </PortalHost>,
  );

test('renders string headers, default cells and custom cells', () => {
  setup();
  expect(screen.getByText('Status')).toBeOnTheScreen();
  expect(screen.getAllByText('pending').length).toBeGreaterThan(0);
  expect(screen.getByText('user1@example.com')).toBeOnTheScreen();
  expect(screen.getByText('$10.00')).toBeOnTheScreen();
});

test('shows the first 10 of 12 rows', () => {
  setup();
  expect(screen.getAllByLabelText('Select row')).toHaveLength(10);
  expect(screen.queryByText('user11@example.com')).toBeNull();
});

test('empty data shows a single No results row spanning every column', () => {
  setup([]);
  const spans = (node: ReactTestInstance) => (StyleSheet.flatten(node.props.style) as ViewStyle | undefined)?.flexGrow === 4;
  let node: ReactTestInstance | null = screen.getByText('No results.');
  while (node && !spans(node)) node = node.parent;
  expect(node).not.toBeNull();
});

test('the email filter narrows rows and updates the count', () => {
  setup();
  fireEvent.changeText(screen.getByPlaceholderText('Filter emails...'), 'user3@');
  expect(screen.getByText('user3@example.com')).toBeOnTheScreen();
  expect(screen.queryByText('user1@example.com')).toBeNull();
  expect(screen.getByText('0 of 1 row(s) selected.')).toBeOnTheScreen();
});

test('a filter with no match shows No results', () => {
  setup();
  fireEvent.changeText(screen.getByPlaceholderText('Filter emails...'), 'nobody');
  expect(screen.getByText('No results.')).toBeOnTheScreen();
});

test('selecting a row marks it selected and counts it', () => {
  setup();
  fireEvent.press(screen.getAllByLabelText('Select row')[0]);
  expect(screen.getByText('1 of 12 row(s) selected.')).toBeOnTheScreen();
  expect(screen.getAllByLabelText('Select row')[0]).toBeChecked();
});

test('select all selects the current page and shows a partial state after one row', () => {
  setup();
  fireEvent.press(screen.getAllByLabelText('Select row')[0]);
  expect(screen.getByLabelText('Select all')).toBePartiallyChecked();
  fireEvent.press(screen.getByLabelText('Select all'));
  expect(screen.getByText('10 of 12 row(s) selected.')).toBeOnTheScreen();
});

test('the View menu hides a column', async () => {
  setup();
  fireEvent.press(screen.getByText('View'));
  fireEvent.press(await screen.findByText('status'));
  settle();
  expect(screen.queryByText('Status', hidden)).toBeNull();
});

test('sorting by email descending reorders rows', async () => {
  setup();
  fireEvent.press(screen.getByRole('button', { name: /Email/ }));
  fireEvent.press(await screen.findByText('Desc'));
  settle();
  expect(screen.getAllByLabelText('Select row')).toHaveLength(10);
  expect(screen.getByText('user9@example.com')).toBeOnTheScreen();
  expect(screen.queryByText('user1@example.com')).toBeNull();
});

test('paginates to the second page', () => {
  setup();
  fireEvent.press(screen.getByLabelText('Go to next page'));
  expect(screen.getByText('user11@example.com')).toBeOnTheScreen();
  expect(screen.getAllByLabelText('Select row')).toHaveLength(2);
});

test('selection survives paging and counts every page', () => {
  setup();
  fireEvent.press(screen.getAllByLabelText('Select row')[0]);
  fireEvent.press(screen.getByLabelText('Go to next page'));
  expect(screen.getByText('1 of 12 row(s) selected.')).toBeOnTheScreen();
  expect(screen.getByLabelText('Select all')).not.toBeChecked();
});

const rawStrings = (node: ReactTestRendererJSON | ReactTestRendererJSON[] | null): string[] => {
  const nodes = Array.isArray(node) ? node : node ? [node] : [];
  return nodes.flatMap((n) =>
    (n.children ?? []).flatMap((c) => (typeof c === 'string' ? (n.type === 'Text' ? [] : [`${n.type}:${c}`]) : rawStrings(c))),
  );
};

test('function headers and cells that return strings are wrapped in Text', () => {
  const bare = columnHelper.columns([
    columnHelper.accessor('email', {}),
    columnHelper.accessor('status', { header: () => 'State', cell: (info) => info.getValue() }),
  ]);
  render(<PortalHost><DataTable columns={bare} data={payments} /></PortalHost>);
  expect(screen.getByText('State')).toBeOnTheScreen();
  expect(screen.getByText('user1@example.com')).toBeOnTheScreen();
  expect(rawStrings(screen.toJSON() as ReactTestRendererJSON[])).toEqual([]);
});

test('a column with an explicit size is a fixed-width column', () => {
  const sized = columnHelper.columns([
    columnHelper.accessor('status', { header: 'Status', size: 60 }),
    columnHelper.accessor('email', { header: 'Email' }),
  ]);
  render(<PortalHost><DataTable columns={sized} data={payments} /></PortalHost>);
  const widthOf = (node: ReactTestInstance | null) => {
    while (node && (StyleSheet.flatten(node.props.style) as ViewStyle | undefined)?.width !== 60) node = node.parent;
    return node;
  };
  expect(widthOf(screen.getAllByText('pending')[0])).toHaveStyle({ width: 60, flexGrow: 0, minWidth: 60 });
  expect(widthOf(screen.getByText('Status'))).toHaveStyle({ width: 60, flexGrow: 0 });
});

test('columns without a size keep sharing the width', () => {
  setup();
  let node: ReactTestInstance | null = screen.getByText('user1@example.com');
  while (node && (StyleSheet.flatten(node.props.style) as ViewStyle | undefined)?.flexGrow === undefined) node = node.parent;
  expect(node).toHaveStyle({ flexGrow: 1, width: 0 });
});
