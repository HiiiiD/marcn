import { createRef } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/ui/portal';
import { Dialog, DialogContent } from '@/registry/marcn/ui/dialog';
import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, type ComboboxProps,
} from '@/registry/marcn/ui/combobox';
import { mockBackHandler } from '../../back-handler';

type Measure = (cb: (x: number, y: number, w: number, h: number) => void) => void;

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

function setup(props: Partial<ComboboxProps> = {}, inputProps: Partial<Parameters<typeof ComboboxInput>[0]> = {}) {
  render(
    <PortalHost>
      <Combobox {...({ items: fruits, ...props } as ComboboxProps)}>
        <ComboboxInput placeholder="Pick a fruit" {...inputProps} />
        <ComboboxContent testID="popup">
          <ComboboxEmpty>No fruit found.</ComboboxEmpty>
          <ComboboxList testID="list" />
        </ComboboxContent>
      </Combobox>
    </PortalHost>,
  );
}

const measureAnchor = (x = 100, y = 100, width = 260, height = 36) =>
  jest.spyOn(View.prototype as unknown as { measureInWindow: Measure }, 'measureInWindow').mockImplementation((cb) => cb(x, y, width, height));

beforeEach(() => {
  jest.useFakeTimers();
  measureAnchor();
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const input = () => screen.getByPlaceholderText('Pick a fruit');
const focus = () => fireEvent(input(), 'focus');
const type = (text: string) => fireEvent.changeText(input(), text);
const submit = () => fireEvent(input(), 'submitEditing');
const settle = () => act(() => { jest.advanceTimersByTime(200); });
const options = () => screen.queryAllByRole('option');
const onlyOption = (label: string) => {
  expect(options()).toHaveLength(1);
  expect(screen.getByRole('option')).toHaveTextContent(label);
};

test('renders an inline input as a collapsed combobox with a chevron', () => {
  setup();
  expect(screen.getByRole('combobox')).toBeCollapsed();
  expect(input().props.value).toBe('');
  expect(screen.getByRole('button', { name: 'Show options' })).toBeOnTheScreen();
  expect(options()).toHaveLength(0);
});

test('showTrigger={false} hides the chevron', () => {
  setup({}, { showTrigger: false });
  expect(screen.queryByRole('button', { name: 'Show options' })).toBeNull();
});

test('focusing the input opens every option; the selected one is marked', () => {
  setup({ defaultValue: 'banana' });
  expect(input().props.value).toBe('Banana');
  focus();
  expect(screen.getByRole('combobox', { includeHiddenElements: true })).toBeExpanded();
  expect(options()).toHaveLength(4);
  expect(screen.getByRole('option', { selected: true })).toHaveTextContent('Banana');
});

test('pressing the focused input opens the popup again after back hid it', () => {
  const back = mockBackHandler();
  setup();
  focus();
  act(() => { back.press(); });
  settle();
  expect(options()).toHaveLength(0);
  fireEvent(input(), 'pressIn');
  expect(options()).toHaveLength(4);
});

test('typing opens the popup and filters the options', () => {
  setup();
  type('an');
  onlyOption('Banana');
  expect(input().props.value).toBe('an');
});

test('typed text is matched ignoring case and accents', () => {
  setup({ items: ['Crème brûlée', 'Tiramisù'] });
  type('CREME');
  onlyOption('Crème brûlée');
});

test('with a value selected, opening lists everything and typing filters', () => {
  setup({ defaultValue: 'apple' });
  focus();
  expect(options()).toHaveLength(4);
  type('dat');
  onlyOption('Date');
});

test('no match shows the empty state and hides the list', () => {
  setup();
  focus();
  expect(screen.queryByText('No fruit found.')).toBeNull();
  type('kiwi');
  expect(screen.getByText('No fruit found.')).toBeOnTheScreen();
  expect(screen.queryByTestId('list')).toBeNull();
});

test('choosing an option fills the input, notifies and closes', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  type('ap');
  fireEvent.press(screen.getByText('Apple'));
  expect(onValueChange).toHaveBeenCalledWith('apple');
  settle();
  expect(options()).toHaveLength(0);
  expect(input().props.value).toBe('Apple');
});

test('pressing the selected option keeps it and closes', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: 'apple', onValueChange });
  focus();
  fireEvent.press(screen.getByRole('option', { selected: true }));
  expect(onValueChange).not.toHaveBeenCalled();
  settle();
  expect(options()).toHaveLength(0);
  expect(input().props.value).toBe('Apple');
});

test('emptying the text clears the value', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: 'apple', onValueChange });
  type('');
  expect(onValueChange).toHaveBeenCalledWith(null);
});

test('controlled: notifies but only follows the value prop', () => {
  const onValueChange = jest.fn();
  setup({ value: 'apple', onValueChange });
  focus();
  fireEvent.press(screen.getByText('Banana'));
  expect(onValueChange).toHaveBeenCalledWith('banana');
  settle();
  expect(input().props.value).toBe('Apple');
});

