import { createRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/lib/portal';
import { Dialog, DialogContent } from '@/registry/marcn/ui/dialog';
import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue,
  type ComboboxProps,
} from '@/registry/marcn/ui/combobox';

type Measure = (cb: (x: number, y: number, w: number, h: number) => void) => void;

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

function setup(props: Partial<ComboboxProps> = {}, measure?: Measure) {
  const ref = createRef<View>();
  render(
    <PortalHost>
      <Combobox {...({ items: fruits, ...props } as ComboboxProps)}>
        <ComboboxTrigger ref={ref} testID="trigger">
          <ComboboxValue placeholder="Pick a fruit" />
        </ComboboxTrigger>
        <ComboboxContent testID="popup">
          <ComboboxInput placeholder="Search fruit..." />
          <ComboboxEmpty>No fruit found.</ComboboxEmpty>
          <ComboboxList testID="list" />
        </ComboboxContent>
      </Combobox>
    </PortalHost>,
  );
  if (measure) ref.current!.measureInWindow = measure as never;
  return ref;
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const open = () => fireEvent.press(screen.getByTestId('trigger'));
const settle = () => act(() => { jest.advanceTimersByTime(200); });
const search = () => screen.getByPlaceholderText('Search fruit...');
const type = (text: string) => fireEvent.changeText(search(), text);
const submit = () => fireEvent(search(), 'submitEditing');
const onlyOption = (label: string) => {
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(screen.getByRole('option')).toHaveTextContent(label);
};

test('shows the placeholder and a collapsed combobox', () => {
  setup();
  expect(screen.getByText('Pick a fruit')).toBeOnTheScreen();
  expect(screen.getByRole('combobox')).toBeCollapsed();
});

test('opens a focused search input and every option; the selected one is marked', () => {
  setup({ defaultValue: 'banana' });
  open();
  expect(screen.getByRole('combobox', { includeHiddenElements: true })).toBeExpanded();
  expect(search().props.autoFocus).toBe(true);
  expect(screen.getAllByRole('option')).toHaveLength(4);
  expect(screen.getByRole('option', { selected: true })).toHaveTextContent('Banana');
});

test('typing filters the options', () => {
  setup();
  open();
  type('an');
  onlyOption('Banana');
});

test('no match shows the empty state and hides the list', () => {
  setup();
  open();
  expect(screen.queryByText('No fruit found.')).toBeNull();
  type('kiwi');
  expect(screen.getByText('No fruit found.')).toBeOnTheScreen();
  expect(screen.queryByTestId('list')).toBeNull();
});

test('choosing an option sets the value, notifies and closes', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  open();
  fireEvent.press(screen.getByText('Apple'));
  expect(onValueChange).toHaveBeenCalledWith('apple');
  settle();
  expect(screen.queryByRole('option')).toBeNull();
  expect(screen.getByText('Apple')).toBeOnTheScreen();
});

test('pressing the selected option clears the value', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: 'apple', onValueChange });
  open();
  fireEvent.press(screen.getByRole('option', { selected: true }));
  expect(onValueChange).toHaveBeenCalledWith(null);
  settle();
  expect(screen.getByText('Pick a fruit')).toBeOnTheScreen();
});

test('multiple: options toggle, the popup stays open and the value lists the labels', () => {
  const onValueChange = jest.fn();
  setup({ multiple: true, onValueChange });
  open();
  fireEvent.press(screen.getByText('Date'));
  fireEvent.press(screen.getByRole('option', { name: 'Apple' }));
  expect(onValueChange).toHaveBeenLastCalledWith(['date', 'apple']);
  expect(screen.getAllByRole('option', { selected: true })).toHaveLength(2);
  fireEvent.press(screen.getByRole('option', { name: 'Date' }));
  expect(onValueChange).toHaveBeenLastCalledWith(['apple']);
  settle();
  expect(screen.getAllByRole('option')).toHaveLength(4);
  expect(screen.getAllByText('Apple', { includeHiddenElements: true })).toHaveLength(2);
});

test('multiple: the value joins labels in selection order', () => {
  setup({ multiple: true, defaultValue: ['date', 'apple'] });
  expect(screen.getByText('Date, Apple')).toBeOnTheScreen();
});

test('controlled: notifies but only follows the value prop', () => {
  const onValueChange = jest.fn();
  setup({ value: 'apple', onValueChange });
  open();
  fireEvent.press(screen.getByText('Banana'));
  expect(onValueChange).toHaveBeenCalledWith('banana');
  settle();
  expect(screen.getByText('Apple')).toBeOnTheScreen();
});

test('a value missing from the items shows the raw value', () => {
  setup({ value: 'kiwi' });
  expect(screen.getByText('kiwi')).toBeOnTheScreen();
});

test('Enter selects the first enabled match', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  open();
  type('e');
  submit();
  expect(onValueChange).toHaveBeenCalledWith('apple');
  settle();
  expect(screen.queryByRole('option')).toBeNull();
});

test('Enter skips disabled matches', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  open();
  type('ch');
  submit();
  expect(onValueChange).not.toHaveBeenCalled();
  type('r');
  submit();
  expect(onValueChange).not.toHaveBeenCalledWith('cherry');
});

test('Enter on an already-selected first match keeps it and closes', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: 'apple', onValueChange });
  open();
  type('app');
  submit();
  expect(onValueChange).not.toHaveBeenCalled();
  settle();
  expect(screen.queryByRole('option')).toBeNull();
  expect(screen.getByText('Apple')).toBeOnTheScreen();
});

test('Enter with no match does nothing', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  open();
  type('zzz');
  submit();
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByText('No fruit found.')).toBeOnTheScreen();
});

