import { Keyboard } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useComboboxState, type ComboboxStateOptions } from '@/registry/marcn/ui/combobox';

const items = ['Apple', 'Banana', { value: 'c', label: 'Cherry', disabled: true }];

const setup = (options: Partial<ComboboxStateOptions> = {}) =>
  renderHook((props: Partial<ComboboxStateOptions>) => useComboboxState({ items, ...props }), { initialProps: options });

afterEach(() => jest.restoreAllMocks());

test('single: select sets the value, fills the input and closes; selecting it again keeps it', () => {
  const onValueChange = jest.fn<void, [string | null]>();
  const { result } = setup({ defaultOpen: true, onValueChange });
  act(() => result.current.select('Banana'));
  expect(onValueChange).toHaveBeenLastCalledWith('Banana');
  expect(result.current.open).toBe(false);
  expect(result.current.inputValue).toBe('Banana');
  expect(result.current.selected).toEqual([{ value: 'Banana', label: 'Banana' }]);
  act(() => result.current.setOpen(true));
  act(() => result.current.select('Banana'));
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(result.current.open).toBe(false);
});

test('multiple: select toggles, keeps the popup open and clears the typed text', () => {
  const { result } = setup({ multiple: true, defaultOpen: true });
  act(() => result.current.typeText('ba'));
  act(() => result.current.select('Banana'));
  expect(result.current.inputValue).toBe('');
  act(() => result.current.select('Apple'));
  expect(result.current.selected.map((o) => o.value)).toEqual(['Banana', 'Apple']);
  act(() => result.current.select('Banana'));
  expect(result.current.selected.map((o) => o.value)).toEqual(['Apple']);
  expect(result.current.open).toBe(true);
});

test('typing opens the popup and filters; the selected label shown on open does not', () => {
  const { result } = setup({ defaultValue: 'Apple' });
  expect(result.current.inputValue).toBe('Apple');
  act(() => result.current.setOpen(true));
  expect(result.current.query).toBe('');
  expect(result.current.filtered).toHaveLength(3);
  act(() => result.current.typeText('Ban'));
  expect(result.current.open).toBe(true);
  expect(result.current.query).toBe('Ban');
  expect(result.current.filtered.map((o) => o.value)).toEqual(['Banana']);
});

test('single: emptying the text clears the value', () => {
  const onValueChange = jest.fn();
  const { result } = setup({ defaultValue: 'Apple', onValueChange });
  act(() => result.current.typeText(''));
  expect(onValueChange).toHaveBeenCalledWith(null);
  expect(result.current.selected).toEqual([]);
});

test('closing reverts the text to the selected label and dismisses the keyboard', () => {
  const dismiss = jest.spyOn(Keyboard, 'dismiss');
  const { result } = setup({ defaultValue: 'Apple', defaultOpen: true });
  act(() => result.current.typeText('ban'));
  act(() => result.current.setOpen(false));
  expect(dismiss).toHaveBeenCalled();
  expect(result.current.inputValue).toBe('Apple');
  expect(result.current.query).toBe('');
});

test('closing a multiple combobox drops the typed text; without a value single drops it too', () => {
  const multi = setup({ multiple: true, defaultOpen: true });
  act(() => multi.result.current.typeText('ban'));
  act(() => multi.result.current.setOpen(false));
  expect(multi.result.current.inputValue).toBe('');
  const single = setup({ defaultOpen: true });
  act(() => single.result.current.typeText('ban'));
  act(() => single.result.current.setOpen(false));
  expect(single.result.current.inputValue).toBe('');
});

test('a controlled value changing while closed updates the text', () => {
  const { result, rerender } = setup({ value: 'Apple' });
  expect(result.current.inputValue).toBe('Apple');
  rerender({ value: 'Banana' });
  expect(result.current.inputValue).toBe('Banana');
  rerender({ value: null });
  expect(result.current.inputValue).toBe('');
});

