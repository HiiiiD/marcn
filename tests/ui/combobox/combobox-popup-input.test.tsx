import { View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/ui/portal';
import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxList, ComboboxTrigger, ComboboxValue, type ComboboxProps,
} from '@/registry/marcn/ui/combobox';

type Measure = (cb: (x: number, y: number, w: number, h: number) => void) => void;

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'date', label: 'Date' },
];

function setup(props: Partial<ComboboxProps> = {}) {
  render(
    <PortalHost>
      <Combobox {...({ items: fruits, ...props } as ComboboxProps)}>
        <ComboboxTrigger testID="trigger">
          <ComboboxValue placeholder="Select fruit" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search fruit" />
          <ComboboxEmpty>No fruit found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
    </PortalHost>,
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(View.prototype as unknown as { measureInWindow: Measure }, 'measureInWindow').mockImplementation((cb) => cb(20, 100, 260, 36));
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const search = () => screen.getByPlaceholderText('Search fruit');
const options = () => screen.queryAllByRole('option');
const settle = () => act(() => { jest.advanceTimersByTime(200); });

test('the trigger shows the placeholder, then the picked label, and opens the popup', () => {
  setup();
  expect(screen.getByText('Select fruit')).toBeOnTheScreen();
  expect(screen.getByTestId('trigger')).toBeCollapsed();
  fireEvent.press(screen.getByTestId('trigger'));
  expect(screen.getByTestId('trigger')).toBeExpanded();
  expect(options()).toHaveLength(3);
});

test('the search input sits inside the popup, starts focused, and filters', () => {
  setup();
  expect(screen.queryByPlaceholderText('Search fruit')).toBeNull();
  fireEvent.press(screen.getByTestId('trigger'));
  expect(search().props.autoFocus).toBe(true);
  fireEvent.changeText(search(), 'ban');
  expect(options()).toHaveLength(1);
  fireEvent.changeText(search(), 'zzz');
  expect(screen.getByText('No fruit found.')).toBeOnTheScreen();
});

test('picking closes the popup and shows the label on the trigger', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  fireEvent.press(screen.getByTestId('trigger'));
  fireEvent.press(screen.getByRole('option', { name: 'Banana' }));
  settle();
  expect(onValueChange).toHaveBeenCalledWith('banana');
  expect(options()).toHaveLength(0);
  expect(screen.getByText('Banana')).toBeOnTheScreen();
});

test('reopening starts with an empty search and the full list', () => {
  setup({ defaultValue: 'banana' });
  fireEvent.press(screen.getByTestId('trigger'));
  expect(search().props.value).toBe('');
  expect(options()).toHaveLength(3);
});

test('erasing the search text keeps the selected value', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: 'banana', onValueChange });
  fireEvent.press(screen.getByTestId('trigger'));
  fireEvent.changeText(search(), 'a');
  fireEvent.changeText(search(), '');
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByRole('option', { selected: true })).toHaveTextContent('Banana');
});

test('pressing the trigger again closes the popup', () => {
  setup();
  fireEvent.press(screen.getByTestId('trigger'));
  fireEvent.press(screen.getByTestId('trigger'));
  settle();
  expect(options()).toHaveLength(0);
});
