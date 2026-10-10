import { createRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/lib/portal';
import { Dialog, DialogContent } from '@/registry/marcn/ui/dialog';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
  type SelectProps, type SelectTriggerProps,
} from '@/registry/marcn/ui/select';

type Measure = (cb: (x: number, y: number, w: number, h: number) => void) => void;

function setup(props: SelectProps = {}, trigger: SelectTriggerProps = {}, measure?: Measure) {
  const ref = createRef<View>();
  render(
    <PortalHost>
      <Select {...props}>
        <SelectTrigger ref={ref} testID="trigger" {...trigger}>
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent testID="list">
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana" label="Banana!">Banana</SelectItem>
            <SelectSeparator />
            <SelectItem value="cherry" disabled>Cherry</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
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

test('shows the placeholder and a collapsed combobox', () => {
  setup();
  expect(screen.getByText('Pick a fruit')).toBeOnTheScreen();
  expect(screen.getByRole('combobox')).toBeCollapsed();
});

test('opens a list of options; the selected one is marked', () => {
  setup({ defaultValue: 'apple' });
  open();
  expect(screen.getByRole('combobox', { includeHiddenElements: true })).toBeExpanded();
  expect(screen.getAllByRole('option')).toHaveLength(3);
  expect(screen.getByRole('option', { selected: true })).toHaveTextContent('Apple');
});

test('choosing an item sets the value, notifies and closes', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  open();
  fireEvent.press(screen.getByText('Apple'));
  expect(onValueChange).toHaveBeenCalledWith('apple');
  settle();
  expect(screen.queryByRole('option')).toBeNull();
  expect(screen.getByText('Apple')).toBeOnTheScreen();
});

test('the trigger shows the label of a defaultValue before the list was ever opened', () => {
  setup({ defaultValue: 'banana' });
  expect(screen.getByText('Banana!')).toBeOnTheScreen();
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

test('selecting the current value does not notify again', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: 'apple', onValueChange });
  open();
  fireEvent.press(screen.getByRole('option', { selected: true }));
  expect(onValueChange).not.toHaveBeenCalled();
});

test('a disabled select never opens', () => {
  setup({ disabled: true });
  open();
  expect(screen.queryByRole('option')).toBeNull();
  expect(screen.getByRole('combobox')).toBeDisabled();
});

test('a disabled item never selects or closes', () => {
  const onValueChange = jest.fn();
  setup({ onValueChange });
  open();
  fireEvent.press(screen.getByText('Cherry'));
  settle();
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByText('Cherry')).toBeOnTheScreen();
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

test('the list is at least as wide as the trigger and below it', () => {
  setup({}, {}, (cb) => cb(100, 100, 200, 36));
  open();
  fireEvent(screen.getByTestId('list'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 120, height: 80 } } });
  expect(StyleSheet.flatten(screen.getByTestId('list').props.style)).toMatchObject({ minWidth: 200, left: 100, top: 140 });
});

test('zero measurements never produce NaN', () => {
  setup({}, {}, (cb) => cb(0, 0, 0, 0));
  open();
  fireEvent(screen.getByTestId('list'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 0, height: 0 } } });
  const { left, top } = StyleSheet.flatten(screen.getByTestId('list').props.style);
  expect(Number.isFinite(left) && Number.isFinite(top)).toBe(true);
});

test('size sm shrinks the trigger', () => {
  setup({}, { size: 'sm' });
  expect(StyleSheet.flatten(screen.getByTestId('trigger').props.style).height).toBe(32);
});

test('works inside a Dialog: choosing closes only the list', () => {
  render(
    <PortalHost>
      <Dialog defaultOpen>
        <DialogContent>
          <Text>Dialog body</Text>
          <Select>
            <SelectTrigger testID="trigger"><SelectValue placeholder="Pick" /></SelectTrigger>
            <SelectContent><SelectItem value="a">Alpha</SelectItem></SelectContent>
          </Select>
        </DialogContent>
      </Dialog>
    </PortalHost>,
  );
  open();
  fireEvent.press(screen.getByText('Alpha'));
  settle();
  expect(screen.queryByRole('option')).toBeNull();
  expect(screen.getByText('Dialog body')).toBeOnTheScreen();
  expect(screen.getByText('Alpha')).toBeOnTheScreen();
});

test('selected and unselected options reserve the same indicator space', () => {
  setup({ defaultValue: 'apple' });
  open();
  const right = (label: string) => StyleSheet.flatten(screen.getByRole('option', { name: label }).props.style).paddingRight;
  expect(right('Banana')).toBe(right('Apple'));
  expect(right('Apple')).toBeGreaterThan(8);
});