test('a value missing from the items shows the raw value', () => {
  setup({ value: 'kiwi' });
  expect(input().props.value).toBe('kiwi');
});

test('Enter selects the first enabled match', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  type('e');
  submit();
  expect(onValueChange).toHaveBeenCalledWith('apple');
  settle();
  expect(options()).toHaveLength(0);
});

test('Enter skips disabled matches and does nothing without a match', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  type('ch');
  submit();
  type('zzz');
  submit();
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByText('No fruit found.')).toBeOnTheScreen();
});

test('Enter on an already-selected first match keeps it and closes', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: 'apple', onValueChange });
  type('app');
  submit();
  expect(onValueChange).not.toHaveBeenCalled();
  settle();
  expect(options()).toHaveLength(0);
  expect(input().props.value).toBe('Apple');
});

test('Enter keeps the input focused so a missed query can be corrected', () => {
  setup();
  expect(input().props.submitBehavior).toBe('submit');
  expect(input().props.returnKeyType).toBe('search');
});

test('a disabled option never selects', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  focus();
  fireEvent.press(screen.getByText('Cherry'));
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByRole('option', { name: 'Cherry' })).toBeDisabled();
});

test('a disabled combobox is not editable and never opens', () => {
  setup({ disabled: true });
  focus();
  type('a');
  expect(options()).toHaveLength(0);
  expect(input().props.editable).toBe(false);
  expect(screen.getByRole('combobox')).toBeDisabled();
});

test('tapping outside dismisses without changing the value and restores the label', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange, defaultValue: 'apple' });
  type('ban');
  fireEvent.press(screen.getByTestId('combobox-backdrop-bottom'));
  settle();
  expect(options()).toHaveLength(0);
  expect(onValueChange).not.toHaveBeenCalled();
  expect(input().props.value).toBe('Apple');
});

test('Android back closes the popup', () => {
  const back = mockBackHandler();
  setup();
  focus();
  act(() => { back.press(); });
  settle();
  expect(options()).toHaveLength(0);
});

test('reopening after closing starts from the full list', () => {
  setup();
  type('ban');
  fireEvent.press(screen.getByTestId('combobox-backdrop-bottom'));
  settle();
  expect(input().props.value).toBe('');
  focus();
  expect(options()).toHaveLength(4);
});

test('onInputValueChange reports typing', () => {
  const onInputValueChange = jest.fn();
  setup({ onInputValueChange });
  type('ch');
  expect(onInputValueChange).toHaveBeenCalledWith('ch');
});

test('filter={null} leaves filtering to the caller', () => {
  setup({ filter: null });
  type('zzz');
  expect(options()).toHaveLength(4);
  expect(screen.queryByText('No fruit found.')).toBeNull();
});

test('a custom filter replaces the default', () => {
  setup({ filter: (o, q) => o.value.startsWith(q) });
  type('d');
  onlyOption('Date');
});

test('keywords match', () => {
  setup({ items: [{ value: 'us', label: 'United States', keywords: ['USA'] }, 'Italy'] });
  type('usa');
  onlyOption('United States');
});

test('string items are both value and label', () => {
  render(
    <PortalHost>
      <Combobox items={['Red', 'Green']} defaultOpen>
        <ComboboxInput placeholder="Color" />
        <ComboboxContent><ComboboxList /></ComboboxContent>
      </Combobox>
    </PortalHost>,
  );
  expect(options()).toHaveLength(2);
});

