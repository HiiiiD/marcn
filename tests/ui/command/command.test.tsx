import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Command, CommandEmpty, CommandItem, CommandList } from '@/registry/marcn/ui/command';
import { setup, type as typeText } from './fixture';

test('shows every item and no empty state with an empty search', () => {
  setup();
  expect(screen.getAllByRole('menuitem')).toHaveLength(5);
  expect(screen.queryByText('No results.')).toBeNull();
  expect(screen.getByText('Suggestions')).toBeOnTheScreen();
});

test('typing filters items, ignoring case and accents', () => {
  setup();
  typeText('CALEN');
  expect(screen.getByText('Calendar')).toBeOnTheScreen();
  expect(screen.queryByText('Search Emoji')).toBeNull();
  expect(screen.queryByText('Billing')).toBeNull();
});

test('keywords and nested text both match', () => {
  setup();
  typeText('account');
  expect(screen.getAllByRole('menuitem')).toHaveLength(1);
  typeText('profile');
  expect(screen.getAllByRole('menuitem')).toHaveLength(1);
});

test('shows the empty state when nothing matches and hides it again', () => {
  setup();
  typeText('zzzz');
  expect(screen.getByText('No results.')).toBeOnTheScreen();
  expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
  typeText('');
  expect(screen.queryByText('No results.')).toBeNull();
});

test('a group with no visible item disappears; separators hide while searching', () => {
  setup();
  expect(screen.getByTestId('separator', { includeHiddenElements: true })).toBeOnTheScreen();
  typeText('billing');
  expect(screen.queryByText('Suggestions')).toBeNull();
  expect(screen.getByText('Settings')).toBeOnTheScreen();
  expect(screen.queryByTestId('separator', { includeHiddenElements: true })).toBeNull();
});

test('pressing an item calls onSelect with its value or text', () => {
  const onSelect = setup();
  fireEvent.press(screen.getByText('Calendar'));
  expect(onSelect).toHaveBeenLastCalledWith('Calendar');
  fireEvent.press(screen.getByText('Profile'));
  expect(onSelect).toHaveBeenLastCalledWith('profile');
});

test('a disabled item stays visible, dimmed, and does not select', () => {
  const onSelect = setup();
  fireEvent.press(screen.getByText('Calculator'));
  expect(onSelect).not.toHaveBeenCalled();
  expect(screen.getByRole('menuitem', { name: 'Calculator' })).toBeDisabled();
});

test('shouldFilter={false} shows everything for any search', () => {
  setup({ shouldFilter: false });
  typeText('zzzz');
  expect(screen.getAllByRole('menuitem')).toHaveLength(5);
  expect(screen.queryByText('No results.')).toBeNull();
});

test('a custom filter decides visibility', () => {
  setup({ filter: (value) => (value === 'Billing' ? 1 : 0) });
  typeText('anything');
  expect(screen.getAllByRole('menuitem')).toHaveLength(1);
  expect(screen.getByText('Billing')).toBeOnTheScreen();
});

test('a controlled search drives the filter', () => {
  const tree = (value: string) => (
    <Command value={value}>
      <CommandList><CommandItem>Billing</CommandItem><CommandItem>Calendar</CommandItem></CommandList>
    </Command>
  );
  const { rerender } = render(tree('bill'));
  expect(screen.queryByText('Calendar')).toBeNull();
  rerender(tree(''));
  expect(screen.getByText('Calendar')).toBeOnTheScreen();
});

test('uncontrolled defaultValue starts filtered', () => {
  render(
    <Command defaultValue="bill">
      <CommandList><CommandItem>Billing</CommandItem><CommandItem>Calendar</CommandItem></CommandList>
    </Command>,
  );
  expect(screen.queryByText('Calendar')).toBeNull();
});

test('an item with element children and no value does not crash and matches its nested text', () => {
  render(
    <Command defaultValue="nested">
      <CommandList>
        <CommandItem><Text>Nested label</Text></CommandItem>
        <CommandItem>Other</CommandItem>
      </CommandList>
    </Command>,
  );
  expect(screen.getAllByRole('menuitem')).toHaveLength(1);
});

test('parts outside a Command throw a clear error', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<CommandEmpty>x</CommandEmpty>)).toThrow('Command parts must be used within a Command');
});
