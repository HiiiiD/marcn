import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PortalHost } from '@/registry/marcn/ui/portal';
import { DataTableColumnHeader } from '@/registry/marcn/ui/data-table/data-table-column-header';
import { columnHelper, Harness } from './fixtures';

const hidden = { includeHiddenElements: true };

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const columns = columnHelper.columns([
  columnHelper.accessor('email', { header: ({ column }) => <DataTableColumnHeader column={column} title="Email" /> }),
  columnHelper.accessor('status', {
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
  }),
]);

function setup() {
  render(
    <PortalHost>
      <Harness columns={columns}>
        {(table) => (
          <>
            <Text testID="sorted">{String(table.getColumn('email')?.getIsSorted())}</Text>
            <Text testID="visible">{String(table.getColumn('email')?.getIsVisible())}</Text>
            {table.getHeaderGroups()[0].headers.map((h) => (
              <table.FlexRender key={h.id} header={h} />
            ))}
          </>
        )}
      </Harness>
    </PortalHost>,
  );
}

test('a column that cannot sort renders its title without a button', () => {
  setup();
  expect(screen.getByText('Status')).toBeOnTheScreen();
  expect(screen.getAllByRole('button')).toHaveLength(1);
});

test('the title button opens Asc, Desc and Hide', async () => {
  setup();
  fireEvent.press(screen.getByRole('button', { name: /Email/, ...hidden }));
  expect(await screen.findByText('Asc')).toBeOnTheScreen();
  expect(screen.getByText('Desc')).toBeOnTheScreen();
  expect(screen.getByText('Hide')).toBeOnTheScreen();
});

test('Asc and Desc set the sort direction', async () => {
  setup();
  expect(screen.getByTestId('sorted', hidden)).toHaveTextContent('false');
  fireEvent.press(screen.getByRole('button', { name: /Email/, ...hidden }));
  fireEvent.press(await screen.findByText('Asc'));
  act(() => { jest.advanceTimersByTime(300); });
  expect(screen.queryByText('Asc')).toBeNull();
  expect(screen.getByTestId('sorted', hidden)).toHaveTextContent('asc');
  fireEvent.press(screen.getByRole('button', { name: /Email/, ...hidden }));
  fireEvent.press(await screen.findByText('Desc'));
  expect(screen.getByTestId('sorted', hidden)).toHaveTextContent('desc');
});

test('Hide hides the column', async () => {
  setup();
  fireEvent.press(screen.getByRole('button', { name: /Email/, ...hidden }));
  fireEvent.press(await screen.findByText('Hide'));
  expect(screen.getByTestId('visible', hidden)).toHaveTextContent('false');
});
