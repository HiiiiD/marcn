import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { PortalHost } from '@/registry/marcn/ui/portal';
import { Checkbox } from '@/registry/marcn/ui/checkbox';
import { DataTablePagination } from '@/registry/marcn/ui/data-table/data-table-pagination';
import { columnHelper, Harness } from './fixtures';

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
  }),
  columnHelper.accessor('email', { header: 'Email' }),
]);

function setup() {
  render(
    <PortalHost>
      <Harness columns={columns}>
        {(table) => (
          <>
            <table.FlexRender header={table.getHeaderGroups()[0].headers[0]} />
            {table.getRowModel().rows.map((r) => (
              <table.FlexRender key={r.id} cell={r.getVisibleCells()[0]} />
            ))}
            <DataTablePagination table={table} />
          </>
        )}
      </Harness>
    </PortalHost>,
  );
}

const size = { scale: 1, fontScale: 1, height: 800 };
const width = (w: number) => Dimensions.set({ window: { ...size, width: w }, screen: { ...size, width: w } });

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  width(750);
});

test('shows selected count, rows per page and page position', () => {
  setup();
  expect(screen.getByText('0 of 12 row(s) selected.')).toBeOnTheScreen();
  expect(screen.getByText('Rows per page')).toBeOnTheScreen();
  expect(screen.getByText('10')).toBeOnTheScreen();
  expect(screen.getByText('Page 1 of 2')).toBeOnTheScreen();
});

test('next and previous move between pages and disable at the ends', () => {
  setup();
  const prev = screen.getByLabelText('Go to previous page');
  const next = screen.getByLabelText('Go to next page');
  expect(prev).toBeDisabled();
  fireEvent.press(next);
  expect(screen.getByText('Page 2 of 2')).toBeOnTheScreen();
  expect(screen.getByLabelText('Go to next page')).toBeDisabled();
  fireEvent.press(screen.getByLabelText('Go to previous page'));
  expect(screen.getByText('Page 1 of 2')).toBeOnTheScreen();
});

test('first and last buttons are hidden on narrow screens', () => {
  setup();
  expect(screen.queryByLabelText('Go to first page')).toBeNull();
  expect(screen.queryByLabelText('Go to last page')).toBeNull();
});

test('first and last buttons show and work from 1024px wide', () => {
  width(1100);
  setup();
  fireEvent.press(screen.getByLabelText('Go to last page'));
  expect(screen.getByText('Page 2 of 2')).toBeOnTheScreen();
  fireEvent.press(screen.getByLabelText('Go to first page'));
  expect(screen.getByText('Page 1 of 2')).toBeOnTheScreen();
});

test('changing rows per page repaginates', async () => {
  setup();
  fireEvent.press(screen.getByText('10'));
  fireEvent.press(await screen.findByText('20'));
  act(() => { jest.advanceTimersByTime(300); });
  expect(screen.getByText('Page 1 of 1', { includeHiddenElements: true })).toBeOnTheScreen();
});

test('selection counts rows on every page; header checkbox covers the current page', () => {
  setup();
  fireEvent.press(screen.getByLabelText('Select all'));
  expect(screen.getByText('10 of 12 row(s) selected.')).toBeOnTheScreen();
  fireEvent.press(screen.getByLabelText('Go to next page'));
  expect(screen.getByText('10 of 12 row(s) selected.')).toBeOnTheScreen();
  expect(screen.getByLabelText('Select all')).not.toBeChecked();
});
