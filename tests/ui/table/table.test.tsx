import { render, screen } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { lightColors, darkColors } from '@/registry/marcn/lib/theme';
import { Text } from '@/registry/marcn/ui/text';
import {
  Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '@/registry/marcn/ui/table';

function invoices() {
  return (
    <Table testID="table">
      <TableCaption testID="cap">A list of invoices.</TableCaption>
      <TableHeader testID="header">
        <TableRow testID="head-row">
          <TableHead testID="head">Invoice</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody testID="body">
        <TableRow testID="row-1">
          <TableCell testID="cell">INV001</TableCell>
          <TableCell>Paid</TableCell>
        </TableRow>
        <TableRow testID="row-2">
          <TableCell>INV002</TableCell>
          <TableCell>Pending</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter testID="footer">
        <TableRow testID="foot-row">
          <TableCell colSpan={2} testID="total">Total</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

test('sets table roles', () => {
  render(invoices());
  expect(screen.getByTestId('table').props.role).toBe('table');
  expect(screen.getByTestId('header').props.role).toBe('rowgroup');
  expect(screen.getByTestId('body').props.role).toBe('rowgroup');
  expect(screen.getByTestId('footer').props.role).toBe('rowgroup');
  expect(screen.getByTestId('row-1').props.role).toBe('row');
  expect(screen.getByTestId('head').props.role).toBe('columnheader');
  expect(screen.getByTestId('cell').props.role).toBe('cell');
});

test('wraps in a horizontal ScrollView', () => {
  render(invoices());
  expect(screen.UNSAFE_getByType(ScrollView).props.horizontal).toBe(true);
});

test('wraps string children in Text at 14px; heads and footer are medium weight', () => {
  render(invoices());
  expect(screen.getByText('INV001')).toHaveStyle({ fontSize: 14 });
  expect(screen.getByText('Invoice')).toHaveStyle({ fontSize: 14, fontWeight: '500' });
  expect(screen.getByText('Total')).toHaveStyle({ fontWeight: '500' });
});

test('lets nested Text inherit the table text style', () => {
  render(<Table><TableBody><TableRow><TableCell><Text>x</Text></TableCell></TableRow></TableBody></Table>);
  expect(screen.getByText('x')).toHaveStyle({ fontSize: 14 });
});

test('borders: header rows and non-last body rows have one, last body and footer rows do not', () => {
  render(invoices());
  expect(screen.getByTestId('head-row')).toHaveStyle({ borderBottomWidth: 1, borderBottomColor: lightColors.border });
  expect(screen.getByTestId('row-1')).toHaveStyle({ borderBottomWidth: 1 });
  expect(screen.getByTestId('row-2')).toHaveStyle({ borderBottomWidth: 0 });
  expect(screen.getByTestId('foot-row')).toHaveStyle({ borderBottomWidth: 0 });
  expect(screen.getByTestId('footer')).toHaveStyle({ borderTopWidth: 1, borderTopColor: lightColors.border });
});

test('ignores falsy children when finding the last body row', () => {
  render(
    <Table>
      <TableBody>
        <TableRow testID="a"><TableCell>a</TableCell></TableRow>
        <TableRow testID="b"><TableCell>b</TableCell></TableRow>
        {false}
        {null}
      </TableBody>
    </Table>,
  );
  expect(screen.getByTestId('a')).toHaveStyle({ borderBottomWidth: 1 });
  expect(screen.getByTestId('b')).toHaveStyle({ borderBottomWidth: 0 });
});

test('a lone body row has no bottom border', () => {
  render(<Table><TableBody><TableRow testID="only"><TableCell>x</TableCell></TableRow></TableBody></Table>);
  expect(screen.getByTestId('only')).toHaveStyle({ borderBottomWidth: 0 });
});

test('selected row is muted and exposes selected state', () => {
  render(<Table><TableBody><TableRow testID="r" selected><TableCell>x</TableCell></TableRow></TableBody></Table>);
  expect(screen.getByTestId('r')).toHaveStyle({ backgroundColor: lightColors.muted });
  expect(screen.getByTestId('r').props.accessibilityState).toEqual({ selected: true });
});

test('unselected row exposes selected: false', () => {
  render(<Table><TableBody><TableRow testID="r"><TableCell>x</TableCell></TableRow></TableBody></Table>);
  expect(screen.getByTestId('r').props.accessibilityState).toEqual({ selected: false });
});

test('footer is muted at half strength', () => {
  render(invoices());
  expect(screen.getByTestId('footer')).toHaveStyle({ backgroundColor: `${lightColors.muted}80` });
});

test('renders the caption after the other parts', () => {
  render(invoices());
  const order = screen.getAllByTestId(/^(cap|header|body|footer)$/).map((n) => n.props.testID);
  expect(order).toEqual(['header', 'body', 'footer', 'cap']);
});

test('caption is muted with a top margin', () => {
  render(invoices());
  expect(screen.getByTestId('cap')).toHaveStyle({ marginTop: 16, fontSize: 14, color: lightColors.mutedForeground });
});

test('default columns share space; colSpan scales flex and min width', () => {
  render(invoices());
  expect(screen.getByTestId('cell')).toHaveStyle({ flexGrow: 1, width: 0, minWidth: 96, padding: 8 });
  expect(screen.getByTestId('head')).toHaveStyle({ flexGrow: 1, width: 0, minWidth: 96, height: 40, paddingHorizontal: 8 });
  expect(screen.getByTestId('total')).toHaveStyle({ flexGrow: 2, minWidth: 192 });
});

test('merges caller style last and spreads props', () => {
  render(
    <Table>
      <TableBody>
        <TableRow>
          <TableCell testID="c" style={{ width: 100, flexGrow: 0 }} accessibilityLabel="amount">x</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  expect(screen.getByTestId('c')).toHaveStyle({ width: 100, flexGrow: 0 });
  expect(screen.getByTestId('c').props.accessibilityLabel).toBe('amount');
});

test('reads colors from the active scheme', () => {
  (require('react-native/Libraries/Utilities/useColorScheme').default as jest.Mock).mockReturnValue('dark');
  render(<Table><TableBody><TableRow testID="r" selected><TableCell>x</TableCell></TableRow></TableBody></Table>);
  expect(screen.getByTestId('r')).toHaveStyle({ backgroundColor: darkColors.muted });
});
