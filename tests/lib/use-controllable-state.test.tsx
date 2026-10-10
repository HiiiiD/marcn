import { act, renderHook } from '@testing-library/react-native';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';

test('uncontrolled: starts at defaultValue and updates on set', () => {
  const onChange = jest.fn();
  const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
  expect(result.current[0]).toBe(1);
  act(() => result.current[1](2));
  expect(result.current[0]).toBe(2);
  expect(onChange).toHaveBeenCalledWith(2);
});

test('controlled: value follows the prop, set only notifies', () => {
  const onChange = jest.fn();
  const { result, rerender } = renderHook(({ value }: { value: number }) => useControllableState({ value, defaultValue: 0, onChange }), {
    initialProps: { value: 5 },
  });
  act(() => result.current[1](6));
  expect(result.current[0]).toBe(5);
  expect(onChange).toHaveBeenCalledWith(6);
  rerender({ value: 6 });
  expect(result.current[0]).toBe(6);
});

test('does not notify when the value is unchanged', () => {
  const onChange = jest.fn();
  const { result } = renderHook(() => useControllableState({ defaultValue: 'a', onChange }));
  act(() => result.current[1]('a'));
  expect(onChange).not.toHaveBeenCalled();
});

test('setter keeps its identity across renders', () => {
  const { result, rerender } = renderHook(() => useControllableState({ defaultValue: 0 }));
  const first = result.current[1];
  rerender({});
  expect(result.current[1]).toBe(first);
});

test('an empty string is a controlled value, not "uncontrolled"', () => {
  const { result } = renderHook(() => useControllableState({ value: '', defaultValue: 'x' }));
  expect(result.current[0]).toBe('');
});