test('onInputValueChange reports typing and selection; controlled inputValue only follows the prop', () => {
  const onInputValueChange = jest.fn();
  const { result } = setup({ inputValue: 'x', onInputValueChange, defaultOpen: true });
  act(() => result.current.typeText('xy'));
  expect(onInputValueChange).toHaveBeenLastCalledWith('xy');
  expect(result.current.inputValue).toBe('x');
  act(() => result.current.select('Apple'));
  expect(onInputValueChange).toHaveBeenLastCalledWith('Apple');
});

test('submit picks the first enabled match of the typed text', () => {
  const { result } = setup({ defaultOpen: true });
  act(() => result.current.typeText('an'));
  act(() => result.current.submit());
  expect(result.current.selected.map((o) => o.value)).toEqual(['Banana']);
  act(() => result.current.setOpen(true));
  act(() => result.current.typeText('cher'));
  act(() => result.current.submit());
  expect(result.current.selected.map((o) => o.value)).toEqual(['Banana']);
});

test('clear empties the value and the text', () => {
  const single = setup({ defaultValue: 'Apple' });
  act(() => single.result.current.clear());
  expect(single.result.current.selected).toEqual([]);
  expect(single.result.current.inputValue).toBe('');
  const multi = setup({ multiple: true, defaultValue: ['Apple', 'Banana'] });
  act(() => multi.result.current.clear());
  expect(multi.result.current.selected).toEqual([]);
});

test('remove drops one value; removeLast drops the last', () => {
  const { result } = setup({ multiple: true, defaultValue: ['Apple', 'Banana'] });
  act(() => result.current.remove('Apple'));
  expect(result.current.selected.map((o) => o.value)).toEqual(['Banana']);
  act(() => result.current.removeLast());
  expect(result.current.selected).toEqual([]);
});

test('disabled: never opens and ignores selection', () => {
  const onValueChange = jest.fn();
  const { result } = setup({ disabled: true, onValueChange, defaultValue: 'Apple' });
  act(() => result.current.setOpen(true));
  expect(result.current.open).toBe(false);
  act(() => result.current.select('Apple'));
  act(() => result.current.clear());
  expect(onValueChange).not.toHaveBeenCalled();
});

test('labelOf falls back to the raw value; data-disabled options never select', () => {
  const onValueChange = jest.fn();
  const { result } = setup({ onValueChange });
  expect(result.current.labelOf('c')).toBe('Cherry');
  expect(result.current.labelOf('zzz')).toBe('zzz');
  act(() => result.current.select('c'));
  expect(onValueChange).not.toHaveBeenCalled();
  expect(result.current.isDisabled('c')).toBe(true);
});

test('groups: rows keep the structure, filtered is the flat list of matches', () => {
  const grouped = [{ value: 'Fruits', items: ['Apple', 'Banana'] }, { value: 'Veg', items: ['Carrot'] }];
  const { result } = setup({ items: grouped });
  expect(result.current.rows).toHaveLength(2);
  expect(result.current.filtered).toHaveLength(3);
  act(() => result.current.typeText('car'));
  expect(result.current.rows).toHaveLength(1);
  expect(result.current.filtered.map((o) => o.value)).toEqual(['Carrot']);
});

test('typing while closed opens the popup and keeps the typed filter', () => {
  const { result } = setup();
  act(() => result.current.typeText('ban'));
  expect(result.current.open).toBe(true);
  expect(result.current.query).toBe('ban');
  expect(result.current.filtered.map((o) => o.value)).toEqual(['Banana']);
});

test('submit without typed text changes nothing; a single combobox closes', () => {
  const onValueChange = jest.fn();
  const single = setup({ defaultValue: 'Banana', defaultOpen: true, onValueChange });
  act(() => single.result.current.submit());
  expect(onValueChange).not.toHaveBeenCalled();
  expect(single.result.current.open).toBe(false);
  const multi = setup({ multiple: true, defaultOpen: true, onValueChange });
  act(() => multi.result.current.submit());
  expect(onValueChange).not.toHaveBeenCalled();
  expect(multi.result.current.open).toBe(true);
});

test('anchorTick bumps when an anchor reports a layout', () => {
  const { result } = setup();
  const before = result.current.anchorTick;
  act(() => result.current.bumpAnchor());
  expect(result.current.anchorTick).toBe(before + 1);
});