test('Enter keeps the search focused so a missed query can be corrected', () => {
  setup();
  open();
  expect(search().props.submitBehavior).toBe('submit');
  expect(search().props.returnKeyType).toBe('search');
});

test('a disabled option never selects', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  open();
  fireEvent.press(screen.getByText('Cherry'));
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByRole('option', { name: 'Cherry' })).toBeDisabled();
});

test('a disabled combobox never opens', () => {
  setup({ disabled: true });
  open();
  expect(screen.queryByRole('option')).toBeNull();
  expect(screen.getByRole('combobox')).toBeDisabled();
});

test('backdrop dismisses without changing the value', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  open();
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  settle();
  expect(screen.queryByRole('option')).toBeNull();
  expect(onValueChange).not.toHaveBeenCalled();
});

test('reopening starts with an empty query', () => {
  setup();
  open();
  type('ban');
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  settle();
  open();
  expect(search().props.value).toBe('');
  expect(screen.getAllByRole('option')).toHaveLength(4);
});

test('onInputValueChange reports the query', () => {
  const onInputValueChange = jest.fn();
  setup({ onInputValueChange });
  open();
  type('ch');
  expect(onInputValueChange).toHaveBeenCalledWith('ch');
});

test('filter={null} leaves filtering to the caller', () => {
  setup({ filter: null });
  open();
  type('zzz');
  expect(screen.getAllByRole('option')).toHaveLength(4);
  expect(screen.queryByText('No fruit found.')).toBeNull();
});

test('a custom filter replaces the default', () => {
  setup({ filter: (o, q) => o.value.startsWith(q) });
  open();
  type('d');
  onlyOption('Date');
});

test('string items are both value and label', () => {
  render(
    <PortalHost>
      <Combobox items={['Red', 'Green']} defaultOpen>
        <ComboboxContent>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
    </PortalHost>,
  );
  expect(screen.getAllByRole('option')).toHaveLength(2);
});

test('the list render function receives the item with its extra fields', () => {
  const people = [{ value: 'ada', label: 'Ada Lovelace', role: 'Engineer' }];
  render(
    <PortalHost>
      <Combobox items={people} defaultOpen>
        <ComboboxContent>
          <ComboboxList<(typeof people)[number]>>
            {(item) => (
              <ComboboxItem value={item.value}>
                <Text>{`${item.label} · ${item.role}`}</Text>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </PortalHost>,
  );
  expect(screen.getByText('Ada Lovelace · Engineer')).toBeOnTheScreen();
});

test('a value render function gets the selected options', () => {
  render(
    <PortalHost>
      <Combobox items={fruits} multiple defaultValue={['apple', 'date']}>
        <ComboboxTrigger>
          <ComboboxValue>{(selected) => <Text>{`${selected.length} picked: ${selected[1].label}`}</Text>}</ComboboxValue>
        </ComboboxTrigger>
      </Combobox>
    </PortalHost>,
  );
  expect(screen.getByText('2 picked: Date')).toBeOnTheScreen();
});

test('the list keeps taps working while the keyboard is open', () => {
  setup();
  open();
  expect(screen.UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps).toBe('handled');
});

test('the popup is at least as wide as the trigger and below it', () => {
  setup({}, (cb) => cb(100, 100, 260, 36));
  open();
  fireEvent(screen.getByTestId('popup'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 260, height: 120 } } });
  expect(StyleSheet.flatten(screen.getByTestId('popup').props.style)).toMatchObject({ width: 260, left: 100, top: 140 });
});

test('the popup never gets narrower than 200', () => {
  setup({}, (cb) => cb(10, 10, 80, 36));
  open();
  fireEvent(screen.getByTestId('popup'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 120 } } });
  expect(StyleSheet.flatten(screen.getByTestId('popup').props.style).width).toBe(200);
});

test('a long list opens with the selected option scrolled into view', () => {
  const scrollTo = jest
    .spyOn(ScrollView.prototype as unknown as { scrollTo: (o: { y: number; animated: boolean }) => void }, 'scrollTo')
    .mockImplementation(() => {});
  const ref = createRef<View>();
  const items = Array.from({ length: 300 }, (_, i) => `n${i}`);
  render(
    <PortalHost>
      <Combobox items={items} defaultValue="n150">
        <ComboboxTrigger testID="trigger"><ComboboxValue /></ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList>{(item) => <ComboboxItem value={item.value} ref={item.value === 'n150' ? ref : undefined} />}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </PortalHost>,
  );
  open();
  ref.current!.measureLayout = ((_: unknown, cb: (x: number, y: number) => void) => cb(0, 5400)) as never;
  fireEvent(screen.getByRole('option', { selected: true }), 'layout', { nativeEvent: { layout: { x: 0, y: 5400, width: 100, height: 36 } } });
  expect(scrollTo).toHaveBeenCalledWith({ y: 5392, animated: false });
});

test('works inside a Dialog: choosing closes only the popup', () => {
  render(
    <PortalHost>
      <Dialog defaultOpen>
        <DialogContent>
          <Text>Dialog body</Text>
          <Combobox items={fruits}>
            <ComboboxTrigger testID="trigger"><ComboboxValue placeholder="Pick" /></ComboboxTrigger>
            <ComboboxContent><ComboboxList /></ComboboxContent>
          </Combobox>
        </DialogContent>
      </Dialog>
    </PortalHost>,
  );
  open();
  fireEvent.press(screen.getByText('Banana'));
  settle();
  expect(screen.queryByRole('option')).toBeNull();
  expect(screen.getByText('Dialog body')).toBeOnTheScreen();
  expect(screen.getByText('Banana')).toBeOnTheScreen();
});
