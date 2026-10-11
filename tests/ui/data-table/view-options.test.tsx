import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PortalHost } from '@/registry/marcn/ui/portal';
import { DataTableViewOptions } from '@/registry/marcn/ui/data-table/data-table-view-options';
import { columnHelper, Harness } from './fixtures';

const hidden = { includeHiddenElements: true };

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const columns = columnHelper.columns([
  columnHelper.display({ id: 'select', header: 'Select', enableHiding: false }),
  columnHelper.accessor('status', { header: 'Status' }),
  columnHelper.accessor('email', { header: 'Email' }),
]);

function setup() {
  render(
    <PortalHost>
      <Harness columns={columns}>
        {(table) => (
          <>
            <Text testID="status">{String(table.getColumn('status')?.getIsVisible())}</Text>
            <DataTableViewOptions table={table} />
          </>
        )}
      </Harness>
    </PortalHost>,
  );
}

const open = () => fireEvent.press(screen.getByText('View', hidden));
const settle = () => act(() => { jest.advanceTimersByTime(300); });

test('opens a Toggle columns menu', async () => {
  setup();
  open();
  expect(await screen.findByText('Toggle columns')).toBeOnTheScreen();
});

test('lists only data columns that can be hidden', async () => {
  setup();
  open();
  await screen.findByText('Toggle columns');
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  expect(screen.queryByText('select')).toBeNull();
});

test('toggling an item hides and shows the column', async () => {
  setup();
  open();
  fireEvent.press(await screen.findByText('status'));
  settle();
  expect(screen.getByTestId('status', hidden)).toHaveTextContent('false');
  open();
  fireEvent.press(await screen.findByText('status'));
  settle();
  expect(screen.getByTestId('status', hidden)).toHaveTextContent('true');
});

test('checked reflects visibility', async () => {
  setup();
  open();
  await screen.findByText('Toggle columns');
  expect(screen.getAllByRole('checkbox')[1]).toBeChecked();
  fireEvent.press(screen.getByText('email'));
  settle();
  open();
  await screen.findByText('Toggle columns');
  expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
});
