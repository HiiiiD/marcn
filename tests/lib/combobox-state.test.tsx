import { Keyboard } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useComboboxState, type ComboboxStateOptions } from '@/registry/marcn/lib/combobox-state';

const items = ['Apple', 'Banana', { value: 'c', label: 'Cherry', disabled: true }];

const setup = (options: Partial<ComboboxStateOptions> = {}) =>
  renderHook((props: Partial<ComboboxStateOptions>) => useComboboxState({ items, ...props }), { initialProps: options });

afterEach(() => jest.restoreAllMocks());

test('single: select sets the value and closes; selecting it again clears', () => {
  const onValueChange = jest.fn<void, [string | null]>();
  const { result } = setup({ defaultOpen: true, onValueChange });
  act(() => result.current.select('Apple'));
  expect(onValueChange).toHaveBeenLastCalledWith('Apple');
  expect(result.current.open).toBe(false);
  expect(result.current.selected).toEqual([{ value: 'Apple', label: 'Apple' }]);
  act(() => result.current.select('Apple'));
  expect(onValueChange).toHaveBeenLastCalledWith(null);
  expect(result.current.selected).toEqual([]);
});

test('multiple: select toggles and keeps the popup open', () => {
  const { result } = setup({ multiple: true, defaultOpen: true });
  act(() => result.current.select('Banana'));
  act(() => result.current.select('Apple'));
  expect(result.current.selected.map((o) => o.value)).toEqual(['Banana', 'Apple']);
  act(() => result.current.select('Banana'));
  expect(result.current.selected.map((o) => o.value)).toEqual(['Apple']);
  expect(result.current.open).toBe(true);
});

test('submit picks the first enabled match of the query', () => {
  const { result } = setup({ defaultOpen: true });
  act(() => result.current.setQuery('an'));
  act(() => result.current.submit());
  expect(result.current.selected.map((o) => o.value)).toEqual(['Banana']);
  act(() => result.current.setOpen(true));
  act(() => result.current.setQuery('cher'));
  act(() => result.current.submit());
  expect(result.current.selected.map((o) => o.value)).toEqual(['Banana']);
});

test('the query resets when the popup opens and the keyboard goes away when it closes', () => {
  const dismiss = jest.spyOn(Keyboard, 'dismiss');
  const { result } = setup({ defaultOpen: true });
  act(() => result.current.setQuery('ban'));
  act(() => result.current.setOpen(false));
  expect(dismiss).toHaveBeenCalled();
  expect(result.current.query).toBe('ban');
  act(() => result.current.setOpen(true));
  expect(result.current.query).toBe('');
});

test('disabled: never opens and ignores selection', () => {
  const onValueChange = jest.fn();
  const { result } = setup({ disabled: true, onValueChange });
  act(() => result.current.setOpen(true));
  expect(result.current.open).toBe(false);
  act(() => result.current.select('Apple'));
  expect(onValueChange).not.toHaveBeenCalled();
});

test('labelOf falls back to the raw value', () => {
  const { result } = setup();
  expect(result.current.labelOf('c')).toBe('Cherry');
  expect(result.current.labelOf('zzz')).toBe('zzz');
});
