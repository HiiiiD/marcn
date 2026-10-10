import { Text, TextInput, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/lib/portal';
import {
  Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxCollection, ComboboxContent, ComboboxEmpty, ComboboxGroup,
  ComboboxItem, ComboboxLabel, ComboboxList, ComboboxSeparator, ComboboxValue, type ComboboxOptionGroup, type ComboboxProps,
} from '@/registry/marcn/ui/combobox';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

function setup(props: Partial<ComboboxProps> = {}) {
  render(
    <PortalHost>
      <Combobox {...({ items: fruits, multiple: true, ...props } as ComboboxProps)}>
        <ComboboxChips testID="chips">
          <ComboboxValue>
            {(selected) => selected.map((o) => <ComboboxChip key={o.value} value={o.value} />)}
          </ComboboxValue>
          <ComboboxChipsInput placeholder="Add fruit" />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty>No fruit found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
    </PortalHost>,
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  jest
    .spyOn(View.prototype as unknown as { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void }, 'measureInWindow')
    .mockImplementation((cb) => cb(10, 100, 280, 40));
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const input = () => screen.getByPlaceholderText('Add fruit');
const options = () => screen.queryAllByRole('option');
const settle = () => act(() => { jest.advanceTimersByTime(200); });

test('renders a chip per selected value next to the input', () => {
  setup({ defaultValue: ['date', 'apple'] });
  expect(screen.getByText('Date')).toBeOnTheScreen();
  expect(screen.getByText('Apple')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Remove Date' })).toBeOnTheScreen();
});

test('typing in the chips input opens the filtered list', () => {
  setup();
  fireEvent.changeText(input(), 'an');
  expect(options()).toHaveLength(1);
  expect(screen.getByRole('option')).toHaveTextContent('Banana');
});

test('picking adds a chip, clears the typed text and keeps the popup open', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  fireEvent.changeText(input(), 'dat');
  fireEvent.press(screen.getByRole('option', { name: 'Date' }));
  expect(onValueChange).toHaveBeenLastCalledWith(['date']);
  expect(input().props.value).toBe('');
  expect(options()).toHaveLength(4);
  expect(screen.getByRole('button', { name: 'Remove Date' })).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('option', { name: 'Apple' }));
  expect(onValueChange).toHaveBeenLastCalledWith(['date', 'apple']);
  expect(screen.getAllByRole('option', { selected: true })).toHaveLength(2);
});

test('picking a selected option again removes it', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: ['apple'], onValueChange });
  fireEvent(input(), 'focus');
  fireEvent.press(screen.getByRole('option', { name: 'Apple' }));
  expect(onValueChange).toHaveBeenLastCalledWith([]);
});

test('a chip accepts number children', () => {
  render(
    <PortalHost>
      <Combobox items={fruits} multiple defaultValue={['apple']}>
        <ComboboxChips><ComboboxChip value="apple">{3}</ComboboxChip></ComboboxChips>
      </Combobox>
    </PortalHost>,
  );
  expect(screen.getByText('3')).toBeOnTheScreen();
});

test('the remove button drops that chip', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: ['apple', 'date'], onValueChange });
  fireEvent.press(screen.getByRole('button', { name: 'Remove Apple' }));
  expect(onValueChange).toHaveBeenCalledWith(['date']);
  expect(screen.queryByRole('button', { name: 'Remove Apple' })).toBeNull();
});

test('Backspace on an empty input removes the last chip, with text it does not', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: ['apple', 'date'], onValueChange });
  fireEvent.changeText(input(), 'x');
  fireEvent(input(), 'keyPress', { nativeEvent: { key: 'Backspace' } });
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.changeText(input(), '');
  fireEvent(input(), 'keyPress', { nativeEvent: { key: 'Backspace' } });
  expect(onValueChange).toHaveBeenCalledWith(['apple']);
});

test('Enter picks the first match', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  fireEvent.changeText(input(), 'ban');
  fireEvent(input(), 'submitEditing');
  expect(onValueChange).toHaveBeenCalledWith(['banana']);
});

test('tapping the chips box focuses the input', () => {
  setup();
  const focus = jest.spyOn(TextInput.prototype as unknown as { focus: () => void }, 'focus').mockImplementation(() => {});
  fireEvent.press(screen.getByTestId('chips'));
  expect(focus).toHaveBeenCalled();
});

test('a disabled combobox has no remove buttons and a read-only input', () => {
  setup({ defaultValue: ['apple'], disabled: true });
  expect(screen.queryByRole('button', { name: 'Remove Apple' })).toBeNull();
  expect(input().props.editable).toBe(false);
});

test('tapping outside closes the popup and drops the typed text', () => {
  setup();
  fireEvent.changeText(input(), 'ba');
  fireEvent.press(screen.getByTestId('combobox-backdrop-bottom'));
  settle();
  expect(options()).toHaveLength(0);
  expect(input().props.value).toBe('');
});

const grouped = [
  { value: 'Fruits', items: ['Apple', 'Banana'] },
  { value: 'Vegetables', items: ['Carrot', 'Leek'] },
];

describe('groups', () => {
  test('the default list renders a label per group and every item', () => {
    render(
      <PortalHost>
        <Combobox items={grouped} defaultOpen>
          <ComboboxChips><ComboboxChipsInput placeholder="Add" /></ComboboxChips>
          <ComboboxContent><ComboboxList /></ComboboxContent>
        </Combobox>
      </PortalHost>,
    );
    expect(screen.getByText('Fruits')).toBeOnTheScreen();
    expect(screen.getByText('Vegetables')).toBeOnTheScreen();
    expect(options()).toHaveLength(4);
  });

  test('filtering drops groups with no match', () => {
    render(
      <PortalHost>
        <Combobox items={grouped} defaultOpen>
          <ComboboxChips><ComboboxChipsInput placeholder="Add" /></ComboboxChips>
          <ComboboxContent><ComboboxList /></ComboboxContent>
        </Combobox>
      </PortalHost>,
    );
    fireEvent.changeText(screen.getByPlaceholderText('Add'), 'lee');
    expect(screen.queryByText('Fruits')).toBeNull();
    expect(screen.getByText('Vegetables')).toBeOnTheScreen();
    expect(options()).toHaveLength(1);
  });

  test('custom group rendering with label, collection and separator', () => {
    render(
      <PortalHost>
        <Combobox items={grouped} defaultOpen>
          <ComboboxChips><ComboboxChipsInput placeholder="Add" /></ComboboxChips>
          <ComboboxContent>
            <ComboboxList<ComboboxOptionGroup>>
              {(group, index) => (
                <ComboboxGroup items={group.items}>
                  <ComboboxLabel>{`${group.value}!`}</ComboboxLabel>
                  <ComboboxCollection>
                    {(item) => <ComboboxItem value={item.value}><Text>{`• ${item.label}`}</Text></ComboboxItem>}
                  </ComboboxCollection>
                  {index < grouped.length - 1 ? <ComboboxSeparator /> : null}
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </PortalHost>,
    );
    expect(screen.getByText('Fruits!')).toBeOnTheScreen();
    expect(screen.getByText('• Leek')).toBeOnTheScreen();
  });
});