test('the list render function receives the item with its extra fields', () => {
  const people = [{ value: 'ada', label: 'Ada Lovelace', role: 'Engineer' }];
  render(
    <PortalHost>
      <Combobox items={people} defaultOpen>
        <ComboboxInput placeholder="Who" />
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

test('a data-disabled option stays disabled in a custom render function', () => {
  const onValueChange = jest.fn();
  render(
    <PortalHost>
      <Combobox items={fruits} defaultOpen onValueChange={onValueChange}>
        <ComboboxInput placeholder="Fruit" />
        <ComboboxContent>
          <ComboboxList>{(item) => <ComboboxItem value={item.value}><Text>{item.label}</Text></ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </PortalHost>,
  );
  expect(screen.getByRole('option', { name: 'Cherry' })).toBeDisabled();
  fireEvent.press(screen.getByText('Cherry'));
  expect(onValueChange).not.toHaveBeenCalled();
});

test('the list keeps taps working while the keyboard is open', () => {
  setup();
  focus();
  expect(screen.UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps).toBe('handled');
});

describe('placement', () => {
  const open = () => {
    focus();
    fireEvent(screen.getByTestId('popup'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 260, height: 120 } } });
  };

  test('the popup is as wide as the input and below it', () => {
    setup();
    open();
    expect(StyleSheet.flatten(screen.getByTestId('popup').props.style)).toMatchObject({ width: 260, left: 100, top: 140 });
  });

  test('with the keyboard up and no room below, the popup opens above the input', () => {
    jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
    jest.spyOn(Keyboard, 'metrics').mockReturnValue({ height: 400, screenX: 0, screenY: 0, width: 750 });
    render(
      <PortalHost>
        <Combobox items={fruits}>
          <ComboboxInput placeholder="Pick a fruit" />
          <ComboboxContent testID="popup"><ComboboxList /></ComboboxContent>
        </Combobox>
      </PortalHost>,
    );
    measureAnchor(100, 800);
    focus();
    fireEvent(screen.getByTestId('popup'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 260, height: 120 } } });
    expect(StyleSheet.flatten(screen.getByTestId('popup').props.style).top).toBe(800 - 4 - 120);
  });

  test('the backdrop leaves the input uncovered so it stays tappable', () => {
    setup();
    open();
    const style = (id: string) => StyleSheet.flatten(screen.getByTestId(`combobox-backdrop-${id}`).props.style);
    expect(style('top')).toMatchObject({ top: 0, height: 100 });
    expect(style('bottom')).toMatchObject({ top: 136, bottom: 0 });
    expect(style('left')).toMatchObject({ left: 0, width: 100, top: 100, height: 36 });
    expect(style('right')).toMatchObject({ left: 360, right: 0, top: 100, height: 36 });
  });
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
        <ComboboxInput placeholder="Pick a fruit" />
        <ComboboxContent>
          <ComboboxList>{(item) => <ComboboxItem value={item.value} ref={item.value === 'n150' ? ref : undefined} />}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </PortalHost>,
  );
  focus();
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
            <ComboboxInput placeholder="Pick a fruit" />
            <ComboboxContent><ComboboxList /></ComboboxContent>
          </Combobox>
        </DialogContent>
      </Dialog>
    </PortalHost>,
  );
  focus();
  fireEvent.press(screen.getByText('Banana'));
  settle();
  expect(options()).toHaveLength(0);
  expect(screen.getByText('Dialog body')).toBeOnTheScreen();
  expect(input().props.value).toBe('Banana');
});

describe('trigger and clear', () => {
  test('the chevron opens the list, focuses the input, and a second press closes it', () => {
    const focusInput = jest.spyOn(TextInput.prototype as unknown as { focus: () => void }, 'focus').mockImplementation(() => {});
    setup();
    fireEvent.press(screen.getByRole('button', { name: 'Show options' }));
    expect(options()).toHaveLength(4);
    expect(focusInput).toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: 'Show options' }));
    settle();
    expect(options()).toHaveLength(0);
  });

  test('showClear appears only with something to clear and resets the typed text', () => {
    setup({}, { showClear: true });
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
    type('ban');
    expect(screen.getByRole('button', { name: 'Clear' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Clear' }));
    expect(input().props.value).toBe('');
    expect(options()).toHaveLength(4);
  });

  test('clearing a selected value notifies null', () => {
    const onValueChange = jest.fn();
    setup({ onValueChange, defaultValue: 'apple' }, { showClear: true });
    fireEvent.press(screen.getByRole('button', { name: 'Clear' }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(input().props.value).toBe('');
  });
});

test('selected labels survive the items changing (server-side filtering)', () => {
  const ui = (items: { value: string; label: string }[]) => (
    <PortalHost>
      <Combobox items={items} defaultValue="u1" filter={null}>
        <ComboboxInput placeholder="Pick a fruit" />
      </Combobox>
    </PortalHost>
  );
  render(ui([{ value: 'u1', label: 'Ada' }]));
  screen.rerender(ui([{ value: 'u2', label: 'Grace' }]));
  expect(input().props.value).toBe('Ada');
});

test('Enter with untouched text keeps the value and just closes', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: 'banana', onValueChange });
  focus();
  submit();
  expect(onValueChange).not.toHaveBeenCalled();
  settle();
  expect(options()).toHaveLength(0);
  expect(input().props.value).toBe('Banana');
});

describe('disabled input part', () => {
  test('never opens, by focus, press or chevron, and cannot be cleared', () => {
    setup({ defaultValue: 'apple' }, { disabled: true, showClear: true });
    focus();
    fireEvent(input(), 'pressIn');
    expect(options()).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Show options' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
  });
});

test('the popup follows an anchor that moves after opening', () => {
  setup();
  focus();
  const top = () => StyleSheet.flatten(screen.getByTestId('combobox-backdrop-top').props.style).height;
  expect(top()).toBe(100);
  measureAnchor(100, 180);
  fireEvent(screen.getByTestId('combobox-anchor'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 260, height: 72 } } });
  expect(top()).toBe(180);
});

test('without a measured anchor there is no backdrop to swallow taps', () => {
  jest.spyOn(View.prototype as unknown as { measureInWindow: Measure }, 'measureInWindow').mockImplementation(() => {});
  setup();
  focus();
  expect(screen.queryByTestId('combobox-backdrop-top')).toBeNull();
});
